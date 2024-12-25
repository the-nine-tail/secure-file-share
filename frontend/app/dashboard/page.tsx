"use client";
import React, { useState } from "react";
import { BodyPrimaryRegular } from "../ui-components/typing";
import { MainPageStyle } from "./style";
import ProtectedRoute from "../authentication/ProtectedRoute";

// Utility for base64 encoding/decoding
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const base64ToArrayBuffer = (b64) => {
  const binaryString = window.atob(b64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const DashboardPage: React.FC = () => {
  const [file, setFile] = useState(null);
  const [publicKeyPem, setPublicKeyPem] = useState("");

  // 1. Fetch the server's RSA public key (PEM format)
  const fetchPublicKey = async () => {
    try {
      const res = await fetch("http://localhost:8000/publicKey", {
        credentials: 'include',
      });
      const keyText = await res.text();
      setPublicKeyPem(keyText);
      alert("Fetched server public key.");
    } catch (err) {
      console.error(err);
      alert("Failed to fetch public key.");
    }
  };

  // 2. Encrypt and upload file
  const encryptAndUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    if (!publicKeyPem) {
      alert("Please fetch the server's public key first!");
      return;
    }

    try {
      // Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // Get file metadata
      const metadata = {
        filename: file.name,
        filesize: file.size,
        filetype: file.type,
        extension: file.name.split('.').pop() || '',
        height: null as number | null,
        width: null as number | null,
      };

      // (a) Generate ephemeral AES key
      const aesKey = await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true, // extractable
        ["encrypt", "decrypt"]
      );

      // (b) Encrypt the file with AES-GCM
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
      const encryptedFileBuffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        aesKey,
        fileBuffer
      );

      // Combine IV + ciphertext for storing (simple approach)
      const combined = new Uint8Array(iv.byteLength + encryptedFileBuffer.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedFileBuffer), iv.byteLength);

      // (c) Export the raw AES key for RSA encryption
      const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

      // (d) Import the server's RSA public key for encryption
      // 1) Convert PEM to a binary DER
      
      let processedKey = publicKeyPem;
      if (processedKey.startsWith('"') && processedKey.endsWith('"')) {
        processedKey = processedKey.slice(1, -1);
      }

      processedKey = processedKey.replace(/\\n/g, "\n").trim();
      console.log(processedKey);
      const pemLines = processedKey
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .replace(/\r?\n|\r/g, "") // remove all newlines
        .trim();
      console.log(pemLines);
      const publicKeyDer = base64ToArrayBuffer(pemLines);
      

      const serverPublicKey = await window.crypto.subtle.importKey(
        "spki",              // format for public key in DER (SubjectPublicKeyInfo)
        publicKeyDer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        false,               // not extractable
        ["encrypt"]
      );

      // (e) Encrypt the ephemeral AES key with RSA
      const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
        },
        serverPublicKey,
        rawAesKey
      );

      // Convert final outputs to base64 for sending to backend
      const encryptedFileB64 = arrayBufferToBase64(combined.buffer);
      const encryptedKeyB64 = arrayBufferToBase64(encryptedAesKeyBuffer);

      // If it's an image, get dimensions
      if (file.type.startsWith('image/')) {
        const dimensions = await getImageDimensions(file);
        metadata.height = dimensions.height;
        metadata.width = dimensions.width;
      }

      // 3. Upload to server
      const res = await fetch("http://localhost:8000/uploadEncrypted", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encryptedFile: encryptedFileB64,
          encryptedKey: encryptedKeyB64,
          metadata: metadata,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert(`Upload success. FileId = ${result.fileId}`);
      } else {
        alert("Upload error: " + JSON.stringify(result));
      }
    } catch (err) {
      console.error(err);
      alert("Encryption/Upload failed: " + err);
    }
  };

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

  const decryptAndDownload = async () => {
    try {
      // Fetch the decrypted file from the backend
      const res = await fetch("http://localhost:8000/downloadDecrypted/1d4d92b4-1e5e-4ab3-b857-7c12e57183b2", {
        credentials: 'include',
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error downloading file:", errorText);
        alert(`Error: ${errorText}`);
        return;
      }

      // Get file metadata from header
      const fileMetadataHeader = res.headers.get("X-File-Metadata");
      if (!fileMetadataHeader) {
        throw new Error("File metadata not found in response");
      }

      const fileMetadata = JSON.parse(fileMetadataHeader);
      console.log("File metadata:", fileMetadata);

      // Get the array buffer directly
      const arrayBuffer = await res.arrayBuffer();
      
      // Create a Blob with the correct type
      const file = new Blob([arrayBuffer], { type: fileMetadata.filetype });

      // For files that should be downloaded
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileMetadata.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Error during decryption or download:", err);
      alert("Decryption/Download failed. Check console for details.");
    }
  };
  
  
  return (
    <ProtectedRoute>
      <MainPageStyle>
      <div style={{ margin: "2rem" }}>
      <h1>PKI + Hybrid Encryption Demo</h1>

      <button onClick={fetchPublicKey}>Fetch Server Public Key</button>
      <br /><br />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <br /><br />

      <button onClick={encryptAndUpload}>
        Encrypt & Upload (AES + RSA Hybrid)
      </button>

      <button onClick={decryptAndDownload}>
        Decrypt and download file
      </button>
    </div>
      </MainPageStyle>
    </ProtectedRoute>
  );
};

export default DashboardPage;
