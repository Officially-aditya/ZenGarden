# Quick Start Guide - S3 Certificate Upload

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install express aws-sdk cors dotenv
```

### Step 2: Set Up AWS (One-time)

1. **Create S3 Bucket:**
   - Go to https://s3.console.aws.amazon.com/
   - Click "Create bucket"
   - Name: `zen-garden-certificates`
   - Region: `us-east-1`
   - Uncheck "Block all public access"
   - Create bucket

2. **Add CORS to Bucket:**
   - Go to bucket → Permissions → CORS
   - Paste this:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT"],
       "AllowedOrigins": ["http://localhost:5173"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

3. **Create IAM User:**
   - Go to https://console.aws.amazon.com/iam/
   - Users → Add users
   - Name: `zen-garden-uploader`
   - Access type: Programmatic access
   - Attach policy: `AmazonS3FullAccess` (or custom policy)
   - Save Access Key ID and Secret Key

### Step 3: Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env with your AWS credentials
# Replace with your actual keys from Step 2
```

Your `.env` should look like:
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=zen-garden-certificates
PORT=3001
```

### Step 4: Start Backend Server
```bash
npm run server
```

You should see:
```
🚀 Presigned URL server running on port 3001
📦 S3 Bucket: zen-garden-certificates
🌍 Region: us-east-1
```

### Step 5: Start Frontend (New Terminal)
```bash
npm run dev
```

### Step 6: Test It!

1. Open http://localhost:5173
2. Plant 9 trees (click empty slots, costs 300 coins each)
3. Use "💚 Donate" button to get coins
4. When certificate appears, click "☁️ Save to Cloud"
5. Check your S3 bucket for the uploaded certificate!

## 🎯 What You Get

- ✅ Certificates automatically generated on achievements
- ✅ Download certificates as SVG files
- ✅ Upload certificates to S3 cloud storage
- ✅ Public URLs for sharing certificates
- ✅ Secure presigned URL uploads

## 🔧 Troubleshooting

**Backend won't start?**
```bash
# Make sure dependencies are installed
npm install express aws-sdk cors dotenv
```

**Upload fails?**
- Check backend is running on port 3001
- Verify AWS credentials in .env
- Check S3 bucket name matches
- Ensure CORS is configured

**Can't see uploaded files?**
- Go to S3 bucket → Objects
- Look in `certificates/user-xxxxx/` folder
- Check file has public-read ACL

## 📚 Full Documentation

- Detailed setup: `S3_PRESIGNED_SETUP.md`
- Certificate features: `CERTIFICATE_SETUP.md`

## 💰 Cost

AWS Free Tier includes:
- 5GB S3 storage
- 20,000 GET requests
- 2,000 PUT requests

**Your cost: $0/month** (within free tier)

## 🎉 Next Steps

1. Add user authentication
2. Deploy backend to production
3. Update frontend API URL for production
4. Monitor S3 usage in AWS Console

Need help? Check the full setup guide in `S3_PRESIGNED_SETUP.md`
