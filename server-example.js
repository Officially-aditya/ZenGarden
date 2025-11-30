// Example Node.js/Express server for S3 certificate upload
// Install dependencies: npm install express aws-sdk cors dotenv

const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'zen-garden-certificates';

// Upload certificate to S3
app.post('/api/upload-certificate', async (req, res) => {
  try {
    const { certificateNumber, svg, userId } = req.body;

    if (!certificateNumber || !svg) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create S3 key (path) for the certificate
    const key = `certificates/${userId}/${certificateNumber}.svg`;

    // Upload to S3
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: Buffer.from(svg, 'utf-8'),
      ContentType: 'image/svg+xml',
      ACL: 'public-read', // Make it publicly accessible
      Metadata: {
        userId: userId,
        certificateNumber: certificateNumber,
        uploadedAt: new Date().toISOString(),
      },
    };

    const result = await s3.upload(params).promise();

    console.log('Certificate uploaded to S3:', result.Location);

    res.json({
      success: true,
      url: result.Location,
      key: result.Key,
    });
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ error: 'Failed to upload certificate' });
  }
});

// Get certificate from S3
app.get('/api/certificate/:userId/:certificateNumber', async (req, res) => {
  try {
    const { userId, certificateNumber } = req.params;
    const key = `certificates/${userId}/${certificateNumber}.svg`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const data = await s3.getObject(params).promise();
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(data.Body);
  } catch (error) {
    console.error('S3 download error:', error);
    res.status(404).json({ error: 'Certificate not found' });
  }
});

// List all certificates for a user
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
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${item.Key}`,
      lastModified: item.LastModified,
      size: item.Size,
    })) || [];

    res.json({ certificates });
  } catch (error) {
    console.error('S3 list error:', error);
    res.status(500).json({ error: 'Failed to list certificates' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
