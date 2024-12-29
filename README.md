# Secure File Share

A secure end-to-end encrypted file sharing application with role-based access control, multi-factor authentication, and granular file permissions.

## Features

### 1. Authentication & Security
- **Multi-Factor Authentication (MFA)**
  - Required for all users
  - QR code-based setup using authenticator apps
  - TOTP (Time-based One-Time Password) implementation

- **Role-Based Access Control**
  - Admin: First registered user automatically becomes admin
  - User: Standard user with file upload/download capabilities
  - Guest: Limited access user

- **Password Security**
  - Minimum 8 characters
  - Must contain uppercase and lowercase letters
  - Must contain numbers
  - Must contain special characters
  - Real-time password strength validation

### 2. File Management

#### File Upload
- End-to-end encryption using:
  - AES-256 for file encryption
  - RSA-OAEP for key exchange
- Support for various file types
- Automatic file metadata extraction
- Progress tracking during upload

#### File Sharing
- Granular permission control:
  - View-only access
  - Download permission
  - Time-based access expiry
- Share files with multiple users
- Add/remove recipients
- Encrypted key distribution

#### File Access
- Secure file download with permission checks
- Automatic decryption for authorized users
- Access expiry enforcement
- File listing with metadata

### 3. User Interface

- **Dashboard**
  - File listing with sorting and filtering
  - Upload button in header
  - Role indicator
  - File actions (download/share)

- **Modals**
  - Share file modal with permission controls
  - Loading states for operations
  - Error handling and user feedback

## Technical Implementation

### Frontend
- React/Next.js with TypeScript
- Styled Components for styling
- Redux for state management
- Portal-based modal system
- WebCrypto API for client-side encryption

### Backend
- Python
- SQLAlchemy ORM
- JWT-based authentication
- TOTP for 2FA

### Security Features
1. **Client-Side Encryption**
   ```typescript
   // File encryption using AES-256-GCM
   const aesKey = await window.crypto.subtle.generateKey(
     { name: "AES-GCM", length: 256 },
     true,
     ["encrypt", "decrypt"]
   );
   ```

2. **Key Exchange**
   - RSA key pair generation per user
   - Public key distribution
   - Secure key storage

3. **Permission System**
   ```json
   {
     "email@example.com": {
       "key": "encrypted_aes_key",
       "permission": "view|download",
       "expires_at": "timestamp"
     }
   }
   ```

## Setup and Installation

1. **Docker Setup**
   ```bash
   git clone <repo-url>
   cd secure-file-share
   docker compose up --build
   ```

## API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /login` - User login
- `POST /activate-mfa` - Activate 2FA

### File Operations
- `POST /uploadEncryptedE2EE` - Upload encrypted file
- `GET /downloadEncryptedE2EE/{file_id}` - Download file
- `PATCH /files/{file_id}/recipients` - Update file sharing
- `GET /files` - List files

## Security Considerations

- All sensitive operations require MFA
- Files are encrypted before leaving the client
- Keys are never transmitted in plain text
- Session management with secure JWT
- Role-based access enforcement
- Time-based access expiration