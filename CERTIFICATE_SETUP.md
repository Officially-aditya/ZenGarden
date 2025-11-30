# Certificate System Setup Guide

## Overview
The certificate system allows users to earn, download, and store certificates in Amazon S3 when they achieve milestones in the Zen Garden app.

## Features
- ✅ Automatic certificate generation when users complete achievements
- ✅ Download certificates as SVG files
- ✅ Upload certificates to Amazon S3 for cloud storage
- ✅ Beautiful certificate design with user details

## Certificates Available
1. **Master Gardener Certificate** - Complete a full garden with all trees at max level
2. **Garden Completion Certificate** - Plant all 9 trees
3. **Eco Warrior Certificate** - Reach 10,000 total points

## Frontend Setup (Already Done)
The `CertificateNotification` component handles:
- Displaying certificate notifications
- Generating SVG certificates
- Downloading certificates locally
- Uploading to S3 (requires backend)

## Backend Setup (S3 Upload)

### 1. Install Dependencies
```bash
npm install express aws-sdk cors dotenv
```

### 2. Create `.env` file
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=zen-garden-certificates
PORT=3001
```

### 3. AWS S3 Setup

#### Create S3 Bucket
1. Go to AWS Console → S3
2. Create a new bucket named `zen-garden-certificates`
3. Enable public access for certificate viewing (or use signed URLs)
4. Set CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

#### Create IAM User
1. Go to AWS Console → IAM → Users
2. Create new user with programmatic access
3. Attach policy `AmazonS3FullAccess` (or create custom policy)
4. Save Access Key ID and Secret Access Key

#### Custom IAM Policy (Recommended)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
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

### 4. Run the Server
```bash
node server-example.js
```

### 5. Update Frontend API Endpoint
In `src/components/CertificateNotification.tsx`, the upload function calls:
```typescript
const response = await fetch('/api/upload-certificate', {
  // ...
});
```

For development, you may need to update this to:
```typescript
const response = await fetch('http://localhost:3001/api/upload-certificate', {
  // ...
});
```

## Alternative: Serverless Setup (AWS Lambda)

### Using AWS Lambda + API Gateway
1. Create Lambda function with the upload logic
2. Set up API Gateway endpoint
3. Configure Lambda IAM role with S3 permissions
4. Update frontend to use API Gateway URL

### Example Lambda Function
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const { certificateNumber, svg, userId } = JSON.parse(event.body);
  
  const params = {
    Bucket: 'zen-garden-certificates',
    Key: `certificates/${userId}/${certificateNumber}.svg`,
    Body: Buffer.from(svg, 'utf-8'),
    ContentType: 'image/svg+xml',
    ACL: 'public-read',
  };
  
  try {
    const result = await s3.upload(params).promise();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ url: result.Location }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

## Testing

### Test Certificate Download
1. Complete an achievement (e.g., plant all 9 trees)
2. Certificate notification appears
3. Click "Download Certificate"
4. SVG file downloads to your computer

### Test S3 Upload
1. Set up backend server
2. Complete an achievement
3. Click "Save to Cloud"
4. Check S3 bucket for uploaded certificate

## Security Considerations

1. **Never expose AWS credentials in frontend code**
2. **Use environment variables** for sensitive data
3. **Implement authentication** - verify user identity before upload
4. **Rate limiting** - prevent abuse of upload endpoint
5. **File validation** - ensure only valid SVG content is uploaded
6. **Signed URLs** - Use S3 signed URLs instead of public access for better security

## Cost Estimation

AWS S3 Pricing (approximate):
- Storage: $0.023 per GB/month
- PUT requests: $0.005 per 1,000 requests
- GET requests: $0.0004 per 1,000 requests

For 1,000 users with 3 certificates each:
- Storage: ~3MB = $0.00007/month
- Uploads: 3,000 = $0.015
- **Total: < $0.02/month**

## Troubleshooting

### CORS Errors
- Check S3 bucket CORS configuration
- Ensure API endpoint allows your frontend origin

### Upload Fails
- Verify AWS credentials are correct
- Check IAM permissions
- Ensure bucket name matches

### Certificate Not Displaying
- Check S3 object ACL (should be public-read)
- Verify Content-Type is set to 'image/svg+xml'

## Future Enhancements

- [ ] Add PDF export option
- [ ] Email certificates to users
- [ ] Social media sharing
- [ ] Certificate verification system
- [ ] Custom certificate templates
- [ ] Blockchain verification (NFT integration)
