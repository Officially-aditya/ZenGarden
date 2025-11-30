import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/gameStore';

// Mock leaderboard data (in real app, this would come from backend)
const mockLeaderboard = [
  { rank: 1, name: 'EcoWarrior', score: 15420, trees: 9, avatar: '🦸' },
  { rank: 2, name: 'GreenThumb', score: 12350, trees: 8, avatar: '🧑‍🌾' },
  { rank: 3, name: 'TreeHugger', score: 10890, trees: 9, avatar: '🌳' },
  { rank: 4, name: 'NatureLover', score: 8760, trees: 7, avatar: '🦋' },
  { rank: 5, name: 'ForestKeeper', score: 7540, trees: 6, avatar: '🐻' },
  { rank: 6, name: 'LeafMaster', score: 6230, trees: 6, avatar: '🍃' },
  { rank: 7, name: 'SeedPlanter', score: 5120, trees: 5, avatar: '🌱' },
  { rank: 8, name: 'EarthGuard', score: 4890, trees: 5, avatar: '🌍' },
  { rank: 9, name: 'BioDefender', score: 3670, trees: 4, avatar: '🛡️' },
  { rank: 10, name: 'GreenNewbie', score: 2340, trees: 3, avatar: '🌿' },
];

const Leaderboard: React.FC = () => {
  const { user } = useStore();
  
  // Calculate user's rank
  const userScore = user.totalPoints;
  const userRank = mockLeaderboard.filter(p => p.score > userScore).length + 1;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🏅 Global Leaderboard</h2>
        <div style={styles.yourRank}>
          <span style={styles.rankLabel}>Your Rank</span>
          <span style={styles.rankValue}>#{userRank}</span>
        </div>
      </div>

      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...styles.activeTab }}>🌍 Global</button>
        <button style={styles.tab}>👥 Friends</button>
        <button style={styles.tab}>📅 Weekly</button>
      </div>

      <div style={styles.leaderboardList}>
        {mockLeaderboard.map((player, index) => (
          <motion.div
            key={player.rank}
            style={{
              ...styles.playerRow,
              background: index < 3 
                ? `linear-gradient(90deg, ${
                    index === 0 ? 'rgba(255, 215, 0, 0.2)' :
                    index === 1 ? 'rgba(192, 192, 192, 0.2)' :
                    'rgba(205, 127, 50, 0.2)'
                  }, transparent)`
                : 'rgba(0,0,0,0.2)',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.1)' }}
          >
            <div style={styles.rankSection}>
              {index < 3 ? (
                <span style={styles.medal}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
              ) : (
                <span style={styles.rankNumber}>#{player.rank}</span>
              )}
            </div>
            
            <div style={styles.playerInfo}>
              <span style={styles.avatar}>{player.avatar}</span>
              <span style={styles.playerName}>{player.name}</span>
            </div>
            
            <div style={styles.statsSection}>
              <div style={styles.statItem}>
                <span style={styles.statIcon}>⭐</span>
                <span style={styles.statText}>{player.score.toLocaleString()}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statIcon}>🌳</span>
                <span style={styles.statText}>{player.trees}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* User's position if not in top 10 */}
        {userRank > 10 && (
          <>
            <div style={styles.separator}>• • •</div>
            <motion.div
              style={{ ...styles.playerRow, ...styles.userRow }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={styles.rankSection}>
                <span style={styles.rankNumber}>#{userRank}</span>
              </div>
              <div style={styles.playerInfo}>
                <span style={styles.avatar}>😊</span>
                <span style={styles.playerName}>You</span>
              </div>
              <div style={styles.statsSection}>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>⭐</span>
                  <span style={styles.statText}>{userScore.toLocaleString()}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>🌳</span>
                  <span style={styles.statText}>{user.trees.length}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      <div style={styles.communityStats}>
        <h3 style={styles.communityTitle}>🌍 Community Impact</h3>
        <div style={styles.communityGrid}>
          <div style={styles.communityCard}>
            <span style={styles.communityValue}>1,247,832</span>
            <span style={styles.communityLabel}>Total Trees Planted</span>
          </div>
          <div style={styles.communityCard}>
            <span style={styles.communityValue}>89,421</span>
            <span style={styles.communityLabel}>Active Gardeners</span>
          </div>
          <div style={styles.communityCard}>
            <span style={styles.communityValue}>$127,450</span>
            <span style={styles.communityLabel}>Donated to Earth</span>
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
  yourRank: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  rankLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
  },
  rankValue: {
    color: '#4CAF50',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  tab: {
    flex: 1,
    padding: '10px',
    background: 'rgba(0,0,0,0.3)',
    border: 'none',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    background: 'rgba(76, 175, 80, 0.3)',
    color: '#fff',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '25px',
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
  },
  userRow: {
    border: '2px solid #4CAF50',
    background: 'rgba(76, 175, 80, 0.2) !important',
  },
  rankSection: {
    width: '50px',
  },
  medal: {
    fontSize: '24px',
  },
  rankNumber: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    fontSize: '28px',
  },
  playerName: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '500',
  },
  statsSection: {
    display: 'flex',
    gap: '20px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  statIcon: {
    fontSize: '14px',
  },
  statText: {
    color: '#fff',
    fontSize: '14px',
  },
  separator: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    padding: '10px',
  },
  communityStats: {
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(0, 188, 212, 0.2))',
    borderRadius: '12px',
  },
  communityTitle: {
    color: '#81D4FA',
    fontSize: '18px',
    margin: '0 0 15px 0',
  },
  communityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },
  communityCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
  },
  communityValue: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  communityLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '11px',
    textAlign: 'center',
  },
};

export default Leaderboard;
