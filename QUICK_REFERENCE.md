# S3 Certificate Upload - Quick Reference Card

## 🚀 Commands

```bash
# Setup
npm install express aws-sdk cors dotenv
cp .env.example .env

# Testing
npm run test:s3              # Test S3 configuration

# Development
npm run server               # Start backend (port 3001)
npm run dev                  # Start frontend (port 5173)

# Production
npm run build                # Build frontend
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server-presigned.js` | Backend server for presigned URLs |
| `.env` | AWS credentials (DO NOT COMMIT) |
| `src/utils/s3Upload.ts` | S3 utility functions |
| `src/components/CertificateNotification.tsx` | Certificate UI with upload |

## 🔑 Environment Variables

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=zen-garden-certificates
PORT=3001
```

## 🌐 Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/get-upload-url` | Get presigned URL |
| POST | `/api/get-download-url` | Get download URL |
| GET | `/api/certificates/:userId` | List certificates |
| GET | `/health` | Health check |

## 🔧 AWS Setup Checklist

- [ ] Create S3 bucket
- [ ] Configure CORS
- [ ] Create IAM user
- [ ] Save credentials
- [ ] Update .env file

## 📊 S3 Bucket Structure

```
zen-garden-certificates/
└── certificates/
    └── user-{id}/
        └── ZEN-{timestamp}-{random}.svg
```

## 🔐 CORS Configuration

```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT"],
  "AllowedOrigins": ["http://localhost:5173"],
  "ExposeHeaders": ["ETag"]
}]
```

## 💰 Cost

| Users | Certificates | Storage | Cost/Month |
|-------|--------------|---------|------------|
| 100 | 300 | 15MB | $0.002 |
| 1,000 | 3,000 | 150MB | $0.022 |
| 10,000 | 30,000 | 1.5GB | $0.220 |

**AWS Free Tier:** 5GB storage, 20k GET, 2k PUT/month = $0

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check .env file exists and has valid credentials |
| Upload fails | Verify backend is running on port 3001 |
| CORS error | Add your URL to S3 CORS configuration |
| Access denied | Check IAM permissions and bucket policy |
| File not visible | Verify ACL is 'public-read' |

## 📚 Documentation

| Document | When to Use |
|----------|-------------|
| `QUICKSTART.md` | First time setup (5 min) |
| `SETUP_CHECKLIST.md` | Step-by-step guide |
| `S3_PRESIGNED_SETUP.md` | Detailed setup & deployment |
| `ARCHITECTURE.md` | Understand the system |
| `README_S3.md` | Complete overview |

## 🧪 Testing Flow

```bash
# 1. Test S3 setup
npm run test:s3

# 2. Start backend
npm run server

# 3. Start frontend (new terminal)
npm run dev

# 4. In browser
# - Plant 9 trees
# - Click "Save to Cloud"
# - Check S3 bucket
```

## 🔄 Upload Flow

```
User → Generate SVG → Request URL → Get Presigned URL → Upload to S3 → Get Public URL
```

## 🎯 Success Indicators

✅ `npm run test:s3` passes
✅ Backend shows: "🚀 Presigned URL server running"
✅ Frontend loads without errors
✅ Certificate downloads work
✅ Certificate uploads to S3
✅ Public URL accessible
✅ File in S3 console

## 🚢 Deployment Quick Guide

### Heroku
```bash
heroku create
heroku config:set AWS_ACCESS_KEY_ID=xxx
heroku config:set AWS_SECRET_ACCESS_KEY=xxx
git push heroku main
```

### Vercel (Serverless Function)
```bash
vercel
# Add env vars in dashboard
```

### AWS Lambda
1. Create Lambda function
2. Add API Gateway trigger
3. Set environment variables
4. Deploy code

## 📞 Quick Links

- [AWS S3 Console](https://s3.console.aws.amazon.com/)
- [AWS IAM Console](https://console.aws.amazon.com/iam/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [S3 Pricing](https://aws.amazon.com/s3/pricing/)

## 💡 Pro Tips

- Use `npm run test:s3` before deploying
- Monitor costs in AWS Billing Dashboard
- Set up CloudWatch alerts for usage
- Use lifecycle policies to archive old files
- Consider CloudFront for faster delivery
- Implement rate limiting in production
- Add user authentication before going live

## 🆘 Emergency Commands

```bash
# Check if backend is running
curl http://localhost:3001/health

# Test presigned URL generation
curl -X POST http://localhost:3001/api/get-upload-url \
  -H "Content-Type: application/json" \
  -d '{"certificateNumber":"TEST","userId":"test","contentType":"image/svg+xml"}'

# Check S3 bucket
aws s3 ls s3://zen-garden-certificates/certificates/

# Delete test files
aws s3 rm s3://zen-garden-certificates/test/ --recursive
```

---

**Print this page for quick reference during setup!**
