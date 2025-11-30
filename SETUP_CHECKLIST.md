# S3 Integration Setup Checklist

Use this checklist to ensure everything is configured correctly.

## ☐ Prerequisites

- [ ] Node.js installed (v14 or higher)
- [ ] npm installed
- [ ] AWS account created
- [ ] Git repository initialized

## ☐ Step 1: Install Dependencies

```bash
npm install express aws-sdk cors dotenv
```

**Verify:**
- [ ] No installation errors
- [ ] Check `node_modules` folder exists

## ☐ Step 2: AWS S3 Bucket Setup

### Create Bucket
- [ ] Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
- [ ] Click "Create bucket"
- [ ] Bucket name: `zen-garden-certificates` (or your choice)
- [ ] Region: `us-east-1` (or your preferred region)
- [ ] Uncheck "Block all public access"
- [ ] Acknowledge warning
- [ ] Click "Create bucket"

### Configure CORS
- [ ] Go to bucket → Permissions → CORS
- [ ] Paste CORS configuration:
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
- [ ] Click "Save changes"

**Verify:**
- [ ] Bucket appears in S3 console
- [ ] CORS configuration saved
- [ ] Public access settings correct

## ☐ Step 3: IAM User Setup

### Create User
- [ ] Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
- [ ] Click Users → Add users
- [ ] Username: `zen-garden-uploader`
- [ ] Access type: ✅ Programmatic access
- [ ] Click "Next: Permissions"

### Attach Policy
- [ ] Click "Attach existing policies directly"
- [ ] Search for "S3"
- [ ] Select `AmazonS3FullAccess` (or create custom policy)
- [ ] Click "Next: Tags" → "Next: Review" → "Create user"

### Save Credentials
- [ ] Copy **Access Key ID**
- [ ] Copy **Secret Access Key**
- [ ] Store securely (you won't see secret key again!)

**Verify:**
- [ ] User created successfully
- [ ] Credentials saved
- [ ] Policy attached

## ☐ Step 4: Environment Configuration

### Create .env File
```bash
cp .env.example .env
```

### Edit .env
- [ ] Open `.env` file
- [ ] Replace `AWS_ACCESS_KEY_ID` with your key
- [ ] Replace `AWS_SECRET_ACCESS_KEY` with your secret
- [ ] Set `AWS_REGION` (e.g., `us-east-1`)
- [ ] Set `S3_BUCKET_NAME` (e.g., `zen-garden-certificates`)
- [ ] Set `PORT` (default: `3001`)

**Your .env should look like:**
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=zen-garden-certificates
PORT=3001
```

**Verify:**
- [ ] `.env` file exists
- [ ] All values filled in
- [ ] No spaces around `=` signs
- [ ] File is in `.gitignore`

## ☐ Step 5: Test S3 Configuration

```bash
npm run test:s3
```

**Expected output:**
```
🧪 Testing S3 Configuration...

1. Checking environment variables...
✅ All environment variables present

2. Testing bucket access...
✅ Bucket accessible

3. Testing presigned URL generation...
✅ Presigned URL generated successfully

4. Testing actual upload...
✅ Test file uploaded successfully

5. Verifying uploaded file...
✅ File verified in S3

6. Cleaning up test file...
✅ Test file deleted

🎉 All tests passed!
```

**Verify:**
- [ ] All tests pass
- [ ] No error messages
- [ ] Test file uploaded and deleted

## ☐ Step 6: Start Backend Server

```bash
npm run server
```

**Expected output:**
```
🚀 Presigned URL server running on port 3001
📦 S3 Bucket: zen-garden-certificates
🌍 Region: us-east-1
```

**Verify:**
- [ ] Server starts without errors
- [ ] Port 3001 is listening
- [ ] Correct bucket name displayed
- [ ] Correct region displayed

**Test health endpoint:**
```bash
curl http://localhost:3001/health
```

Expected: `{"status":"ok","service":"certificate-upload"}`

- [ ] Health check returns OK

## ☐ Step 7: Start Frontend

**In a new terminal:**
```bash
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Verify:**
- [ ] Frontend starts without errors
- [ ] Port 5173 is accessible
- [ ] No TypeScript errors
- [ ] Browser opens automatically

## ☐ Step 8: Test Certificate Upload

### Earn a Certificate
1. [ ] Open http://localhost:5173 in browser
2. [ ] Click "💚 Donate" button multiple times to get coins
3. [ ] Click empty garden slots to plant trees (300 coins each)
4. [ ] Plant all 9 trees
5. [ ] Certificate notification appears

### Test Download
- [ ] Click "📥 Download Certificate" button
- [ ] SVG file downloads to your computer
- [ ] Open SVG file to verify it displays correctly

### Test Cloud Upload
- [ ] Click "☁️ Save to Cloud" button
- [ ] Wait for upload (should take 1-2 seconds)
- [ ] Success message appears with public URL
- [ ] Copy the public URL

### Verify in S3
- [ ] Go to AWS S3 Console
- [ ] Open your bucket
- [ ] Navigate to `certificates/user-xxxxx/`
- [ ] Certificate file is present
- [ ] Click file to view details
- [ ] File size is reasonable (~2-5 KB)
- [ ] Content-Type is `image/svg+xml`

### Test Public URL
- [ ] Paste public URL in new browser tab
- [ ] Certificate displays correctly
- [ ] No access denied errors

## ☐ Step 9: Security Check

- [ ] `.env` file is in `.gitignore`
- [ ] AWS credentials not in any code files
- [ ] CORS only allows your domains
- [ ] IAM user has minimal permissions
- [ ] Presigned URLs expire (5 minutes)
- [ ] No sensitive data in frontend code

## ☐ Step 10: Production Preparation

### Update CORS for Production
- [ ] Add production domain to S3 CORS
- [ ] Example: `https://yourdomain.com`

### Environment Variables
- [ ] Set `VITE_API_URL` for production
- [ ] Configure production backend URL

### Deploy Backend
Choose one:
- [ ] Option A: Heroku/DigitalOcean
- [ ] Option B: AWS Lambda + API Gateway
- [ ] Option C: Vercel/Netlify Serverless Functions

### Deploy Frontend
- [ ] Build: `npm run build`
- [ ] Deploy to Vercel/Netlify/etc.
- [ ] Update API URL in production

## ☐ Troubleshooting Checklist

If something doesn't work, check:

### Backend Issues
- [ ] `.env` file exists and has correct values
- [ ] Port 3001 is not in use by another app
- [ ] AWS credentials are valid
- [ ] Bucket name matches exactly
- [ ] Region matches bucket region

### Upload Issues
- [ ] Backend server is running
- [ ] Frontend can reach backend (check browser console)
- [ ] CORS includes `http://localhost:5173`
- [ ] IAM user has PutObject permission
- [ ] Bucket allows public access

### Access Issues
- [ ] File has `public-read` ACL
- [ ] Bucket public access settings allow it
- [ ] URL is correct (check region in URL)
- [ ] File was uploaded successfully

## ☐ Final Verification

Run through complete flow:
1. [ ] Backend running: `npm run server`
2. [ ] Frontend running: `npm run dev`
3. [ ] Earn certificate in app
4. [ ] Download works
5. [ ] Upload to S3 works
6. [ ] Public URL accessible
7. [ ] File visible in S3 console

## 🎉 Success Criteria

You're done when:
- ✅ All tests pass
- ✅ Backend and frontend running
- ✅ Certificate downloads locally
- ✅ Certificate uploads to S3
- ✅ Public URL works
- ✅ File visible in S3 console

## 📚 Next Steps

After completing setup:
- [ ] Read `S3_PRESIGNED_SETUP.md` for deployment options
- [ ] Review `ARCHITECTURE.md` to understand the system
- [ ] Check `S3_INTEGRATION_SUMMARY.md` for overview
- [ ] Add user authentication
- [ ] Set up monitoring
- [ ] Deploy to production

## 🆘 Getting Help

If you're stuck:
1. Run `npm run test:s3` to diagnose
2. Check browser console for errors
3. Check backend terminal for errors
4. Review AWS CloudWatch logs
5. Verify all checklist items above

## 📝 Notes

- AWS Free Tier: 5GB storage, 20k GET, 2k PUT requests/month
- Estimated cost: ~$0.02/month for 1,000 users
- Presigned URLs expire after 5 minutes
- Files are publicly readable by default
- Backend can be deployed serverless for zero maintenance

---

**Date Completed:** _______________
**Completed By:** _______________
**Production URL:** _______________
