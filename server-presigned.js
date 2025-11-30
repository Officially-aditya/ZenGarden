// Minimal Node.js/Express server for S3 presigned URL generation
// Install: npm install express aws-sdk cors dotenv

const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  signatureVersion: 'v4',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'zen-garden-certificates';

// Generate presigned URL for upload
app.post('/api/get-upload-url', async (req, res) => {
  try {
    const { certificateNumber, userId, contentType } = req.body;

    if (!certificateNumber || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const key = `certificates/${userId}/${certificateNumber}.svg`;

    // Generate presigned URL for PUT operation
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType || 'image/svg+xml',
      Expires: 300, // URL expires in 5 minutes
      ACL: 'public-read', // Make uploaded file publicly readable
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    res.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// Generate presigned URL for download (optional - for private files)
app.post('/api/get-download-url', async (req, res) => {
  try {
    const { certificateNumber, userId } = req.body;

    if (!certificateNumber || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const key = `certificates/${userId}/${certificateNumber}.svg`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: 3600, // URL expires in 1 hour
    };

    const downloadUrl = await s3.getSignedUrlPromise('getObject', params);

    res.json({ downloadUrl });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

// List user's certificates
app.get('/api/certificates/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const prefix = `certificates/${userId}/`;

    const params = {
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    };

    const data = await s3.listObjectsV2(params).promise();
    
    const certificates = data.Contents?.map(item => ({
      key: item.Key,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${item.Key}`,
      lastModified: item.LastModified,
      size: item.Size,
    })) || [];

    res.json({ certificates });
  } catch (error) {
    console.error('S3 list error:', error);
    res.status(500).json({ error: 'Failed to list certificates' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'certificate-upload' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Presigned URL server running on port ${PORT}`);
  console.log(`📦 S3 Bucket: ${BUCKET_NAME}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION || 'us-east-1'}`);
});
