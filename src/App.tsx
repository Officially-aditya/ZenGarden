import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ZenGarden from './components/ZenGarden';
import MiniGame from './components/MiniGame';
import Badges from './components/Badges';
import Leaderboard from './components/Leaderboard';
import CertificateNotification from './components/CertificateNotification';
import { useStore } from './store/gameStore';

type Tab = 'garden' | 'game' | 'badges' | 'leaderboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('garden');
  const { user, addPoints } = useStore();
  const [pointsAnimation, setPointsAnimation] = useState<number | null>(null);

  const handleAddPoints = (amount: number) => {
    addPoints(amount);
    setPointsAnimation(amount);
    setTimeout(() => setPointsAnimation(null), 2000);
  };

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'garden', label: 'Zen Garden', emoji: '🌿' },
    { id: 'game', label: 'Eco Defender', emoji: '🎮' },
    { id: 'badges', label: 'Achievements', emoji: '🏆' },
    { id: 'leaderboard', label: 'Leaderboard', emoji: '🏅' },
  ];

  return (
    <div style={styles.app}>
      {/* Certificate Notification */}
      <CertificateNotification />
      
      {/* Animated Background */}
      <div style={styles.backgroundParticles}>
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {['🍃', '✨', '🌸', '🌿'][Math.floor(Math.random() * 4)]}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <header style={styles.header}>
        <motion.div
          style={styles.logo}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span style={styles.logoEmoji}>🌳</span>
          <div style={styles.logoText}>
            <h1 style={styles.logoTitle}>Zen Garden</h1>
            <p style={styles.logoSubtitle}>Grow your impact, one tree at a time</p>
          </div>
        </motion.div>

        <div style={styles.headerStats}>
          <motion.div
            style={styles.pointsDisplay}
            whileHover={{ scale: 1.05 }}
          >
            <span style={styles.pointsIcon}>💰</span>
            <span style={styles.pointsValue}>{user.coins.toLocaleString()}</span>
            <span style={styles.pointsLabel}>Coins</span>
            <AnimatePresence>
              {pointsAnimation && (
                <motion.span
                  style={styles.pointsGain}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -30 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                >
                  +{pointsAnimation}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            style={styles.statsDisplay}
            whileHover={{ scale: 1.05 }}
          >
            <span style={styles.statsIcon}>⭐</span>
            <span style={styles.statsValue}>{user.totalPoints.toLocaleString()}</span>
            <span style={styles.statsLabel}>Total Points</span>
          </motion.div>
          
          <motion.button
            style={styles.donateButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddPoints(100)}
          >
            💚 Donate (+100 coins)
          </motion.button>
        </div>
      </header>

      {/* Navigation */}
      <nav style={styles.nav}>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            style={{
              ...styles.navButton,
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, #4CAF50, #8BC34A)'
                : 'rgba(255,255,255,0.1)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={styles.navEmoji}>{tab.emoji}</span>
            <span style={styles.navLabel}>{tab.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'garden' && <ZenGarden />}
            {activeTab === 'game' && <MiniGame />}
            {activeTab === 'badges' && <Badges />}
            {activeTab === 'leaderboard' && <Leaderboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          🌍 Every action counts. Your garden represents real environmental impact.
        </p>
        <div style={styles.footerLinks}>
          <a href="#" style={styles.footerLink}>About</a>
          <a href="#" style={styles.footerLink}>How It Works</a>
          <a href="#" style={styles.footerLink}>Partners</a>
          <a href="#" style={styles.footerLink}>Contact</a>
        </div>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundParticles: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    fontSize: '20px',
    opacity: 0.5,
  },
  header: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logoEmoji: {
    fontSize: '48px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoTitle: {
    color: '#4CAF50',
    fontSize: '28px',
    margin: 0,
    fontWeight: 'bold',
  },
  logoSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    margin: 0,
  },
  headerStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  pointsDisplay: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 20px',
    background: 'rgba(255, 215, 0, 0.2)',
    borderRadius: '30px',
    border: '1px solid rgba(255, 215, 0, 0.3)',
  },
  pointsGain: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#4CAF50',
    fontSize: '20px',
    fontWeight: 'bold',
    pointerEvents: 'none',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  statsDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 20px',
    background: 'rgba(156, 39, 176, 0.2)',
    borderRadius: '30px',
    border: '1px solid rgba(156, 39, 176, 0.3)',
  },
  statsIcon: {
    fontSize: '24px',
  },
  statsValue: {
    color: '#E1BEE7',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
  },
  pointsIcon: {
    fontSize: '24px',
  },
  pointsValue: {
    color: '#FFD700',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  pointsLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
  },
  donateButton: {
    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
  },
  nav: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    padding: '20px',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '30px',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  navEmoji: {
    fontSize: '20px',
  },
  navLabel: {
    fontWeight: '500',
  },
  main: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
  },
  footer: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '30px',
    marginTop: '40px',
    background: 'rgba(0,0,0,0.3)',
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    marginBottom: '15px',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s ease',
  },
};

export default App;
