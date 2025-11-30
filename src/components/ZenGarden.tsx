import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/gameStore';
import { TREE_VISUALS, TREE_LEVEL_THRESHOLDS } from '../types';

// Function to generate and download certificate
const downloadCertificate = (cert: any) => {
  // Create certificate canvas
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d')!;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 800, 600);
  gradient.addColorStop(0, '#1a472a');
  gradient.addColorStop(1, '#2d5a27');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 600);

  // Border
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, 760, 560);

  // Title
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🌿 ZEN GARDEN UNIVERSE', 400, 100);

  // Certificate type
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(cert.name, 400, 180);

  // Description
  ctx.font = '20px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const words = cert.description.split(' ');
  let line = '';
  let y = 250;
  words.forEach((word: string) => {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 600) {
      ctx.fillText(line, 400, y);
      line = word + ' ';
      y += 30;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line, 400, y);

  // Date
  ctx.font = '18px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(`Issued on: ${new Date(cert.earnedAt).toLocaleDateString()}`, 400, 380);

  // Certificate number
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`Certificate No: ${cert.certificateNumber}`, 400, 420);

  // Signature line
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(250, 500);
  ctx.lineTo(550, 500);
  ctx.stroke();

  ctx.font = '16px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('Zen Garden Universe Team', 400, 530);

  // Convert to blob and download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert.certificateNumber}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });
};

const ZenGarden: React.FC = () => {
  const { user, plantTree, upgradeTree } = useStore();
  const { trees, coins } = user;

  const getTreeAtPosition = (pos: number) => trees.find(t => t.gridPosition === pos);

  const getUpgradeCost = (tree: any) => {
    if (tree.level >= 6) return 0;
    const nextLevelThreshold = TREE_LEVEL_THRESHOLDS[(tree.level + 1) as keyof typeof TREE_LEVEL_THRESHOLDS];
    return nextLevelThreshold - tree.points;
  };

  const handleCellClick = (pos: number) => {
    const tree = getTreeAtPosition(pos);
    
    if (!tree && coins >= 300) {
      // Plant new tree
      plantTree(pos);
    } else if (tree && tree.level < 6) {
      // Upgrade existing tree
      const upgradeCost = getUpgradeCost(tree);
      if (coins >= upgradeCost) {
        upgradeTree(tree.id);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🌿 Your Zen Garden</h2>
        <div style={styles.stats}>
          <span style={styles.stat}>💰 {coins} coins</span>
          <span style={styles.stat}>🌳 {trees.length}/9 trees</span>
        </div>
      </div>

      <div style={styles.gardenContainer}>
        <div style={styles.garden}>
          {Array.from({ length: 9 }, (_, i) => {
            const tree = getTreeAtPosition(i);
            const visual = tree ? TREE_VISUALS[tree.level] : null;
            const canPlant = !tree && coins >= 300;

            return (
              <motion.div
                key={i}
                style={{
                  ...styles.cell,
                  background: tree 
                    ? 'linear-gradient(145deg, #2d5a27 0%, #1e3d1a 100%)'
                    : 'linear-gradient(145deg, #3d2b1f 0%, #2a1f16 100%)',
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(76, 175, 80, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCellClick(i)}
              >
                <AnimatePresence>
                  {tree && visual ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      style={styles.treeContainer}
                    >
                      <motion.span
                        style={{ ...styles.treeEmoji, fontSize: visual.size }}
                        animate={{ 
                          y: [0, -5, 0],
                          rotate: [-2, 2, -2],
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {visual.emoji}
                      </motion.span>
                      <div style={styles.levelBadge}>Lv.{tree.level}</div>
                      {tree.level < 6 && (
                        <div style={styles.upgradeButton}>
                          <span style={styles.upgradeText}>
                            ⬆️ {getUpgradeCost(tree)} coins
                          </span>
                        </div>
                      )}
                      {tree.level >= 6 && (
                        <div style={styles.maxLevel}>MAX</div>
                      )}
                      <span style={styles.treeName}>{visual.name}</span>
                    </motion.div>
                  ) : canPlant ? (
                    <motion.div
                      style={styles.emptySlot}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span style={styles.plusIcon}>+</span>
                      <span style={styles.plantText}>Plant (300 pts)</span>
                    </motion.div>
                  ) : (
                    <div style={styles.lockedSlot}>
                      <span style={styles.lockIcon}>🔒</span>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div style={styles.legend}>
        <h3 style={styles.legendTitle}>Tree Growth Stages</h3>
        <div style={styles.legendItems}>
          {Object.entries(TREE_VISUALS).map(([level, visual]) => (
            <div key={level} style={styles.legendItem}>
              <span style={{ fontSize: 20 }}>{visual.emoji}</span>
              <span style={styles.legendText}>Lv.{level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Collection */}
      {user.certificates.length > 0 && (
        <div style={styles.certSection}>
          <h3 style={styles.certTitle}>📜 Your Certificates</h3>
          <div style={styles.certGrid}>
            {user.certificates.map((cert) => (
              <motion.div
                key={cert.id}
                style={{
                  ...styles.certCard,
                  background: cert.type === 'mastery' 
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 152, 0, 0.3))'
                    : cert.type === 'achievement'
                    ? 'linear-gradient(135deg, rgba(156, 39, 176, 0.3), rgba(103, 58, 183, 0.3))'
                    : 'linear-gradient(135deg, rgba(33, 150, 243, 0.3), rgba(3, 169, 244, 0.3))',
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.05 }}
              >
                <span style={styles.certEmoji}>{cert.emoji}</span>
                <span style={styles.certName}>{cert.name}</span>
                <span style={styles.certType}>{cert.type.toUpperCase()}</span>
                <span style={styles.certNumber}>#{cert.certificateNumber.slice(-6)}</span>
                <motion.button
                  style={styles.downloadButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => downloadCertificate(cert)}
                >
                  📥 Download
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
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
    color: '#4CAF50',
    fontSize: '24px',
    margin: 0,
  },
  stats: {
    display: 'flex',
    gap: '20px',
  },
  stat: {
    color: '#fff',
    fontSize: '16px',
    background: 'rgba(76, 175, 80, 0.2)',
    padding: '8px 16px',
    borderRadius: '20px',
  },
  gardenContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(180deg, #87CEEB 0%, #98D8AA 50%, #5D4037 100%)',
    borderRadius: '16px',
    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)',
  },
  garden: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    padding: '20px',
    background: 'rgba(139, 90, 43, 0.6)',
    borderRadius: '12px',
  },
  cell: {
    width: '120px',
    height: '120px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  treeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  treeEmoji: {
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
  },
  levelBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    color: '#000',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '10px',
  },
  progressBar: {
    width: '80%',
    height: '4px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
    borderRadius: '2px',
  },
  treeName: {
    color: '#fff',
    fontSize: '10px',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  emptySlot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  plusIcon: {
    fontSize: '32px',
    color: 'rgba(76, 175, 80, 0.7)',
  },
  plantText: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.7)',
  },
  lockedSlot: {
    opacity: 0.3,
  },
  lockIcon: {
    fontSize: '24px',
  },
  legend: {
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '12px',
  },
  legendTitle: {
    color: '#fff',
    fontSize: '14px',
    margin: '0 0 10px 0',
    opacity: 0.8,
  },
  legendItems: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  legendItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  legendText: {
    color: '#fff',
    fontSize: '11px',
    opacity: 0.7,
  },
  upgradeButton: {
    position: 'absolute',
    bottom: '8px',
    background: 'rgba(76, 175, 80, 0.9)',
    padding: '2px 8px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  upgradeText: {
    color: '#fff',
    fontSize: '9px',
    fontWeight: 'bold',
  },
  maxLevel: {
    position: 'absolute',
    bottom: '8px',
    background: 'rgba(255, 215, 0, 0.9)',
    padding: '2px 8px',
    borderRadius: '8px',
    color: '#000',
    fontSize: '9px',
    fontWeight: 'bold',
  },
  certSection: {
    marginTop: '20px',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 152, 0, 0.1))',
    borderRadius: '12px',
    border: '2px solid rgba(255, 215, 0, 0.3)',
  },
  certTitle: {
    color: '#FFD700',
    fontSize: '18px',
    margin: '0 0 15px 0',
    textAlign: 'center',
  },
  certGrid: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  certCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.2)',
    minWidth: '180px',
  },
  certEmoji: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  certName: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '5px',
    textAlign: 'center',
  },
  certType: {
    color: '#FFD700',
    fontSize: '10px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  certNumber: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '9px',
    fontFamily: 'monospace',
    marginBottom: '10px',
  },
  downloadButton: {
    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '15px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default ZenGarden;
