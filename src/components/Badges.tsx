import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/gameStore';

const Badges: React.FC = () => {
  const { user } = useStore();
  const { badges, highScore, gamesPlayed, streak } = user;

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🏆 Achievements</h2>
        <span style={styles.progress}>{earnedCount}/{badges.length} Unlocked</span>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statEmoji}>🎮</span>
          <span style={styles.statValue}>{gamesPlayed}</span>
          <span style={styles.statLabel}>Games Played</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statEmoji}>⭐</span>
          <span style={styles.statValue}>{highScore}</span>
          <span style={styles.statLabel}>High Score</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statEmoji}>🔥</span>
          <span style={styles.statValue}>{streak}</span>
          <span style={styles.statLabel}>Day Streak</span>
        </div>
      </div>

      <div style={styles.badgeGrid}>
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            style={{
              ...styles.badgeCard,
              opacity: badge.earned ? 1 : 0.4,
              background: badge.earned 
                ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 152, 0, 0.2))'
                : 'rgba(0,0,0,0.3)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: badge.earned ? 1 : 0.4, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.span
              style={styles.badgeEmoji}
              animate={badge.earned ? { 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 0.5, repeat: badge.earned ? Infinity : 0, repeatDelay: 3 }}
            >
              {badge.emoji}
            </motion.span>
            <span style={styles.badgeName}>{badge.name}</span>
            <span style={styles.badgeDesc}>{badge.description}</span>
            {badge.earned && (
              <motion.div
                style={styles.earnedBadge}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div style={styles.nftSection}>
        <h3 style={styles.nftTitle}>🎨 NFT Collection</h3>
        <p style={styles.nftDesc}>Earn special NFTs by completing achievements!</p>
        <div style={styles.nftGrid}>
          <div style={{ ...styles.nftCard, opacity: earnedCount >= 3 ? 1 : 0.3 }}>
            <span style={styles.nftEmoji}>🌸</span>
            <span style={styles.nftName}>Cherry Blossom</span>
            <span style={styles.nftReq}>3 badges</span>
          </div>
          <div style={{ ...styles.nftCard, opacity: earnedCount >= 5 ? 1 : 0.3 }}>
            <span style={styles.nftEmoji}>🌲</span>
            <span style={styles.nftName}>Legendary Redwood</span>
            <span style={styles.nftReq}>5 badges</span>
          </div>
          <div style={{ ...styles.nftCard, opacity: highScore >= 1000 ? 1 : 0.3 }}>
            <span style={styles.nftEmoji}>👑</span>
            <span style={styles.nftName}>Golden Tree</span>
            <span style={styles.nftReq}>1000+ score</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    color: '#FFD700',
    fontSize: '24px',
    margin: 0,
  },
  progress: {
    color: '#fff',
    fontSize: '14px',
    background: 'rgba(255, 215, 0, 0.2)',
    padding: '6px 12px',
    borderRadius: '15px',
  },
  statsRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px',
  },
  statCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '12px',
  },
  statEmoji: {
    fontSize: '24px',
    marginBottom: '5px',
  },
  statValue: {
    color: '#fff',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
  },
  badgeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '25px',
  },
  badgeCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px 10px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  badgeEmoji: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  badgeName: {
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '4px',
  },
  badgeDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '10px',
    textAlign: 'center',
  },
  earnedBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    width: '20px',
    height: '20px',
    background: '#4CAF50',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  nftSection: {
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(103, 58, 183, 0.2))',
    borderRadius: '12px',
  },
  nftTitle: {
    color: '#E1BEE7',
    fontSize: '18px',
    margin: '0 0 5px 0',
  },
  nftDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    margin: '0 0 15px 0',
  },
  nftGrid: {
    display: 'flex',
    gap: '12px',
  },
  nftCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  nftEmoji: {
    fontSize: '36px',
    marginBottom: '8px',
  },
  nftName: {
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '4px',
  },
  nftReq: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '10px',
  },
};

export default Badges;
