// Tree Types & Levels
export interface Tree {
  id: string;
  gridPosition: number; // 0-8 for 3x3 grid
  level: number; // 1-6
  points: number;
  type: TreeType;
  plantedAt: Date;
  isSpecial?: boolean;
}

export type TreeType = 'oak' | 'cherry' | 'pine' | 'maple' | 'willow' | 'redwood';

export const TREE_LEVEL_THRESHOLDS = {
  1: 300,
  2: 400,
  3: 450,
  4: 500,
  5: 600,
  6: 800,
} as const;

export const TREE_VISUALS: Record<number, { emoji: string; name: string; size: number }> = {
  1: { emoji: '🌱', name: 'Seedling', size: 24 },
  2: { emoji: '🌿', name: 'Sprout', size: 32 },
  3: { emoji: '🪴', name: 'Sapling', size: 40 },
  4: { emoji: '🌳', name: 'Young Tree', size: 52 },
  5: { emoji: '🌲', name: 'Mature Tree', size: 64 },
  6: { emoji: '🎄', name: 'Ancient Tree', size: 80 },
};

// Game Types
export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  lane: number;
  health: number;
  maxHealth: number;
  speed: number;
}

export type EnemyType = 'smoke' | 'trash' | 'oil' | 'fire' | 'boss';

export const ENEMY_CONFIG: Record<EnemyType, { emoji: string; health: number; speed: number; points: number }> = {
  smoke: { emoji: '🧟', health: 20, speed: 1.2, points: 5 },
  trash: { emoji: '🧟‍♂️', health: 30, speed: 0.8, points: 8 },
  oil: { emoji: '🧟‍♀️', health: 50, speed: 0.6, points: 12 },
  fire: { emoji: '�', health: 40, speed: 1.5, points: 10 },
  boss: { emoji: '👾', health: 150, speed: 0.4, points: 50 },
};

export interface Defender {
  id: string;
  type: DefenderType;
  x: number;
  y: number;
  lane: number;
  cooldown: number;
}

export type DefenderType = 'sunflower' | 'shooter' | 'wall' | 'freeze' | 'bomb';

export const DEFENDER_CONFIG: Record<DefenderType, { emoji: string; cost: number; damage: number; cooldown: number; range: number }> = {
  sunflower: { emoji: '🌻', cost: 50, damage: 0, cooldown: 5000, range: 0 },
  shooter: { emoji: '🌵', cost: 100, damage: 10, cooldown: 1500, range: 300 },
  wall: { emoji: '🪨', cost: 75, damage: 0, cooldown: 0, range: 0 },
  freeze: { emoji: '❄️', cost: 150, damage: 5, cooldown: 2000, range: 200 },
  bomb: { emoji: '💥', cost: 200, damage: 100, cooldown: 0, range: 100 },
};

export interface Projectile {
  id: string;
  x: number;
  y: number;
  lane: number;
  damage: number;
  speed: number;
  type: 'leaf' | 'ice';
}

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  earnedAt?: Date;
}

export const BADGES: Badge[] = [
  { id: 'first_tree', name: 'First Seed', description: 'Plant your first tree', emoji: '🌱', earned: false },
  { id: 'eco_defender', name: 'Eco Defender', description: 'Score 500 in one game', emoji: '🛡️', earned: false },
  { id: 'forest_guardian', name: 'Forest Guardian', description: 'Beat level 5', emoji: '🏆', earned: false },
  { id: 'zen_streak', name: 'Zen Streak', description: 'Play 7 days in a row', emoji: '🔥', earned: false },
  { id: 'max_tree', name: 'Ancient Wisdom', description: 'Grow a tree to level 6', emoji: '🌲', earned: false },
  { id: 'full_garden', name: 'Garden Master', description: 'Fill your entire garden', emoji: '🏡', earned: false },
  { id: 'perfect_run', name: 'Perfect Defense', description: 'Complete a round without damage', emoji: '⭐', earned: false },
  { id: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat a pollution boss', emoji: '👑', earned: false },
];

// Game State
export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  wave: number;
  score: number;
  sun: number;
  health: number;
  maxHealth: number;
  enemies: Enemy[];
  defenders: Defender[];
  projectiles: Projectile[];
  selectedDefender: DefenderType | null;
  gameOver: boolean;
  victory: boolean;
}

// Certificate Types
export interface Certificate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: 'achievement' | 'completion' | 'mastery';
  earnedAt: Date;
  certificateNumber: string;
  s3Url?: string; // URL to certificate stored in S3
}

// User State
export interface UserState {
  totalPoints: number; // Lifetime points earned (never decreases)
  coins: number; // Spendable currency for buying trees and items
  trees: Tree[];
  badges: Badge[];
  certificates: Certificate[];
  gamesPlayed: number;
  highScore: number;
  streak: number;
  lastPlayedDate: string | null;
}
