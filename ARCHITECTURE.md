# S3 Presigned URL Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React App (Vite)                                         │  │
│  │  http://localhost:5173                                    │  │
│  │                                                            │  │
│  │  Components:                                               │  │
│  │  • CertificateNotification.tsx                            │  │
│  │  • ZenGarden.tsx                                          │  │
│  │                                                            │  │
│  │  Utils:                                                    │  │
│  │  • s3Upload.ts                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Request presigned URL
                              │    POST /api/get-upload-url
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                        │  │
│  │  http://localhost:3001                                    │  │
│  │                                                            │  │
│  │  File: server-presigned.js                                │  │
│  │                                                            │  │
│  │  Endpoints:                                                │  │
│  │  • POST /api/get-upload-url                               │  │
│  │  • POST /api/get-download-url                             │  │
│  │  • GET  /api/certificates/:userId                         │  │
│  │  • GET  /health                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Generate presigned URL
                              │    using AWS SDK
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AWS SERVICES                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Amazon S3                                                │  │
│  │  Bucket: zen-garden-certificates                          │  │
│  │  Region: us-east-1                                        │  │
│  │                                                            │  │
│  │  Structure:                                                │  │
│  │  certificates/                                             │  │
│  │    └── user-abc123/                                       │  │
│  │        ├── ZEN-1234567890-ABC123.svg                      │  │
│  │        ├── ZEN-1234567891-DEF456.svg                      │  │
│  │        └── ZEN-1234567892-GHI789.svg                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  IAM User: zen-garden-uploader                            │  │
│  │  Permissions: S3 PutObject, GetObject, ListBucket         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ 3. Direct upload using
                              │    presigned URL (PUT)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                    (Certificate SVG data)                        │
└─────────────────────────────────────────────────────────────────┘
```

## Upload Flow Sequence

```
User                Frontend              Backend              AWS S3
 │                     │                     │                   │
 │ Earn Certificate    │                     │                   │
 ├────────────────────>│                     │                   │
 │                     │                     │                   │
 │                     │ Generate SVG        │                   │
 │                     │─────────┐           │                   │
 │                     │         │           │                   │
 │                     │<────────┘           │                   │
 │                     │                     │                   │
 │ Click "Save Cloud"  │                     │                   │
 ├────────────────────>│                     │                   │
 │                     │                     │                   │
 │                     │ POST /get-upload-url│                   │
 │                     │────────────────────>│                   │
 │                     │                     │                   │
 │                     │                     │ Generate URL      │
 │                     │                     │──────────────────>│
 │                     │                     │                   │
 │                     │                     │ Presigned URL     │
 │                     │                     │<──────────────────│
 │                     │                     │                   │
 │                     │ {uploadUrl, publicUrl}                  │
 │                     │<────────────────────│                   │
 │                     │                     │                   │
 │                     │ PUT (SVG data)                          │
 │                     │────────────────────────────────────────>│
 │                     │                     │                   │
 │                     │                     │         Store file│
 │                     │                     │         ┌─────────┤
 │                     │                     │         │         │
 │                     │                     │         └────────>│
 │                     │                     │                   │
 │                     │ 200 OK                                  │
 │                     │<────────────────────────────────────────│
 │                     │                     │                   │
 │ Success! Public URL │                     │                   │
 │<────────────────────│                     │                   │
 │                     │                     │                   │
```

## Component Architecture

```
src/
├── components/
│   ├── CertificateNotification.tsx
│   │   ├── generateCertificateSVG()
│   │   ├── downloadCertificate()
│   │   └── uploadToS3()  ──────┐
│   │                            │
│   └── ZenGarden.tsx            │
│                                 │
├── utils/                        │
│   └── s3Upload.ts  <────────────┘
│       ├── uploadToS3()
│       ├── getDownloadUrl()
│       ├── listUserCertificates()
│       └── checkS3Backend()
│
├── store/
│   └── gameStore.ts
│       └── issueCertificate()
│
└── types/
    └── index.ts
        └── Certificate interface
```

## Data Flow

### 1. Certificate Generation
```
User Achievement
    ↓
gameStore.issueCertificate()
    ↓
Create Certificate object
    ↓
Add to user.certificates[]
    ↓
CertificateNotification detects new certificate
    ↓
Display notification with buttons
```

### 2. Local Download
```
Click "Download Certificate"
    ↓
generateCertificateSVG()
    ↓
Create SVG string
    ↓
Convert to Blob
    ↓
Create download link
    ↓
Trigger browser download
```

### 3. Cloud Upload (Presigned URL)
```
Click "Save to Cloud"
    ↓
Check backend availability
    ↓
Generate SVG
    ↓
Request presigned URL from backend
    ↓
Backend generates temporary S3 URL (expires 5 min)
    ↓
Frontend uploads directly to S3
    ↓
S3 stores file with public-read ACL
    ↓
Return public URL to user
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Environment Variables                          │
│ • AWS credentials never in frontend code                │
│ • Stored in .env file (gitignored)                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: IAM Permissions                                │
│ • Least privilege principle                             │
│ • Only S3 operations allowed                            │
│ • Specific bucket access only                           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Presigned URLs                                 │
│ • Temporary (5 minute expiration)                       │
│ • Single-use for specific file                          │
│ • Cannot be reused after expiration                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Content-Type Validation                       │
│ • Only image/svg+xml allowed                            │
│ • Prevents malicious file uploads                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 5: CORS Configuration                             │
│ • Only allowed origins can upload                       │
│ • Prevents unauthorized access                          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architectures

### Development
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────>│   Backend    │────>│   AWS S3     │
│ localhost:   │     │ localhost:   │     │   Bucket     │
│    5173      │     │    3001      │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Production Option A: Traditional
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel/    │────>│   Heroku/    │────>│   AWS S3     │
│   Netlify    │     │   EC2        │     │   Bucket     │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Production Option B: Serverless
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel/    │────>│ AWS Lambda + │────>│   AWS S3     │
│   Netlify    │     │ API Gateway  │     │   Bucket     │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Production Option C: All AWS
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ CloudFront + │────>│ AWS Lambda + │────>│   AWS S3     │
│   S3 Static  │     │ API Gateway  │     │   Bucket     │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

## File Structure in S3

```
zen-garden-certificates/
│
├── certificates/
│   ├── user-abc123/
│   │   ├── ZEN-1701234567890-ABC123.svg
│   │   ├── ZEN-1701234567891-DEF456.svg
│   │   └── ZEN-1701234567892-GHI789.svg
│   │
│   ├── user-xyz789/
│   │   ├── ZEN-1701234567893-JKL012.svg
│   │   └── ZEN-1701234567894-MNO345.svg
│   │
│   └── user-def456/
│       └── ZEN-1701234567895-PQR678.svg
│
└── test/  (for testing only)
    └── test-certificate.svg
```

## API Request/Response Examples

### Request Presigned URL
```http
POST /api/get-upload-url HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "certificateNumber": "ZEN-1701234567890-ABC123",
  "userId": "user-abc123",
  "contentType": "image/svg+xml"
}
```

### Response
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "uploadUrl": "https://zen-garden-certificates.s3.amazonaws.com/certificates/user-abc123/ZEN-1701234567890-ABC123.svg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "publicUrl": "https://zen-garden-certificates.s3.us-east-1.amazonaws.com/certificates/user-abc123/ZEN-1701234567890-ABC123.svg",
  "key": "certificates/user-abc123/ZEN-1701234567890-ABC123.svg"
}
```

### Upload to S3
```http
PUT /certificates/user-abc123/ZEN-1701234567890-ABC123.svg?X-Amz-... HTTP/1.1
Host: zen-garden-certificates.s3.amazonaws.com
Content-Type: image/svg+xml
Content-Length: 2847

<svg width="800" height="600">...</svg>
```

### Response
```http
HTTP/1.1 200 OK
ETag: "abc123def456..."
```

## Technology Stack

```
Frontend:
├── React 18
├── TypeScript
├── Vite
├── Framer Motion
└── Zustand

Backend:
├── Node.js
├── Express.js
├── AWS SDK v2
├── CORS
└── dotenv

Cloud:
├── AWS S3
├── AWS IAM
└── (Optional) AWS Lambda + API Gateway
```

## Performance Metrics

```
Operation              Time        Cost
─────────────────────────────────────────
Generate presigned URL  ~50ms      $0
Upload to S3 (50KB)    ~200ms     $0.000005
Download from S3       ~100ms     $0.0000004
List certificates      ~150ms     $0.0000004
```

## Monitoring & Logging

```
Frontend Console:
├── Certificate generation
├── Upload progress
├── Success/error messages
└── Public URL display

Backend Logs:
├── Presigned URL generation
├── Request validation
├── Error handling
└── Performance metrics

AWS CloudWatch:
├── S3 bucket metrics
├── Request counts
├── Storage usage
└── Error rates
```

---

This architecture provides a secure, scalable, and cost-effective solution for certificate storage and distribution.
