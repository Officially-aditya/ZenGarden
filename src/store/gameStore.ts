import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Tree, TreeType, UserState, BADGES, Certificate,
  GameState, Enemy, Defender, Projectile, 
  DefenderType, EnemyType, ENEMY_CONFIG, DEFENDER_CONFIG,
  TREE_LEVEL_THRESHOLDS
} from '../types';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Get random tree type
const getRandomTreeType = (): TreeType => {
  const types: TreeType[] = ['oak', 'cherry', 'pine', 'maple', 'willow', 'redwood'];
  return types[Math.floor(Math.random() * types.length)];
};

interface Store {
  // User State
  user: UserState;
  
  // Game State
  game: GameState;
  
  // User Actions
  addPoints: (points: number) => void;
  plantTree: (gridPosition: number) => void;
  upgradeTree: (treeId: string) => void;
  earnBadge: (badgeId: string) => void;
  issueCertificate: (certType: string) => void;
  checkGardenCompletion: () => void;
  
  // Game Actions
  startGame: () => void;
  endGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  selectDefender: (type: DefenderType | null) => void;
  placeDefender: (lane: number, x: number) => void;
  spawnEnemy: (type: EnemyType, lane: number) => void;
  updateGame: (deltaTime: number) => void;
  shootProjectile: (defender: Defender) => void;
  takeDamage: (amount: number) => void;
  collectSun: (amount: number) => void;
  nextWave: () => void;
}

const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  wave: 1,
  score: 0,
  sun: 150,
  health: 100,
  maxHealth: 100,
  enemies: [],
  defenders: [],
  projectiles: [],
  selectedDefender: null,
  gameOver: false,
  victory: false,
};

const initialUserState: UserState = {
  totalPoints: 0,
  coins: 0,
  trees: [],
  badges: BADGES,
  certificates: [],
  gamesPlayed: 0,
  highScore: 0,
  streak: 0,
  lastPlayedDate: null,
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      user: initialUserState,
      game: initialGameState,

      // User Actions
      addPoints: (points) => set((state) => {
        const newTotal = state.user.totalPoints + points;
        const newCoins = state.user.coins + points;
        console.log(`💰 Adding ${points} points. Total Points: ${newTotal}, Coins: ${newCoins}`);
        
        return {
          user: {
            ...state.user,
            totalPoints: newTotal,
            coins: newCoins,
          }
        };
      }),

      plantTree: (gridPosition) => set((state) => {
        if (state.user.trees.some(t => t.gridPosition === gridPosition)) return state;
        if (state.user.coins < 300) return state;
        
        const newTree: Tree = {
          id: generateId(),
          gridPosition,
          level: 1,
          points: 300,
          type: getRandomTreeType(),
          plantedAt: new Date(),
        };
        
        console.log(`🌱 Planting tree. Coins before: ${state.user.coins}, after: ${state.user.coins - 300}`);
        
        const newState = {
          user: {
            ...state.user,
            coins: state.user.coins - 300,
            trees: [...state.user.trees, newTree],
          }
        };

        // Check for garden completion after planting
        setTimeout(() => {
          useStore.getState().checkGardenCompletion();
        }, 100);

        return newState;
      }),

      upgradeTree: (treeId) => set((state) => {
        const tree = state.user.trees.find(t => t.id === treeId);
        if (!tree || tree.level >= 6) return state;
        
        // Calculate cost for next level
        const nextLevelThreshold = TREE_LEVEL_THRESHOLDS[(tree.level + 1) as keyof typeof TREE_LEVEL_THRESHOLDS];
        const upgradeCost = nextLevelThreshold - tree.points;
        
        if (state.user.coins < upgradeCost) {
          console.log(`❌ Not enough coins. Need ${upgradeCost}, have ${state.user.coins}`);
          return state;
        }
        
        console.log(`⬆️ Upgrading tree from level ${tree.level} to ${tree.level + 1}. Cost: ${upgradeCost} coins`);
        
        const trees = state.user.trees.map(t => {
          if (t.id === treeId) {
            return { 
              ...t, 
              points: nextLevelThreshold, 
              level: tree.level + 1 
            };
          }
          return t;
        });
        
        const newState = { 
          user: { 
            ...state.user, 
            trees,
            coins: state.user.coins - upgradeCost
          } 
        };

        // Check for garden completion after upgrade
        setTimeout(() => {
          useStore.getState().checkGardenCompletion();
        }, 100);

        return newState;
      }),

      earnBadge: (badgeId) => set((state) => ({
        user: {
          ...state.user,
          badges: state.user.badges.map(b => 
            b.id === badgeId ? { ...b, earned: true, earnedAt: new Date() } : b
          ),
        }
      })),

      issueCertificate: (certType) => set((state) => {
        // Check if certificate already exists
        if (state.user.certificates.some(cert => cert.id === certType)) {
          console.log(`Certificate ${certType} already issued`);
          return state;
        }

        const certData: Record<string, any> = {
          'master_gardener': {
            name: 'Master Gardener Certificate',
            description: 'Successfully completed a full Zen Garden with all trees at maximum level',
            emoji: '🏆',
            type: 'mastery',
          },
          'first_garden': {
            name: 'Garden Completion Certificate',
            description: 'Planted your first complete garden with all 9 trees',
            emoji: '🌸',
            type: 'completion',
          },
          'eco_warrior': {
            name: 'Eco Warrior Certificate',
            description: 'Reached 10,000 total points in environmental impact',
            emoji: '⚔️',
            type: 'achievement',
          },
        };

        const cert = certData[certType];
        if (!cert) return state;

        const newCertificate: Certificate = {
          id: certType,
          ...cert,
          earnedAt: new Date(),
          certificateNumber: `ZEN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          // In production, this would be the S3 URL after upload
          s3Url: undefined,
        };

        console.log(`📜 Certificate Issued: ${newCertificate.name} (${newCertificate.certificateNumber})`);

        return {
          user: {
            ...state.user,
            certificates: [...state.user.certificates, newCertificate],
          }
        };
      }),

      checkGardenCompletion: () => {
        const state = useStore.getState();
        const { trees, certificates } = state.user;

        // Check if all 9 slots are filled with level 6 trees
        const allMaxLevel = trees.length === 9 && trees.every(t => t.level === 6);

        if (allMaxLevel && !certificates.some(cert => cert.id === 'master_gardener')) {
          console.log('🎉 Garden Complete! Issuing Master Gardener Certificate...');
          state.issueCertificate('master_gardener');
          state.earnBadge('full_garden');
        }

        // Check for first complete garden (all 9 slots filled)
        if (trees.length === 9 && !certificates.some(cert => cert.id === 'first_garden')) {
          console.log('🎉 First Complete Garden! Issuing Certificate...');
          state.issueCertificate('first_garden');
        }
      },

      // Game Actions
      startGame: () => set((state) => ({
        game: { ...initialGameState, isPlaying: true },
        user: { ...state.user, gamesPlayed: state.user.gamesPlayed + 1 }
      })),

      endGame: () => {
        // This function now just resets the game state
        // Coins are already awarded in updateGame when game ends
        console.log(`🌿 Returning to garden...`);
        set((state) => ({
          game: { ...state.game, isPlaying: false }
        }));
      },

      pauseGame: () => set((state) => ({ game: { ...state.game, isPaused: true } })),
      resumeGame: () => set((state) => ({ game: { ...state.game, isPaused: false } })),

      selectDefender: (type) => set((state) => ({ 
        game: { ...state.game, selectedDefender: type } 
      })),

      placeDefender: (lane, x) => set((state) => {
        const { selectedDefender, sun, defenders } = state.game;
        if (!selectedDefender) return state;
        
        const config = DEFENDER_CONFIG[selectedDefender];
        if (sun < config.cost) return state;
        
        // Check if position is occupied
        if (defenders.some(d => d.lane === lane && Math.abs(d.x - x) < 60)) return state;
        
        const newDefender: Defender = {
          id: generateId(),
          type: selectedDefender,
          x,
          y: 80 + lane * 100,
          lane,
          cooldown: 0,
        };
        
        return {
          game: {
            ...state.game,
            sun: sun - config.cost,
            defenders: [...defenders, newDefender],
            selectedDefender: null,
          }
        };
      }),

      spawnEnemy: (type, lane) => set((state) => {
        const config = ENEMY_CONFIG[type];
        const newEnemy: Enemy = {
          id: generateId(),
          type,
          x: 800,
          y: 80 + lane * 100,
          lane,
          health: config.health,
          maxHealth: config.health,
          speed: config.speed,
        };
        return { game: { ...state.game, enemies: [...state.game.enemies, newEnemy] } };
      }),

      shootProjectile: (defender) => set((state) => {
        const config = DEFENDER_CONFIG[defender.type];
        if (config.damage === 0) return state;
        
        const projectile: Projectile = {
          id: generateId(),
          x: defender.x + 30,
          y: defender.y,
          lane: defender.lane,
          damage: config.damage,
          speed: 5,
          type: defender.type === 'freeze' ? 'ice' : 'leaf',
        };
        
        return { game: { ...state.game, projectiles: [...state.game.projectiles, projectile] } };
      }),

      takeDamage: (amount) => set((state) => {
        const newHealth = Math.max(0, state.game.health - amount);
        const newScore = Math.max(0, state.game.score - 10);
        const isGameOver = newHealth <= 0;
        
        return { 
          game: { 
            ...state.game, 
            health: newHealth,
            gameOver: isGameOver,
            score: newScore,
            isPlaying: !isGameOver,
          } 
        };
      }),

      collectSun: (amount) => set((state) => ({
        game: { ...state.game, sun: state.game.sun + amount }
      })),

      nextWave: () => set((state) => ({
        game: { 
          ...state.game, 
          wave: state.game.wave + 1,
          score: state.game.score + 50,
        }
      })),

      updateGame: (deltaTime) => set((state) => {
        if (!state.game.isPlaying || state.game.isPaused || state.game.gameOver) return state;
        
        let { enemies, projectiles, defenders, score, health, sun } = state.game;
        
        // Move enemies
        enemies = enemies.map(e => ({
          ...e,
          x: e.x - e.speed * deltaTime * 0.05,
        }));
        
        // Check if enemies reached the left side and deal damage
        const reachedEnemies = enemies.filter(e => e.x <= 50);
        if (reachedEnemies.length > 0) {
          health = Math.max(0, health - (reachedEnemies.length * 10));
          score = Math.max(0, score - (reachedEnemies.length * 10));
          enemies = enemies.filter(e => e.x > 50);
          console.log(`💥 Base took damage! Health: ${health}, Enemies reached: ${reachedEnemies.length}`);
        }
        
        // Move projectiles
        projectiles = projectiles.map(p => ({
          ...p,
          x: p.x + p.speed * deltaTime * 0.1,
        })).filter(p => p.x < 850);
        
        // Check projectile collisions
        const projectilesToRemove = new Set<string>();
        projectiles.forEach(p => {
          const hitEnemy = enemies.find(e => 
            e.lane === p.lane && 
            Math.abs(e.x - p.x) < 30 &&
            e.x > p.x
          );
          if (hitEnemy) {
            hitEnemy.health -= p.damage;
            projectilesToRemove.add(p.id);
          }
        });
        
        // Remove dead enemies and add score
        const deadEnemies = enemies.filter(e => e.health <= 0);
        deadEnemies.forEach(e => {
          score += ENEMY_CONFIG[e.type].points;
        });
        enemies = enemies.filter(e => e.health > 0);
        projectiles = projectiles.filter(p => p.x < 850 && !projectilesToRemove.has(p.id));
        
        // Update defender cooldowns and shoot
        defenders = defenders.map(d => {
          const config = DEFENDER_CONFIG[d.type];
          let newCooldown = Math.max(0, d.cooldown - deltaTime);
          
          // Sunflower generates sun
          if (d.type === 'sunflower' && newCooldown === 0) {
            sun += 25;
            newCooldown = config.cooldown;
          }
          
          // Shooters fire at enemies
          if ((d.type === 'shooter' || d.type === 'freeze') && newCooldown === 0) {
            const enemyInLane = enemies.some(e => e.lane === d.lane && e.x > d.x);
            if (enemyInLane) {
              // Create projectile directly here
              const projectile: Projectile = {
                id: generateId(),
                x: d.x + 30,
                y: d.y,
                lane: d.lane,
                damage: config.damage,
                speed: 5,
                type: d.type === 'freeze' ? 'ice' : 'leaf',
              };
              projectiles.push(projectile);
              newCooldown = config.cooldown;
            }
          }
          
          return { ...d, cooldown: newCooldown };
        });
        
        // Check victory (wave 10 completed with no enemies)
        const victory = state.game.wave >= 10 && enemies.length === 0;
        const isGameOver = health <= 0;
        
        // Award coins immediately when game ends
        if ((isGameOver || victory) && state.game.isPlaying) {
          console.log(`🎮 Game Ended! Awarding ${score} coins`);
          console.log(`💰 Coins before: ${state.user.coins}`);
          
          const newTotalPoints = state.user.totalPoints + score;
          const newCoins = state.user.coins + score;
          const newHighScore = Math.max(state.user.highScore, score);
          
          console.log(`💰 Coins after: ${newCoins}`);
          
          // Check for badges
          const updatedBadges = state.user.badges.map(b => {
            if (b.id === 'eco_defender' && score >= 500 && !b.earned) {
              return { ...b, earned: true, earnedAt: new Date() };
            }
            if (b.id === 'forest_guardian' && state.game.wave >= 5 && !b.earned) {
              return { ...b, earned: true, earnedAt: new Date() };
            }
            return b;
          });
          
          return {
            game: {
              ...state.game,
              enemies,
              projectiles,
              defenders,
              score,
              health,
              sun,
              victory,
              gameOver: isGameOver,
              isPlaying: false,
            },
            user: {
              ...state.user,
              totalPoints: newTotalPoints,
              coins: newCoins,
              highScore: newHighScore,
              badges: updatedBadges,
            }
          };
        }
        
        return {
          game: {
            ...state.game,
            enemies,
            projectiles,
            defenders,
            score,
            health,
            sun,
            victory,
            gameOver: isGameOver,
            isPlaying: !isGameOver && !victory,
          }
        };
      }),
    }),
    {
      name: 'zen-garden-storage',
      version: 1,
      partialize: (state) => ({ user: state.user }),
      migrate: (persistedState: any, version: number) => {
        // Migrate old data to new structure with coins
        if (version === 0 && persistedState?.user) {
          return {
            user: {
              ...persistedState.user,
              coins: persistedState.user.coins ?? persistedState.user.totalPoints ?? 0,
            }
          };
        }
        return persistedState;
      },
    }
  )
);
