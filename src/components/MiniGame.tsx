import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/gameStore';
import { DEFENDER_CONFIG, ENEMY_CONFIG, DefenderType, EnemyType } from '../types';

const LANES = 5;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

const MiniGame: React.FC = () => {
  const { game, user, startGame, endGame, pauseGame, resumeGame, selectDefender, placeDefender, spawnEnemy, updateGame, nextWave } = useStore();
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const waveTimerRef = useRef<number>(0);
  const enemySpawnRef = useRef<number>(0);
  const [damageFlash, setDamageFlash] = React.useState(false);
  const [waveNotification, setWaveNotification] = React.useState<number | null>(null);
  const prevHealthRef = useRef(game.health);
  const prevWaveRef = useRef(game.wave);
  const enemiesSpawnedRef = useRef(0);
  const prevCoinsRef = useRef(user.coins);

  // Detect health changes for damage flash
  React.useEffect(() => {
    if (game.health < prevHealthRef.current) {
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 200);
    }
    prevHealthRef.current = game.health;
  }, [game.health]);

  // Detect wave changes for notification
  React.useEffect(() => {
    if (game.wave > prevWaveRef.current && game.isPlaying) {
      setWaveNotification(game.wave);
      setTimeout(() => setWaveNotification(null), 2000);
      enemiesSpawnedRef.current = 0; // Reset enemy counter for new wave
    }
    prevWaveRef.current = game.wave;
  }, [game.wave, game.isPlaying]);

  // Log coin changes
  React.useEffect(() => {
    if (user.coins !== prevCoinsRef.current) {
      const diff = user.coins - prevCoinsRef.current;
      console.log(`💰 Coins changed: ${prevCoinsRef.current} → ${user.coins} (${diff > 0 ? '+' : ''}${diff})`);
      prevCoinsRef.current = user.coins;
    }
  }, [user.coins]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (game.isPlaying && !game.isPaused && !game.gameOver && !game.victory) {
      updateGame(deltaTime);

      // Enemy spawning logic - spawn a set number per wave
      const enemiesPerWave = 5 + game.wave * 2; // Wave 1: 7 enemies, Wave 2: 9, etc.
      if (enemiesSpawnedRef.current < enemiesPerWave) {
        enemySpawnRef.current += deltaTime;
        const spawnInterval = Math.max(1000, 2500 - game.wave * 150);
        if (enemySpawnRef.current > spawnInterval) {
          const enemyTypes: EnemyType[] = ['smoke', 'trash', 'oil', 'fire'];
          if (game.wave >= 5) enemyTypes.push('boss');
          const randomType = enemyTypes[Math.floor(Math.random() * Math.min(enemyTypes.length, game.wave))];
          const randomLane = Math.floor(Math.random() * LANES);
          spawnEnemy(randomType, randomLane);
          enemySpawnRef.current = 0;
          enemiesSpawnedRef.current++;
        }
      }

      // Wave progression - advance when all enemies for this wave are spawned and defeated
      if (enemiesSpawnedRef.current >= enemiesPerWave && game.enemies.length === 0 && game.wave < 10) {
        waveTimerRef.current += deltaTime;
        if (waveTimerRef.current > 3000) { // 3 second break between waves
          nextWave();
          waveTimerRef.current = 0;
          enemiesSpawnedRef.current = 0;
        }
      }
    }

    // Stop game loop if game ended
    if (game.gameOver || game.victory) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [game.isPlaying, game.isPaused, game.gameOver, game.victory, game.wave, game.enemies.length, updateGame, spawnEnemy, nextWave]);

  useEffect(() => {
    if (game.isPlaying) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [game.isPlaying, gameLoop]);

  const handleLaneClick = (lane: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (!game.selectedDefender) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < 50 || x > GAME_WIDTH - 100) return; // Keep defenders in valid area
    placeDefender(lane, x);
  };

  const handleStartGame = () => {
    lastTimeRef.current = 0;
    waveTimerRef.current = 0;
    enemySpawnRef.current = 0;
    startGame();
  };

  const defenderTypes: DefenderType[] = ['sunflower', 'shooter', 'wall', 'freeze', 'bomb'];

  if (!game.isPlaying) {
    return (
      <div style={styles.startScreen}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={styles.startContent}
        >
          <h2 style={styles.gameTitle}>🌿 Eco Defender</h2>
          <p style={styles.gameSubtitle}>Protect the forest from pollution!</p>
          <div style={styles.instructions}>
            <p>🌻 Sunflowers generate sun energy</p>
            <p>🌵 Cacti shoot at enemies</p>
            <p>🪨 Rocks block enemy paths</p>
            <p>❄️ Ice slows enemies down</p>
            <p>💥 Bombs deal massive damage</p>
          </div>
          <motion.button
            style={styles.startButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
          >
            🎮 Start Game
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (game.gameOver || game.victory) {
    return (
      <div style={styles.endScreen}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={styles.endContent}
        >
          <h2 style={game.victory ? styles.victoryTitle : styles.defeatTitle}>
            {game.victory ? '🏆 Victory!' : '💀 Game Over'}
          </h2>
          <div style={styles.scoreDisplay}>
            <span style={styles.scoreLabel}>Final Score</span>
            <span style={styles.scoreValue}>{game.score}</span>
          </div>
          <p style={styles.rewardText}>
            +{game.score} coins earned! 💰
          </p>
          <p style={styles.rewardSubtext}>
            Coins have been added to your account
          </p>
          <p style={styles.currentCoins}>
            Total Balance: {user.coins} coins
          </p>
          <div style={styles.endButtons}>
            <motion.button
              style={styles.restartButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartGame}
            >
              🔄 Play Again
            </motion.button>
            <motion.button
              style={styles.endButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={endGame}
            >
              🌿 Return to Garden
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HUD */}
      <div style={styles.hud}>
        <div style={styles.hudLeft}>
          <span style={styles.hudItem}>☀️ {game.sun}</span>
          <span style={styles.hudItem}>🌊 Wave {game.wave}/10</span>
          <span style={styles.hudItem}>⭐ {game.score}</span>
        </div>
        <div style={styles.healthBar}>
          <div style={styles.healthLabel}>🏠 Base Health: {game.health}/{game.maxHealth}</div>
          <div style={styles.healthTrack}>
            <motion.div
              style={{
                ...styles.healthFill,
                background: game.health > 50 ? '#4CAF50' : game.health > 25 ? '#FFC107' : '#F44336',
              }}
              animate={{ 
                width: `${(game.health / game.maxHealth) * 100}%`,
                scale: game.health < 30 ? [1, 1.05, 1] : 1,
              }}
              transition={{ 
                width: { duration: 0.3 },
                scale: { duration: 0.5, repeat: game.health < 30 ? Infinity : 0 }
              }}
            />
          </div>
        </div>
        <motion.button
          style={styles.pauseButton}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={game.isPaused ? resumeGame : pauseGame}
        >
          {game.isPaused ? '▶️' : '⏸️'}
        </motion.button>
      </div>

      {/* Defender Selection */}
      <div style={styles.defenderBar}>
        {defenderTypes.map((type) => {
          const config = DEFENDER_CONFIG[type];
          const canAfford = game.sun >= config.cost;
          const isSelected = game.selectedDefender === type;
          
          return (
            <motion.button
              key={type}
              style={{
                ...styles.defenderButton,
                opacity: canAfford ? 1 : 0.5,
                border: isSelected ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.3)',
                background: isSelected ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0,0,0,0.4)',
              }}
              whileHover={canAfford ? { scale: 1.1 } : {}}
              whileTap={canAfford ? { scale: 0.95 } : {}}
              onClick={() => canAfford && selectDefender(isSelected ? null : type)}
              disabled={!canAfford}
            >
              <span style={styles.defenderEmoji}>{config.emoji}</span>
              <span style={styles.defenderCost}>☀️{config.cost}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Game Field */}
      <div style={{
        ...styles.gameField,
        boxShadow: damageFlash ? 'inset 0 0 50px rgba(255, 0, 0, 0.8)' : 'none',
        transition: 'box-shadow 0.2s ease',
      }}>
        {/* Lanes */}
        {Array.from({ length: LANES }, (_, lane) => (
          <div
            key={lane}
            style={{
              ...styles.lane,
              background: lane % 2 === 0 
                ? 'linear-gradient(90deg, #4a7c3f 0%, #5d9a4e 50%, #4a7c3f 100%)'
                : 'linear-gradient(90deg, #3d6b34 0%, #4f8a42 50%, #3d6b34 100%)',
            }}
            onClick={(e) => handleLaneClick(lane, e)}
          >
            {/* Defenders in this lane */}
            {game.defenders
              .filter(d => d.lane === lane)
              .map(defender => (
                <motion.div
                  key={defender.id}
                  style={{
                    ...styles.defender,
                    left: defender.x,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <span style={styles.defenderSprite}>
                    {DEFENDER_CONFIG[defender.type].emoji}
                  </span>
                </motion.div>
              ))}

            {/* Enemies in this lane */}
            {game.enemies
              .filter(e => e.lane === lane)
              .map(enemy => (
                <motion.div
                  key={enemy.id}
                  style={{
                    ...styles.enemy,
                    left: enemy.x,
                  }}
                  animate={{ x: 0 }}
                >
                  <div style={styles.enemyHealthBar}>
                    <div 
                      style={{
                        ...styles.enemyHealthFill,
                        width: `${(enemy.health / enemy.maxHealth) * 100}%`,
                      }}
                    />
                  </div>
                  <span style={styles.enemySprite}>
                    {ENEMY_CONFIG[enemy.type].emoji}
                  </span>
                </motion.div>
              ))}

            {/* Projectiles in this lane */}
            {game.projectiles
              .filter(p => p.lane === lane)
              .map(projectile => (
                <motion.div
                  key={projectile.id}
                  style={{
                    ...styles.projectile,
                    left: projectile.x,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <span style={styles.projectileEmoji}>
                    {projectile.type === 'ice' ? '❄️' : '🌰'}
                  </span>
                </motion.div>
              ))}
          </div>
        ))}

        {/* Base indicator */}
        <div style={styles.base}>
          <span style={styles.baseEmoji}>🏠</span>
        </div>
      </div>

      {/* Wave Notification */}
      <AnimatePresence>
        {waveNotification && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={styles.waveNotification}
          >
            <h2 style={styles.waveText}>🌊 Wave {waveNotification}</h2>
            <p style={styles.waveSubtext}>Get ready!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Overlay */}
      <AnimatePresence>
        {game.isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.pauseOverlay}
          >
            <h2 style={styles.pauseText}>⏸️ PAUSED</h2>
            <motion.button
              style={styles.resumeButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resumeGame}
            >
              Resume Game
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: '850px',
    margin: '0 auto',
  },
  startScreen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '500px',
    background: 'linear-gradient(135deg, #1a472a 0%, #2d5a27 50%, #1a472a 100%)',
    borderRadius: '20px',
    padding: '40px',
  },
  startContent: {
    textAlign: 'center',
    color: '#fff',
  },
  gameTitle: {
    fontSize: '48px',
    marginBottom: '10px',
    textShadow: '0 4px 20px rgba(0,0,0,0.5)',
  },
  gameSubtitle: {
    fontSize: '18px',
    opacity: 0.8,
    marginBottom: '30px',
  },
  instructions: {
    background: 'rgba(0,0,0,0.3)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '30px',
    textAlign: 'left',
    lineHeight: '1.8',
  },
  startButton: {
    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
    border: 'none',
    padding: '15px 40px',
    fontSize: '20px',
    borderRadius: '30px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 20px rgba(76, 175, 80, 0.5)',
  },
  endScreen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '500px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '20px',
    padding: '40px',
  },
  endContent: {
    textAlign: 'center',
    color: '#fff',
  },
  victoryTitle: {
    fontSize: '48px',
    color: '#FFD700',
    marginBottom: '20px',
  },
  defeatTitle: {
    fontSize: '48px',
    color: '#F44336',
    marginBottom: '20px',
  },
  scoreDisplay: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  scoreLabel: {
    fontSize: '16px',
    opacity: 0.7,
  },
  scoreValue: {
    fontSize: '64px',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  rewardText: {
    fontSize: '18px',
    color: '#8BC34A',
    marginBottom: '10px',
  },
  rewardSubtext: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '10px',
  },
  currentCoins: {
    fontSize: '16px',
    color: '#FFD700',
    marginBottom: '30px',
    fontWeight: 'bold',
  },
  endButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  restartButton: {
    background: 'linear-gradient(135deg, #2196F3, #03A9F4)',
    border: 'none',
    padding: '15px 40px',
    fontSize: '18px',
    borderRadius: '30px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  endButton: {
    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
    border: 'none',
    padding: '15px 40px',
    fontSize: '18px',
    borderRadius: '30px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  hud: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    background: 'rgba(0,0,0,0.6)',
    borderRadius: '12px 12px 0 0',
  },
  hudLeft: {
    display: 'flex',
    gap: '20px',
  },
  hudItem: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  healthBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  healthLabel: {
    color: '#fff',
    fontSize: '14px',
  },
  healthTrack: {
    width: '150px',
    height: '20px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.3s ease',
  },
  pauseButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '20px',
    cursor: 'pointer',
  },
  defenderBar: {
    display: 'flex',
    gap: '10px',
    padding: '15px',
    background: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  defenderButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 15px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  defenderEmoji: {
    fontSize: '32px',
  },
  defenderCost: {
    color: '#FFD700',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  gameField: {
    position: 'relative',
    height: `${GAME_HEIGHT}px`,
    background: '#2d5a27',
    borderRadius: '0 0 12px 12px',
    overflow: 'hidden',
  },
  lane: {
    height: `${GAME_HEIGHT / LANES}px`,
    position: 'relative',
    borderBottom: '2px solid rgba(0,0,0,0.2)',
    cursor: 'crosshair',
  },
  defender: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
  },
  defenderSprite: {
    fontSize: '40px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
  },
  enemy: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 5,
  },
  enemyHealthBar: {
    width: '40px',
    height: '4px',
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '2px',
    marginBottom: '2px',
    marginLeft: '5px',
  },
  enemyHealthFill: {
    height: '100%',
    background: '#F44336',
    borderRadius: '2px',
    transition: 'width 0.2s ease',
  },
  enemySprite: {
    fontSize: '36px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
  },
  projectile: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 8,
  },
  projectileEmoji: {
    fontSize: '20px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
  },
  base: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 20,
  },
  baseEmoji: {
    fontSize: '50px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderRadius: '0 0 12px 12px',
  },
  pauseText: {
    color: '#fff',
    fontSize: '48px',
    marginBottom: '30px',
  },
  resumeButton: {
    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
    border: 'none',
    padding: '15px 40px',
    fontSize: '18px',
    borderRadius: '30px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  waveNotification: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 150,
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.95), rgba(3, 169, 244, 0.95))',
    padding: '30px 60px',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    border: '3px solid rgba(255,255,255,0.3)',
  },
  waveText: {
    color: '#fff',
    fontSize: '48px',
    margin: 0,
    textShadow: '0 4px 10px rgba(0,0,0,0.5)',
  },
  waveSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '18px',
    margin: '10px 0 0 0',
  },
};

export default MiniGame;
