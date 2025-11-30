# S3 Integration Summary

## ✅ What's Been Implemented

### Option 3: Direct Browser Upload with Presigned URLs

This is the **most secure and efficient** approach for S3 uploads.

## 📁 Files Created

### Backend
- `server-presigned.js` - Express server that generates presigned URLs
- `.env.example` - Template for AWS credentials
- `test-s3-setup.js` - Test script to verify S3 configuration

### Frontend
- `src/utils/s3Upload.ts` - Utility functions for S3 operations
- Updated `src/components/CertificateNotification.tsx` - Uses presigned URLs

### Documentation
- `S3_PRESIGNED_SETUP.md` - Complete setup guide with deployment options
- `QUICKSTART.md` - 5-minute quick start guide
- `S3_INTEGRATION_SUMMARY.md` - This file

## 🔄 How It Works

```
User earns certificate
       ↓
Frontend generates SVG
       ↓
Request presigned URL from backend
       ↓
Backend generates temporary S3 URL (expires in 5 min)
       ↓
Frontend uploads directly to S3 using presigned URL
       ↓
Certificate stored in S3 with public URL
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install express aws-sdk cors dotenv

# 2. Set up AWS (see QUICKSTART.md)
# - Create S3 bucket
# - Create IAM user
# - Configure CORS

# 3. Configure environment
cp .env.example .env
# Edit .env with your AWS credentials

# 4. Test setup (optional but recommended)
npm run test:s3

# 5. Start backend
npm run server

# 6. Start frontend (new terminal)
npm run dev
```

## 🎯 Features

✅ **Secure**: Files never pass through your server
✅ **Fast**: Direct browser-to-S3 upload
✅ **Scalable**: No server bandwidth bottleneck
✅ **Cost-effective**: ~$0.02/month for 1,000 users
✅ **Temporary URLs**: Presigned URLs expire after 5 minutes
✅ **Public access**: Certificates get public URLs for sharing

## 📊 Architecture

### Development
```
Frontend (localhost:5173)
    ↓
Backend (localhost:3001)
    ↓
AWS S3 (zen-garden-certificates)
```

### Production Options

**Option A: Traditional Server**
- Deploy backend to Heroku/DigitalOcean/AWS EC2
- Update `VITE_API_URL` to production URL

**Option B: Serverless**
- Deploy to AWS Lambda + API Gateway
- Or Vercel/Netlify serverless functions
- Zero server maintenance

**Option C: Hybrid**
- Frontend on Vercel/Netlify
- Backend on AWS Lambda
- S3 for storage

## 🔐 Security Features

1. **Presigned URLs expire** - 5 minute window
2. **No credentials in frontend** - AWS keys stay on server
3. **Content-Type validation** - Only SVG files allowed
4. **Rate limiting ready** - Easy to add with express-rate-limit
5. **CORS configured** - Only allowed origins can upload

## 💰 Cost Breakdown

AWS S3 Pricing (us-east-1):
- Storage: $0.023/GB/month
- PUT: $0.005/1,000 requests
- GET: $0.0004/1,000 requests

**Example: 1,000 users, 3 certificates each**
- Storage: 150MB = $0.003/month
- Uploads: 3,000 = $0.015
- Downloads: 10,000 = $0.004
- **Total: $0.022/month**

**AWS Free Tier (first 12 months):**
- 5GB storage
- 20,000 GET requests
- 2,000 PUT requests
- **Your cost: $0/month**

## 🧪 Testing

### Test S3 Configuration
```bash
npm run test:s3
```

This will:
1. ✅ Check environment variables
2. ✅ Verify bucket access
3. ✅ Generate presigned URL
4. ✅ Upload test file
5. ✅ Verify upload
6. ✅ Clean up test file

### Test in Browser
1. Start backend: `npm run server`
2. Start frontend: `npm run dev`
3. Earn a certificate (plant 9 trees)
4. Click "☁️ Save to Cloud"
5. Check S3 bucket for uploaded file

## 📝 API Endpoints

### POST `/api/get-upload-url`
Generate presigned URL for upload

**Request:**
```json
{
  "certificateNumber": "ZEN-1234567890-ABC123",
  "userId": "user-abc123",
  "contentType": "image/svg+xml"
}
```

**Response:**
```json
{
  "uploadUrl": "https://zen-garden-certificates.s3.amazonaws.com/...",
  "publicUrl": "https://zen-garden-certificates.s3.us-east-1.amazonaws.com/certificates/user-abc123/ZEN-1234567890-ABC123.svg",
  "key": "certificates/user-abc123/ZEN-1234567890-ABC123.svg"
}
```

### POST `/api/get-download-url`
Generate presigned URL for download (for private files)

### GET `/api/certificates/:userId`
List all certificates for a user

### GET `/health`
Health check endpoint

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=zen-garden-certificates
PORT=3001
```

**Frontend (.env - optional):**
```env
VITE_API_URL=http://localhost:3001
```

### S3 Bucket CORS
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### IAM Policy
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

## 🐛 Troubleshooting

### "Backend not available"
- Check backend is running: `npm run server`
- Verify port 3001 is free
- Check `VITE_API_URL` in frontend

### "Access Denied"
- Verify AWS credentials in .env
- Check IAM user permissions
- Ensure bucket name is correct

### "CORS Error"
- Add your frontend URL to S3 CORS config
- Include both http://localhost:5173 and production URL

### Upload succeeds but file not visible
- Check bucket public access settings
- Verify ACL is 'public-read'
- Look in S3 Console → Objects

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Presigned URLs Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [S3 CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)

## 🎉 Next Steps

1. ✅ Complete AWS setup (see QUICKSTART.md)
2. ✅ Test with `npm run test:s3`
3. ✅ Start backend and frontend
4. ✅ Test certificate upload
5. 🔄 Add user authentication
6. 🔄 Deploy to production
7. 🔄 Monitor usage and costs

## 💡 Tips

- Use AWS CloudWatch to monitor S3 usage
- Set up S3 lifecycle policies to archive old certificates
- Consider CloudFront CDN for faster certificate delivery
- Implement user authentication before production
- Add rate limiting to prevent abuse
- Monitor costs in AWS Billing Dashboard

## 🆘 Need Help?

1. Check `QUICKSTART.md` for setup steps
2. Run `npm run test:s3` to diagnose issues
3. Review `S3_PRESIGNED_SETUP.md` for detailed guide
4. Check AWS CloudWatch logs
5. Verify S3 bucket permissions and CORS

---

**Status**: ✅ Ready to use
**Last Updated**: 2024
**Version**: 1.0.0
