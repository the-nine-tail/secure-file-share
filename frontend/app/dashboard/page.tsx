"use client";
import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "~/app/authentication/AuthenticatedLayout";
import { MainPageStyle } from "./style";
import { StringUtils } from "../utils/string-utils";
import { useAppSelector } from "../store/hooks";
import { apiUrl } from "../constants/authConstant";
import { Table } from '~/app/ui-components/table';
import { Modal } from "../ui-components/modal";
import { LOADING_MODAL } from "../constants/constant";

function validateEncryptedData(encryptedData: ArrayBuffer) {
  // GCM mode requires at least 16 bytes for the auth tag
  // plus 12 bytes for IV plus some ciphertext
  if (encryptedData.byteLength < 28) {
    throw new Error("Encrypted data is too short to be valid");
  }
}

async function getPublicKeyFromServer(userEmail: string): Promise<CryptoKey> {
  // 1) fetch the base64 key from /getPublicKey
  const res = await fetch(`${apiUrl}/getPublicKey/${userEmail}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to get public key for ${userEmail}: ${await res.text()}`);
  }
  const data = await res.json();
  const publicKeyB64 = data.public_key_b64;
  const publicKeyDer = StringUtils.base64ToArrayBuffer(publicKeyB64);

  // 2) Import it as spki
  const pubKey = await window.crypto.subtle.importKey(
    "spki",
    publicKeyDer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
  return pubKey;
}

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [file, setFile] = useState<File | null>(null);
  const [myEmail, setMyEmail] = useState<string | null>(user?.email ?? null);
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [shareWith, setShareWith] = useState<string>("");
  const [downloadFileId, setDownloadFileId] = useState("");
  const [selectedFileId, setSelectedFileId] = useState("");
  const [newShareEmail, setNewShareEmail] = useState("");
  const [removeShareEmail, setRemoveShareEmail] = useState("");
  const [modalProps, setModalProps] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      setMyEmail(user.email);
      loadOrGenerateKeyPair(user.email).catch(console.error);
    }
  }, [user?.email]);

  // -------------------- Key Pair Management --------------------
  async function loadOrGenerateKeyPair(userEmail: string) {
    const localPub = localStorage.getItem(`${userEmail}-pubKey`);
    const localPriv = localStorage.getItem(`${userEmail}-privKey`);

    if (localPub && localPriv) {
      // Already stored, import them
      const pubBuf = StringUtils.base64ToArrayBuffer(localPub);
      const privBuf = StringUtils.base64ToArrayBuffer(localPriv);

      const pubKey = await window.crypto.subtle.importKey(
        "spki",
        pubBuf,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"]
      );
      const privKey = await window.crypto.subtle.importKey(
        "pkcs8",
        privBuf,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"]
      );

      setPublicKey(pubKey);
      setPrivateKey(privKey);
      console.log("Loaded existing key pair from localStorage for", userEmail);
    } else {
      // Generate a new pair
      console.log("Generating new RSA key pair for", userEmail);
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      const exportedPub = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const exportedPriv = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      localStorage.setItem(`${userEmail}-pubKey`, StringUtils.arrayBufferToBase64(exportedPub));
      localStorage.setItem(`${userEmail}-privKey`, StringUtils.arrayBufferToBase64(exportedPriv));

      setPublicKey(keyPair.publicKey);
      setPrivateKey(keyPair.privateKey);

      // Also upload the public key to the server
      await registerPublicKeyOnServer(userEmail, exportedPub);
    }
  }

  async function registerPublicKeyOnServer(userEmail: string, pubKeyBuf: ArrayBuffer) {
    const pubB64 = StringUtils.arrayBufferToBase64(pubKeyBuf);
    const res = await fetch(`${apiUrl}/registerPublicKey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({
        user_email: userEmail,
        public_key_b64: pubB64,
      }),
    });
    if (!res.ok) {
      console.error("Failed to register public key on server:", await res.text());
    } else {
      console.log("Public key registered on server for", userEmail);
    }
  }

  // -------------------- Encrypt & Upload --------------------
  async function handleEncryptAndUpload(_file: File) {
    if (!_file) {
      alert("No file selected.");
      return;
    }
    if (!publicKey || !privateKey) {
      alert("No key pair loaded yet.");
      return;
    }

    try {
      setModalProps("upload");
      // 1) Read the file as ArrayBuffer
      const fileBuffer = await _file.arrayBuffer();

      // 2) Generate ephemeral AES key
      const aesKey = await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256
        },
        true,
        ["encrypt", "decrypt"]
      );

      // 3) Encrypt file with AES
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      let encryptedFileBuf;
      try {
        encryptedFileBuf = await window.crypto.subtle.encrypt(
          { 
            name: "AES-GCM", 
            iv,
            tagLength: 128
          },
          aesKey,
          fileBuffer
        );
      } catch (error: any) {
        console.error("Encryption error:", error);
        throw new Error("Failed to encrypt file: " + error.message);
      }
      // Combine (iv + ciphertext)
      const combined = new Uint8Array(iv.byteLength + encryptedFileBuf.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedFileBuf), iv.byteLength);
      const encryptedFileB64 = StringUtils.arrayBufferToBase64(combined.buffer);

      // 4) For each recipient (including me, so I can re-download), encrypt the same AES key
      //    with that recipient's public key
      const recipientsObj: Record<string, string> = {};
      const shareEmails = shareWith.split(",").map(e => e.trim().toLowerCase());
      // Always include "myEmail" so the owner can decrypt later
      console.log("shareEmails", shareEmails);
      if (!shareEmails.includes(myEmail.toLowerCase())) {
        shareEmails.push(myEmail.toLowerCase());
      }

      // Export the raw AES key
      const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

      // For each user in shareEmails:
      if (shareEmails.length > 0) {
        for (const user of shareEmails) {
          if (!user) continue;
          // Fetch user’s public key from server
          const userPublicKey = await getPublicKeyFromServer(user);
          console.log("userPublicKey", userPublicKey);
          // Encrypt rawAesKey with userPublicKey (RSA-OAEP)
          const encryptedAesKeyBuf = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            userPublicKey,
            rawAesKey
          );
          const encryptedAesKeyB64 = StringUtils.arrayBufferToBase64(encryptedAesKeyBuf);
          recipientsObj[user] = encryptedAesKeyB64;
        } 
      }

      // Get file metadata
      const metadata = {
        filename: _file.name,
        filesize: _file.size,
        filetype: _file.type,
        extension: _file.name.split('.').pop() || '',
        height: null as number | null,
        width: null as number | null,
      };

      // If it's an image, get dimensions
      if (_file.type.startsWith('image/')) {
        const dimensions = await getImageDimensions(_file);
        metadata.height = dimensions.height;
        metadata.width = dimensions.width;
      }

      const response = await fetch(`${apiUrl}/uploadEncryptedE2EE`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          owner: myEmail,
          encryptedFileB64: encryptedFileB64,
          recipients: recipientsObj,
          file_metadata: metadata
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      setModalProps("upload_success");
    } catch (error) {
      console.error("Error in handleEncryptAndUpload:", error);
      setModalProps("upload_failed");
    }
  }

  // -------------------- Download & Decrypt --------------------
  async function handleDownloadAndDecrypt() {
    if (!downloadFileId) {
      alert("No fileId specified.");
      return;
    }
    if (!privateKey) {
      alert("No private key loaded for user.");
      return;
    }
    try {
      // 1) Fetch the encrypted file & key from the server
      // Notice we pass ?user_email=... so the server knows which key to return
      const url = `${apiUrl}/downloadEncryptedE2EE/${downloadFileId}`;
      const res = await fetch(url, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(await res.text());
      } // 0d43f6e6-e97a-4076-b68b-78b26f13adfc
      const { encryptedFileB64, encryptedKeyB64, file_metadata } = await res.json();
      console.log("file_metadata", file_metadata);
      

      // 2) Decrypt the ephemeral AES key with my private key
      const encAesKeyBuf = StringUtils.base64ToArrayBuffer(encryptedKeyB64);
      const rawAesKey = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encAesKeyBuf
      );
      // Re-import as AES
      const aesKey = await window.crypto.subtle.importKey(
        "raw",
        rawAesKey,
        "AES-GCM",
        false,
        ["decrypt"]
      );

      // 3) Decrypt the file data
      const encFileBuf = StringUtils.base64ToArrayBuffer(encryptedFileB64);
      validateEncryptedData(encFileBuf);
      const iv = encFileBuf.slice(0, 12); // first 12 bytes
      const ciphertext = encFileBuf.slice(12);

      const decryptedFileBuf = await window.crypto.subtle.decrypt(
        { 
          name: "AES-GCM", 
          iv,
          tagLength: 128
        },
        aesKey,
        ciphertext
      );

      console.log("File decrypted successfully");

      // 4) Download it
      const file = new Blob([decryptedFileBuf], { type: file_metadata.filetype ?? "application/octet-stream" });
      const blobUrl = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file_metadata.filename ?? "downloaded_file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      console.log(`File decrypted and downloaded as ${file_metadata.filename ?? "downloaded_file"}`);
    } catch (error) {
      console.error("Error in handleDownloadAndDecrypt:", error);
      alert(String(error));
    }
  }

  // Helper function to get image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };
  
  async function handleUpdateSharing() {
    if (!selectedFileId) {
      alert("Please enter a file ID first");
      return;
    }
    if (!privateKey) {
      alert("Please load your private key first");
      return;
    }

    try {
      // 1. Get my encrypted AES key from the server
      const url = `${apiUrl}/downloadEncryptedE2EE/${selectedFileId}?user_email=${myEmail}`;
      const res = await fetch(url, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const { encryptedKeyB64 } = await res.json();

      // 2. Decrypt the AES key with my private key
      const encAesKeyBuf = StringUtils.base64ToArrayBuffer(encryptedKeyB64);
      const rawAesKey = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encAesKeyBuf
      );

      // Prepare the update payload
      const addedKeys: Record<string, string> = {};
      const removedUsers: string[] = [];

      // Handle new share recipient
      if (newShareEmail) {
        // 3. Get the new recipient's public key
        const newUserPublicKey = await getPublicKeyFromServer(newShareEmail);
        
        // 4. Encrypt the AES key for the new recipient
        const encryptedAesKeyBuf = await window.crypto.subtle.encrypt(
          { name: "RSA-OAEP" },
          newUserPublicKey,
          rawAesKey
        );
        const encryptedAesKeyB64 = StringUtils.arrayBufferToBase64(encryptedAesKeyBuf);
        
        // Add to the payload
        addedKeys[newShareEmail] = encryptedAesKeyB64;
      }

      // Handle removal if specified
      if (removeShareEmail) {
        removedUsers.push(removeShareEmail);
      }

      // 5. Send the update to the server
      const updateRes = await fetch(`${apiUrl}/files/${selectedFileId}/recipients`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          added_keys: addedKeys,
          removed_users: removedUsers
        })
      });

      if (!updateRes.ok) {
        throw new Error(await updateRes.text());
      }

      alert('Sharing updated successfully!');
      setNewShareEmail('');
      setRemoveShareEmail('');

    } catch (error) {
      console.error('Error updating sharing:', error);
      alert(`Failed to update sharing: ${error}`);
    }
  }

  const handleFileSelect = (file: File) => {
    setFile(file);
    handleEncryptAndUpload(file);
  };

  return (
    <AuthenticatedLayout 
      allowedRoles={["admin", "user"]}
      onFileSelect={handleFileSelect}
    >
      <Modal
        isOpen={modalProps !== null}
        onClose={() => setModalProps(null)}
        title={modalProps ? LOADING_MODAL[modalProps].title : ""}
        description={modalProps ? LOADING_MODAL[modalProps].description : ""}
        type={modalProps ? LOADING_MODAL[modalProps].type : "loading"}
      />
      <MainPageStyle>
        <div style={{ margin: "2rem" }}>
          <h2>Download & Decrypt File</h2>
          <input
            type="text"
            placeholder="File ID"
            value={downloadFileId}
            onChange={(e) => setDownloadFileId(e.target.value)}
          />
          <button onClick={handleDownloadAndDecrypt}>Decrypt and download file</button>

          <h2>Update File Sharing</h2>
          <input
            type="text"
            placeholder="File ID to modify sharing"
            value={selectedFileId}
            onChange={(e) => setSelectedFileId(e.target.value)}
          />
          <br /><br />

          <input
            type="text"
            placeholder="Add new recipient email"
            value={newShareEmail}
            onChange={(e) => setNewShareEmail(e.target.value)}
          />
          <br />

          <input
            type="text"
            placeholder="Remove recipient email"
            value={removeShareEmail}
            onChange={(e) => setRemoveShareEmail(e.target.value)}
          />
          <br /><br />

          <button onClick={handleUpdateSharing}>Update Sharing</button>
        </div>
      </MainPageStyle>
    </AuthenticatedLayout>
  );
};

export default DashboardPage;
