# S3 Certificate Upload - Complete Implementation

## 🎯 What Was Implemented

**Option 3: Direct Browser Upload with Presigned URLs** ✅

This is the most secure and efficient approach for S3 uploads. Files go directly from the browser to S3 without passing through your server.

## 📦 What You Got

### Backend Files
- ✅ `server-presigned.js` - Express server for presigned URL generation
- ✅ `server-example.js` - Alternative implementation (direct upload)
- ✅ `.env.example` - Template for AWS credentials
- ✅ `test-s3-setup.js` - Automated test script

### Frontend Files
- ✅ `src/utils/s3Upload.ts` - S3 utility functions
- ✅ `src/components/CertificateNotification.tsx` - Updated with S3 upload
- ✅ Updated `package.json` with new scripts

### Documentation
- ✅ `QUICKSTART.md` - 5-minute setup guide
- ✅ `S3_PRESIGNED_SETUP.md` - Complete setup with deployment options
- ✅ `S3_INTEGRATION_SUMMARY.md` - Technical overview
- ✅ `ARCHITECTURE.md` - System architecture diagrams
- ✅ `SETUP_CHECKLIST.md` - Step-by-step checklist
- ✅ `CERTIFICATE_SETUP.md` - Original certificate documentation

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install express aws-sdk cors dotenv

# 2. Configure AWS (see QUICKSTART.md for details)
cp .env.example .env
# Edit .env with your AWS credentials

# 3. Test setup (optional but recommended)
npm run test:s3

# 4. Start backend
npm run server

# 5. Start frontend (new terminal)
npm run dev
```

## 📖 Documentation Guide

**Start here:**
1. `QUICKSTART.md` - Get up and running in 5 minutes
2. `SETUP_CHECKLIST.md` - Follow step-by-step

**For details:**
3. `S3_PRESIGNED_SETUP.md` - Complete setup guide
4. `ARCHITECTURE.md` - Understand how it works
5. `S3_INTEGRATION_SUMMARY.md` - Technical overview

## 🔑 Key Features

✅ **Secure** - AWS credentials never exposed to frontend
✅ **Fast** - Direct browser-to-S3 upload
✅ **Scalable** - No server bandwidth bottleneck
✅ **Cost-effective** - ~$0.02/month for 1,000 users
✅ **Temporary URLs** - Presigned URLs expire after 5 minutes
✅ **Public sharing** - Certificates get public URLs

## 🏗️ Architecture

```
Browser → Backend (get presigned URL) → Browser → S3 (direct upload)
```

**Benefits:**
- Files never pass through your server
- Reduced server load and bandwidth
- Faster uploads for users
- More secure (temporary URLs)

## 📋 NPM Scripts

```bash
npm run dev          # Start frontend (Vite)
npm run build        # Build for production
npm run server       # Start presigned URL backend
npm run server:old   # Start old direct upload backend
npm run test:s3      # Test S3 configuration
```

## 🔧 Configuration

### Backend (.env)
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=zen-garden-certificates
PORT=3001
```

### Frontend (.env - optional)
```env
VITE_API_URL=http://localhost:3001
```

## 🧪 Testing

### Test S3 Setup
```bash
npm run test:s3
```

This will:
1. Check environment variables
2. Verify bucket access
3. Generate presigned URL
4. Upload test file
5. Verify upload
6. Clean up

### Manual Test
1. Start backend: `npm run server`
2. Start frontend: `npm run dev`
3. Earn certificate (plant 9 trees)
4. Click "☁️ Save to Cloud"
5. Check S3 bucket for file

## 💰 Cost Estimate

**AWS S3 Pricing (us-east-1):**
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
- **Your cost: $0/month** ✨

## 🔐 Security

1. **Environment Variables** - AWS credentials in .env (gitignored)
2. **IAM Permissions** - Least privilege access
3. **Presigned URLs** - Expire after 5 minutes
4. **Content-Type Validation** - Only SVG files allowed
5. **CORS** - Only allowed origins can upload

## 🚢 Deployment Options

### Option A: Traditional Server
- Deploy backend to Heroku/DigitalOcean/AWS EC2
- Deploy frontend to Vercel/Netlify
- Update `VITE_API_URL` to production backend

### Option B: Serverless
- Deploy backend to AWS Lambda + API Gateway
- Deploy frontend to Vercel/Netlify
- Zero server maintenance

### Option C: All AWS
- Frontend: CloudFront + S3 static hosting
- Backend: Lambda + API Gateway
- Storage: S3

See `S3_PRESIGNED_SETUP.md` for detailed deployment guides.

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
- Include `http://localhost:5173` for development

### Upload succeeds but file not visible
- Check bucket public access settings
- Verify ACL is 'public-read'
- Look in S3 Console → Objects

Run `npm run test:s3` to diagnose issues automatically.

## 📚 API Endpoints

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
  "uploadUrl": "https://...",
  "publicUrl": "https://...",
  "key": "certificates/user-abc123/..."
}
```

### GET `/health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "service": "certificate-upload"
}
```

## 🎓 How It Works

1. **User earns certificate** in the app
2. **Frontend generates SVG** certificate
3. **Request presigned URL** from backend
4. **Backend generates temporary S3 URL** (expires in 5 min)
5. **Frontend uploads directly to S3** using presigned URL
6. **S3 stores file** with public-read ACL
7. **User gets public URL** for sharing

## 📊 File Structure

```
Project Root
├── server-presigned.js          # Backend server
├── server-example.js            # Alternative backend
├── test-s3-setup.js            # Test script
├── .env.example                # Environment template
├── .env                        # Your credentials (gitignored)
│
├── src/
│   ├── components/
│   │   └── CertificateNotification.tsx
│   └── utils/
│       └── s3Upload.ts         # S3 utilities
│
└── docs/
    ├── QUICKSTART.md
    ├── S3_PRESIGNED_SETUP.md
    ├── S3_INTEGRATION_SUMMARY.md
    ├── ARCHITECTURE.md
    ├── SETUP_CHECKLIST.md
    └── README_S3.md (this file)
```

## ✅ Verification

Your setup is complete when:
- ✅ `npm run test:s3` passes all tests
- ✅ Backend starts without errors
- ✅ Frontend starts without errors
- ✅ Certificate downloads locally
- ✅ Certificate uploads to S3
- ✅ Public URL is accessible
- ✅ File visible in S3 console

## 🎯 Next Steps

1. Complete AWS setup (see `QUICKSTART.md`)
2. Test locally with `npm run test:s3`
3. Test in browser
4. Add user authentication
5. Deploy to production
6. Monitor usage and costs

## 🆘 Need Help?

1. Check `QUICKSTART.md` for setup steps
2. Run `npm run test:s3` to diagnose
3. Review `SETUP_CHECKLIST.md`
4. Check `S3_PRESIGNED_SETUP.md` for details
5. Review browser console for errors
6. Check backend terminal for logs

## 📞 Support Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Presigned URLs Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [AWS Free Tier](https://aws.amazon.com/free/)

---

**Status:** ✅ Ready to use
**Implementation:** Option 3 - Presigned URLs
**Security:** High
**Cost:** ~$0.02/month (or free with AWS Free Tier)
**Scalability:** Excellent
**Maintenance:** Low

**Get started:** Open `QUICKSTART.md` and follow the 5-minute guide!
