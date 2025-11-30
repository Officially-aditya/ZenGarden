# S3 Presigned URL Setup Guide

## Overview
This implementation uses **presigned URLs** for direct browser-to-S3 uploads. This is more secure and efficient than passing files through your server.

## How It Works

```
┌─────────┐      1. Request URL      ┌─────────┐
│ Browser │ ───────────────────────> │ Backend │
│         │                           │ (Node)  │
│         │ <─────────────────────── │         │
│         │   2. Presigned URL        └─────────┘
│         │                                 │
│         │                                 │ AWS SDK
│         │                                 ▼
│         │   3. Direct Upload        ┌─────────┐
│         │ ───────────────────────> │   S3    │
└─────────┘                           └─────────┘
```

**Benefits:**
- ✅ Files never pass through your server (saves bandwidth)
- ✅ More secure (temporary URLs expire)
- ✅ Faster uploads (direct to S3)
- ✅ Scalable (no server bottleneck)

## Setup Instructions

### 1. Install Backend Dependencies

```bash
npm install express aws-sdk cors dotenv
```

### 2. Create AWS S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click "Create bucket"
3. Bucket name: `zen-garden-certificates` (or your choice)
4. Region: `us-east-1` (or your preferred region)
5. **Block Public Access settings:**
   - Uncheck "Block all public access" (we need public-read for certificates)
   - Acknowledge the warning
6. Click "Create bucket"

### 3. Configure CORS on S3 Bucket

1. Go to your bucket → Permissions → CORS
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 4. Create IAM User with S3 Permissions

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Users → Add users
3. User name: `zen-garden-uploader`
4. Access type: ✅ Programmatic access
5. Permissions: Attach existing policies directly
6. Create custom policy or use this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::zen-garden-certificates/*",
        "arn:aws:s3:::zen-garden-certificates"
      ]
    }
  ]
}
```

7. Save the **Access Key ID** and **Secret Access Key**

### 5. Create .env File

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=zen-garden-certificates
PORT=3001
```

### 6. Start the Backend Server

```bash
node server-presigned.js
```

You should see:
```
🚀 Presigned URL server running on port 3001
📦 S3 Bucket: zen-garden-certificates
🌍 Region: us-east-1
```

### 7. Start the Frontend

In a separate terminal:

```bash
npm run dev
```

### 8. Test the Upload

1. Open the app in your browser
2. Earn a certificate (e.g., plant all 9 trees)
3. Click "☁️ Save to Cloud" on the certificate notification
4. Check your S3 bucket for the uploaded file

## Environment Variables (Frontend)

Create `.env` in the root (optional):

```env
VITE_API_URL=http://localhost:3001
```

For production:
```env
VITE_API_URL=https://api.yourdomain.com
```

## Deployment Options

### Option A: Deploy Backend to Heroku

```bash
# Install Heroku CLI
heroku create zen-garden-api

# Set environment variables
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
heroku config:set AWS_REGION=us-east-1
heroku config:set S3_BUCKET_NAME=zen-garden-certificates

# Deploy
git push heroku main
```

### Option B: Deploy to AWS Lambda (Serverless)

1. Create Lambda function
2. Add API Gateway trigger
3. Set environment variables in Lambda
4. Update frontend `VITE_API_URL` to API Gateway URL

Example Lambda handler:

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ signatureVersion: 'v4' });

exports.handler = async (event) => {
  const { certificateNumber, userId, contentType } = JSON.parse(event.body);
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `certificates/${userId}/${certificateNumber}.svg`,
    ContentType: contentType,
    Expires: 300,
    ACL: 'public-read',
  };
  
  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
  const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/certificates/${userId}/${certificateNumber}.svg`;
  
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ uploadUrl, publicUrl }),
  };
};
```

### Option C: Deploy to Vercel/Netlify (Serverless Functions)

Create `api/get-upload-url.js`:

```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { certificateNumber, userId, contentType } = req.body;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `certificates/${userId}/${certificateNumber}.svg`,
    ContentType: contentType,
    Expires: 300,
    ACL: 'public-read',
  };

  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
  const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/certificates/${userId}/${certificateNumber}.svg`;

  res.json({ uploadUrl, publicUrl });
};
```

## Security Best Practices

### 1. Use Environment Variables
Never commit `.env` to git. Add to `.gitignore`:
```
.env
.env.local
```

### 2. Limit Presigned URL Expiration
Current setting: 5 minutes (300 seconds)
```javascript
Expires: 300
```

### 3. Validate File Types
Backend validates content type:
```javascript
if (contentType !== 'image/svg+xml') {
  return res.status(400).json({ error: 'Invalid content type' });
}
```

### 4. Implement Rate Limiting
Add rate limiting to prevent abuse:
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
});

app.use('/api/', limiter);
```

### 5. Add Authentication
Verify user identity before generating URLs:
```javascript
app.post('/api/get-upload-url', authenticateUser, async (req, res) => {
  const userId = req.user.id; // From auth middleware
  // ... rest of code
});
```

## Troubleshooting

### Error: "Access Denied"
- Check IAM user has correct permissions
- Verify bucket name matches in .env
- Check bucket policy allows PutObject

### Error: "CORS Error"
- Add your frontend URL to S3 CORS configuration
- Include `http://localhost:5173` for development

### Error: "Backend not available"
- Ensure `node server-presigned.js` is running
- Check port 3001 is not in use
- Verify VITE_API_URL points to correct backend

### Upload succeeds but file not visible
- Check S3 bucket → Objects
- Verify ACL is set to 'public-read'
- Check bucket public access settings

## Cost Estimation

AWS S3 Pricing (us-east-1):
- Storage: $0.023 per GB/month
- PUT requests: $0.005 per 1,000 requests
- GET requests: $0.0004 per 1,000 requests

**Example for 1,000 users:**
- 3 certificates per user = 3,000 files
- Average 50KB per SVG = 150MB total
- Storage: $0.003/month
- Uploads: $0.015
- **Total: ~$0.02/month**

## Testing

Test the backend:
```bash
curl http://localhost:3001/health
```

Test presigned URL generation:
```bash
curl -X POST http://localhost:3001/api/get-upload-url \
  -H "Content-Type: application/json" \
  -d '{"certificateNumber":"TEST-123","userId":"test-user","contentType":"image/svg+xml"}'
```

## Next Steps

1. ✅ Set up AWS S3 bucket
2. ✅ Create IAM user
3. ✅ Configure .env file
4. ✅ Start backend server
5. ✅ Test certificate upload
6. 🔄 Add user authentication
7. 🔄 Deploy to production
8. 🔄 Monitor S3 usage and costs

## Support

For issues:
- Check AWS CloudWatch logs
- Review S3 bucket permissions
- Verify CORS configuration
- Check browser console for errors
