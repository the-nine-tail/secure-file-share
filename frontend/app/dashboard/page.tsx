"use client";
import React, { useEffect, useState } from "react";
import { BodyPrimaryRegular } from "../ui-components/typing";
import { MainPageStyle } from "./style";
import ProtectedRoute from "../authentication/ProtectedRoute";
import { StringUtils } from "../utils/string-utils";

function validateEncryptedData(encryptedData: ArrayBuffer) {
  // GCM mode requires at least 16 bytes for the auth tag
  // plus 12 bytes for IV plus some ciphertext
  if (encryptedData.byteLength < 28) {
    throw new Error("Encrypted data is too short to be valid");
  }
}

async function getPublicKeyFromServer(userEmail: string): Promise<CryptoKey> {
  // 1) fetch the base64 key from /getPublicKey
  const res = await fetch(`http://localhost:8000/getPublicKey/${userEmail}`, {
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
  // 7cae8974-e66f-458a-a60a-7b1722f067e1
  const [file, setFile] = useState<File | null>(null);
  const [myEmail, setMyEmail] = useState();
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [publicKeyPem, setPublicKeyPem] = useState("");
  const [shareWith, setShareWith] = useState("iamsadu.s@gmail.com");
  const [downloadFileId, setDownloadFileId] = useState("");

  // useEffect(() => {
  //   loadOrGenerateKeyPair(myEmail).catch(console.error);
  // }, [myEmail]);

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
    const res = await fetch("http://localhost:8000/registerPublicKey", {
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
  async function handleEncryptAndUpload() {
    if (!file) {
      alert("No file selected.");
      return;
    }
    if (!publicKey || !privateKey) {
      alert("No key pair loaded yet.");
      return;
    }

    try {
      // 1) Read the file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

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
      } catch (error) {
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
      if (!shareEmails.includes(myEmail.toLowerCase())) {
        shareEmails.push(myEmail.toLowerCase());
      }

      // Export the raw AES key
      const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

      // For each user in shareEmails:
      for (const user of shareEmails) {
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

      // 5) Upload the entire package
      const metadata = {
        filename: file.name,
        filetype: file.type,
        filesize: file.size,
      };

      const res = await fetch("http://localhost:8000/uploadEncryptedE2EE", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          owner: myEmail,
          encryptedFileB64,
          recipients: recipientsObj,
          metadata,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Upload failed: ${errText}`);
      }
      const result = await res.json();
      alert(`Upload success! File ID: ${result.fileId}`);
    } catch (error) {
      console.error("Error in handleEncryptAndUpload:", error);
      alert(String(error));
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
      const url = `http://localhost:8000/downloadEncryptedE2EE/${downloadFileId}?user_email=${"iamsadu.s@gmail.com"}`;
      const res = await fetch(url, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const { encryptedFileB64, encryptedKeyB64 } = await res.json();
      

      // 2) Decrypt the ephemeral AES key with my private key
      const encAesKeyBuf = StringUtils.base64ToArrayBuffer(encryptedKeyB64);
      const rawAesKey = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encAesKeyBuf
      );
      console.log("private key", rawAesKey);
      // Re-import as AES
      const aesKey = await window.crypto.subtle.importKey(
        "raw",
        rawAesKey,
        "AES-GCM",
        false,
        ["decrypt"]
      );

      // 4e5c275b-4b51-443d-92cb-b8a1b0bf6bdf

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
      const blob = new Blob([decryptedFileBuf], { type: "application/octet-stream" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "downloaded_file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      alert(`File decrypted and downloaded as downloaded_file`);
    } catch (error) {
      console.error("Error in handleDownloadAndDecrypt:", error);
      alert(String(error));
    }
  }

  // 1. Fetch the server's RSA public key (PEM format)
  // const fetchPublicKey = async () => {
  //   try {
  //     const res = await fetch("http://localhost:8000/publicKey", {
  //       credentials: 'include',
  //     });
  //     const keyText = await res.text();
  //     setPublicKeyPem(keyText);
  //     alert("Fetched server public key.");
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to fetch public key.");
  //   }
  // };

  // // 2. Encrypt and upload file
  // const encryptAndUpload = async () => {
  //   if (!file) {
  //     alert("Please select a file first!");
  //     return;
  //   }
  //   if (!publicKeyPem) {
  //     alert("Please fetch the server's public key first!");
  //     return;
  //   }

  //   try {
  //     // Read file as ArrayBuffer
  //     const fileBuffer = await file.arrayBuffer();

  //     // Get file metadata
  //     const metadata = {
  //       filename: file.name,
  //       filesize: file.size,
  //       filetype: file.type,
  //       extension: file.name.split('.').pop() || '',
  //       height: null as number | null,
  //       width: null as number | null,
  //     };

  //     // (a) Generate ephemeral AES key
  //     const aesKey = await window.crypto.subtle.generateKey(
  //       {
  //         name: "AES-GCM",
  //         length: 256,
  //       },
  //       true, // extractable
  //       ["encrypt", "decrypt"]
  //     );

  //     // (b) Encrypt the file with AES-GCM
  //     const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  //     const encryptedFileBuffer = await window.crypto.subtle.encrypt(
  //       {
  //         name: "AES-GCM",
  //         iv,
  //       },
  //       aesKey,
  //       fileBuffer
  //     );

  //     // Combine IV + ciphertext for storing (simple approach)
  //     const combined = new Uint8Array(iv.byteLength + encryptedFileBuffer.byteLength);
  //     combined.set(iv, 0);
  //     combined.set(new Uint8Array(encryptedFileBuffer), iv.byteLength);

  //     // (c) Export the raw AES key for RSA encryption
  //     const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

  //     // (d) Import the server's RSA public key for encryption
  //     // 1) Convert PEM to a binary DER
      
  //     let processedKey = publicKeyPem;
  //     if (processedKey.startsWith('"') && processedKey.endsWith('"')) {
  //       processedKey = processedKey.slice(1, -1);
  //     }

  //     processedKey = processedKey.replace(/\\n/g, "\n").trim();
  //     console.log(processedKey);
  //     const pemLines = processedKey
  //       .replace("-----BEGIN PUBLIC KEY-----", "")
  //       .replace("-----END PUBLIC KEY-----", "")
  //       .replace(/\r?\n|\r/g, "") // remove all newlines
  //       .trim();
  //     console.log(pemLines);
  //     const publicKeyDer = StringUtils.base64ToArrayBuffer(pemLines);
      

  //     const serverPublicKey = await window.crypto.subtle.importKey(
  //       "spki",              // format for public key in DER (SubjectPublicKeyInfo)
  //       publicKeyDer,
  //       {
  //         name: "RSA-OAEP",
  //         hash: "SHA-256",
  //       },
  //       false,               // not extractable
  //       ["encrypt"]
  //     );

  //     // (e) Encrypt the ephemeral AES key with RSA
  //     const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
  //       {
  //         name: "RSA-OAEP",
  //       },
  //       serverPublicKey,
  //       rawAesKey
  //     );

  //     // Convert final outputs to base64 for sending to backend
  //     const encryptedFileB64 = StringUtils.arrayBufferToBase64(combined.buffer);
  //     const encryptedKeyB64 = StringUtils.arrayBufferToBase64(encryptedAesKeyBuffer);

  //     // If it's an image, get dimensions
  //     if (file.type.startsWith('image/')) {
  //       const dimensions = await getImageDimensions(file);
  //       metadata.height = dimensions.height;
  //       metadata.width = dimensions.width;
  //     }

  //     // 3. Upload to server
  //     const res = await fetch("http://localhost:8000/uploadEncrypted", {
  //       method: "POST",
  //       credentials: 'include',
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         encryptedFile: encryptedFileB64,
  //         encryptedKey: encryptedKeyB64,
  //         metadata: metadata,
  //       }),
  //     });

  //     const result = await res.json();
  //     if (res.ok) {
  //       alert(`Upload success. FileId = ${result.fileId}`);
  //     } else {
  //       alert("Upload error: " + JSON.stringify(result));
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Encryption/Upload failed: " + err);
  //   }
  // };

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

  // const decryptAndDownload = async () => {
  //   try {
  //     // Fetch the decrypted file from the backend
  //     const res = await fetch("http://localhost:8000/downloadDecrypted/1d4d92b4-1e5e-4ab3-b857-7c12e57183b2", {
  //       credentials: 'include',
  //     });

  //     if (!res.ok) {
  //       const errorText = await res.text();
  //       console.error("Error downloading file:", errorText);
  //       alert(`Error: ${errorText}`);
  //       return;
  //     }

  //     // Get file metadata from header
  //     const fileMetadataHeader = res.headers.get("X-File-Metadata");
  //     if (!fileMetadataHeader) {
  //       throw new Error("File metadata not found in response");
  //     }

  //     const fileMetadata = JSON.parse(fileMetadataHeader);
  //     console.log("File metadata:", fileMetadata);

  //     // Get the array buffer directly
  //     const arrayBuffer = await res.arrayBuffer();
      
  //     // Create a Blob with the correct type
  //     const file = new Blob([arrayBuffer], { type: fileMetadata.filetype });

  //     // For files that should be downloaded
  //     const url = URL.createObjectURL(file);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = fileMetadata.filename;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);

  //     // Cleanup
  //     URL.revokeObjectURL(url);

  //   } catch (err) {
  //     console.error("Error during decryption or download:", err);
  //     alert("Decryption/Download failed. Check console for details.");
  //   }
  // };
  
  
  return (
    <ProtectedRoute>
      <MainPageStyle>
      <div style={{ margin: "2rem" }}>
      <h1>Simple Personal Key Infrastructure (Multi-Recipient)</h1>

      <input
        type="text"
        placeholder="Email"
        value={myEmail}
        onChange={(e) => setMyEmail(e.target.value)}
      />
      <button onClick={() => loadOrGenerateKeyPair(myEmail)}>Load/Generate Key Pair</button>
      <br /><br />

      <hr />

      <h2>Upload File (Encrypted)</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <br /><br />

      <button onClick={handleEncryptAndUpload}>Encrypt & Upload</button>
      <br /><br />
      <h2>Download & Decrypt File</h2>
      <input
        type="text"
        placeholder="File ID"
        value={downloadFileId}
        onChange={(e) => setDownloadFileId(e.target.value)}
      />
      <button onClick={handleDownloadAndDecrypt}>Decrypt and download file</button>
      </div>
      </MainPageStyle>
    </ProtectedRoute>
  );
};

export default DashboardPage;
