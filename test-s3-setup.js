// Test script to verify S3 setup
// Run: node test-s3-setup.js

require('dotenv').config();
const AWS = require('aws-sdk');

console.log('🧪 Testing S3 Configuration...\n');

// Check environment variables
console.log('1. Checking environment variables...');
const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'S3_BUCKET_NAME'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Missing environment variables:', missing.join(', '));
  console.log('\n💡 Create a .env file with:');
  console.log('   AWS_ACCESS_KEY_ID=your_key');
  console.log('   AWS_SECRET_ACCESS_KEY=your_secret');
  console.log('   AWS_REGION=us-east-1');
  console.log('   S3_BUCKET_NAME=zen-garden-certificates');
  process.exit(1);
}

console.log('✅ All environment variables present\n');

// Configure S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Test 1: Check if bucket exists
console.log('2. Testing bucket access...');
s3.headBucket({ Bucket: BUCKET_NAME }, (err, data) => {
  if (err) {
    console.error('❌ Cannot access bucket:', err.message);
    console.log('\n💡 Make sure:');
    console.log('   - Bucket exists in AWS S3');
    console.log('   - Bucket name matches S3_BUCKET_NAME in .env');
    console.log('   - IAM user has permissions');
    process.exit(1);
  }
  
  console.log('✅ Bucket accessible\n');
  
  // Test 2: Generate presigned URL
  console.log('3. Testing presigned URL generation...');
  const params = {
    Bucket: BUCKET_NAME,
    Key: 'test/test-certificate.svg',
    ContentType: 'image/svg+xml',
    Expires: 300,
    ACL: 'public-read',
  };
  
  try {
    const url = s3.getSignedUrl('putObject', params);
    console.log('✅ Presigned URL generated successfully');
    console.log('   URL length:', url.length, 'characters\n');
    
    // Test 3: Test upload
    console.log('4. Testing actual upload...');
    const testSVG = '<svg width="100" height="100"><text x="10" y="20">Test</text></svg>';
    
    const https = require('https');
    const { URL } = require('url');
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'PUT',
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Length': Buffer.byteLength(testSVG),
      },
    };
    
    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Test file uploaded successfully\n');
        
        // Test 4: Verify file exists
        console.log('5. Verifying uploaded file...');
        s3.headObject({ Bucket: BUCKET_NAME, Key: 'test/test-certificate.svg' }, (err, data) => {
          if (err) {
            console.error('❌ Cannot verify uploaded file:', err.message);
          } else {
            console.log('✅ File verified in S3');
            console.log('   Size:', data.ContentLength, 'bytes');
            console.log('   Type:', data.ContentType, '\n');
            
            // Cleanup
            console.log('6. Cleaning up test file...');
            s3.deleteObject({ Bucket: BUCKET_NAME, Key: 'test/test-certificate.svg' }, (err) => {
              if (err) {
                console.error('⚠️  Could not delete test file:', err.message);
              } else {
                console.log('✅ Test file deleted\n');
              }
              
              console.log('🎉 All tests passed! Your S3 setup is working correctly.\n');
              console.log('Next steps:');
              console.log('1. Run: npm run server');
              console.log('2. Run: npm run dev (in another terminal)');
              console.log('3. Test certificate upload in the app');
            });
          }
        });
      } else {
        console.error('❌ Upload failed with status:', res.statusCode);
        console.log('\n💡 Check:');
        console.log('   - Bucket CORS configuration');
        console.log('   - IAM user has PutObject permission');
        console.log('   - Bucket allows public access');
      }
    });
    
    req.on('error', (err) => {
      console.error('❌ Upload request failed:', err.message);
    });
    
    req.write(testSVG);
    req.end();
    
  } catch (err) {
    console.error('❌ Error generating presigned URL:', err.message);
    process.exit(1);
  }
});
