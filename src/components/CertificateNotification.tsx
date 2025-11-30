import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/gameStore';
import { Certificate } from '../types';
import { uploadToS3 as uploadToS3Util, checkS3Backend } from '../utils/s3Upload';

const CertificateNotification: React.FC = () => {
  const { user } = useStore();
  const [notification, setNotification] = useState<Certificate | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const prevCertCountRef = React.useRef(user.certificates.length);

  useEffect(() => {
    if (user.certificates.length > prevCertCountRef.current) {
      const newCert = user.certificates[user.certificates.length - 1];
      setNotification(newCert);
      setTimeout(() => setNotification(null), 10000); // Show for 10 seconds
    }
    prevCertCountRef.current = user.certificates.length;
  }, [user.certificates.length, user.certificates]);

  const generateCertificateSVG = (cert: Certificate): string => {
    const userName = 'Eco Warrior'; // In production, get from user profile
    const date = new Date(cert.earnedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#8BC34A;stop-opacity:0.1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="800" height="600" fill="#ffffff"/>
        <rect width="800" height="600" fill="url(#bgGradient)"/>
        
        <!-- Border -->
        <rect x="30" y="30" width="740" height="540" fill="none" stroke="#4CAF50" stroke-width="3"/>
        <rect x="40" y="40" width="720" height="520" fill="none" stroke="#8BC34A" stroke-width="1"/>
        
        <!-- Decorative corners -->
        <circle cx="60" cy="60" r="8" fill="#4CAF50"/>
        <circle cx="740" cy="60" r="8" fill="#4CAF50"/>
        <circle cx="60" cy="540" r="8" fill="#4CAF50"/>
        <circle cx="740" cy="540" r="8" fill="#4CAF50"/>
        
        <!-- Header -->
        <text x="400" y="100" font-family="Georgia, serif" font-size="48" font-weight="bold" 
              fill="#2E7D32" text-anchor="middle" filter="url(#shadow)">
          Certificate of Achievement
        </text>
        
        <!-- Emoji -->
        <text x="400" y="180" font-size="80" text-anchor="middle">${cert.emoji}</text>
        
        <!-- Certificate Name -->
        <text x="400" y="250" font-family="Georgia, serif" font-size="32" font-weight="bold" 
              fill="#1B5E20" text-anchor="middle">
          ${cert.name}
        </text>
        
        <!-- Presented to -->
        <text x="400" y="300" font-family="Arial, sans-serif" font-size="18" 
              fill="#666" text-anchor="middle">
          This certificate is proudly presented to
        </text>
        
        <!-- User Name -->
        <text x="400" y="350" font-family="Georgia, serif" font-size="36" font-weight="bold" 
              fill="#1B5E20" text-anchor="middle" font-style="italic">
          ${userName}
        </text>
        
        <!-- Description -->
        <text x="400" y="410" font-family="Arial, sans-serif" font-size="16" 
              fill="#555" text-anchor="middle">
          ${cert.description}
        </text>
        
        <!-- Date and Certificate Number -->
        <text x="150" y="510" font-family="Arial, sans-serif" font-size="14" fill="#666">
          Date: ${date}
        </text>
        <text x="650" y="510" font-family="Arial, sans-serif" font-size="14" 
              fill="#666" text-anchor="end">
          ${cert.certificateNumber}
        </text>
        
        <!-- Signature Line -->
        <line x1="300" y1="480" x2="500" y2="480" stroke="#999" stroke-width="1"/>
        <text x="400" y="495" font-family="Arial, sans-serif" font-size="12" 
              fill="#666" text-anchor="middle">
          Zen Garden Authority
        </text>
      </svg>
    `;
  };

  const downloadCertificate = async () => {
    if (!notification) return;
    
    setIsDownloading(true);
    try {
      const svg = generateCertificateSVG(notification);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${notification.certificateNumber}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('📥 Certificate downloaded successfully');
    } catch (error) {
      console.error('Error downloading certificate:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const uploadToS3 = async () => {
    if (!notification) return;
    
    setIsDownloading(true);
    try {
      // Check if backend is available
      const backendAvailable = await checkS3Backend();
      if (!backendAvailable) {
        throw new Error('BACKEND_NOT_AVAILABLE');
      }

      const svg = generateCertificateSVG(notification);
      const userId = 'user-' + Math.random().toString(36).substring(7); // Replace with actual user ID from auth
      
      // Upload using presigned URL utility
      const result = await uploadToS3Util(
        svg,
        notification.certificateNumber,
        userId,
        'image/svg+xml'
      );
      
      if (result.success && result.publicUrl) {
        console.log('☁️ Certificate uploaded to S3:', result.publicUrl);
        alert(`✅ Certificate uploaded successfully!\n\nAccess it at:\n${result.publicUrl}`);
        
        // Optional: Update certificate in store with S3 URL
        // updateCertificateUrl(notification.id, result.publicUrl);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Error uploading to S3:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage === 'BACKEND_NOT_AVAILABLE' || errorMessage.includes('Failed to fetch')) {
        alert('⚠️ Backend server not running!\n\nTo enable cloud upload:\n1. Run: npm install express aws-sdk cors dotenv\n2. Create .env with AWS credentials\n3. Run: node server-presigned.js\n\nYou can still download the certificate locally!');
      } else {
        alert(`❌ Upload failed: ${errorMessage}\n\nYou can still download the certificate locally!`);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          style={styles.notification}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            style={styles.emoji}
          >
            {notification.emoji}
          </motion.div>
          
          <h2 style={styles.title}>🎉 Certificate Earned!</h2>
          <p style={styles.name}>{notification.name}</p>
          <p style={styles.type}>{notification.type.toUpperCase()}</p>
          <p style={styles.description}>{notification.description}</p>
          <p style={styles.certNumber}>Certificate No: {notification.certificateNumber}</p>
          
          <div style={styles.buttonContainer}>
            <motion.button
              style={styles.downloadButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadCertificate}
              disabled={isDownloading}
            >
              {isDownloading ? '⏳ Processing...' : '📥 Download Certificate'}
            </motion.button>
            
            <motion.button
              style={styles.uploadButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={uploadToS3}
              disabled={isDownloading}
            >
              {isDownloading ? '⏳ Uploading...' : '☁️ Save to Cloud'}
            </motion.button>
          </div>
          
          <button
            style={styles.closeButton}
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const styles: Record<string, React.CSSProperties> = {
  notification: {
    position: 'fixed',
    top: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 152, 0, 0.95))',
    padding: '30px 40px',
    borderRadius: '20px',
    boxShadow: '0 10px 50px rgba(255, 215, 0, 0.5)',
    border: '3px solid rgba(255,255,255,0.5)',
    textAlign: 'center',
    maxWidth: '450px',
    minWidth: '400px',
  },
  emoji: {
    fontSize: '80px',
    marginBottom: '10px',
  },
  title: {
    color: '#000',
    fontSize: '28px',
    margin: '0 0 10px 0',
    fontWeight: 'bold',
  },
  name: {
    color: '#000',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
  },
  type: {
    color: '#8B4513',
    fontSize: '12px',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    textTransform: 'uppercase',
  },
  description: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: '14px',
    margin: '0 0 15px 0',
    lineHeight: '1.5',
  },
  certNumber: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: '11px',
    fontFamily: 'monospace',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '15px',
  },
  downloadButton: {
    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '25px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
    transition: 'all 0.3s ease',
  },
  uploadButton: {
    background: 'linear-gradient(135deg, #2196F3, #03A9F4)',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '25px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
    transition: 'all 0.3s ease',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default CertificateNotification;
