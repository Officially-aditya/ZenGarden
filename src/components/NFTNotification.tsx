import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/gameStore';

const CertificateNotification: React.FC = () => {
  const { user } = useStore();
  const [notification, setNotification] = useState<any>(null);
  const prevCertCountRef = React.useRef(user.certificates.length);

  useEffect(() => {
    if (user.certificates.length > prevCertCountRef.current) {
      const newCert = user.certificates[user.certificates.length - 1];
      setNotification(newCert);
      setTimeout(() => setNotification(null), 5000);
    }
    prevCertCountRef.current = user.certificates.length;
  }, [user.certificates.length, user.certificates]);

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
            style={styles.nftEmoji}
          >
            {notification.emoji}
          </motion.div>
          <h2 style={styles.title}>🎉 Certificate Issued!</h2>
          <p style={styles.name}>{notification.name}</p>
          <p style={styles.rarity}>{notification.type.toUpperCase()}</p>
          <p style={styles.description}>{notification.description}</p>
          <p style={styles.tokenId}>Certificate No: {notification.certificateNumber}</p>
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
    maxWidth: '400px',
  },
  nftEmoji: {
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
  rarity: {
    color: '#8B4513',
    fontSize: '12px',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
  },
  description: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: '14px',
    margin: '0 0 15px 0',
    lineHeight: '1.5',
  },
  tokenId: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
};

export default CertificateNotification;
