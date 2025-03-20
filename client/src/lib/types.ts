// Frontend types to handle API responses and UI state

// User types
export interface User {
  id: number;
  username: string;
  role: 'parent' | 'child' | 'admin';
  email: string;
  name: string;
}

// Child profile types
export interface ChildProfile {
  id: number;
  parentId: number;
  name: string;
  age: number;
  level: number;
  xp: number;
  coins: number;
  stats: Stats;
  equipmentSlots: EquipmentSlots;
  preferences: Preferences;
  avatarColor: 'primary' | 'accent' | 'secondary' | 'purple-500';
}

export interface Stats {
  magicPower: number;
  wisdom: number;
  agility: number;
}

export interface EquipmentSlots {
  wand?: number;
  amulet?: number;
  boots?: number;
}

export interface Preferences {
  subjects: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readingLevel: number;
  mathLevel: number;
  skipKnownLessons: boolean;
}

// Items
export interface Item {
  id: number;
  name: string;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  price: number;
  statBoosts: Stats;
  imageUrl?: string;
  requirements?: ItemRequirements;
}

export interface ItemRequirements {
  level?: number;
  stats?: Stats;
  achievements?: string[];
}

export interface InventoryItem {
  id: number;
  childId: number;
  itemId: number;
  equipped: boolean;
  acquiredAt: string;
  details?: Item;
}

// Map and Adventure
export interface MapZone {
  id: number;
  name: string;
  description: string;
  config: MapConfig;
  unlockRequirements?: ZoneRequirements;
}

export interface MapConfig {
  background: string;
  nodes: MapNode[];
  paths: MapPath[];
  decorations: MapDecoration[];
}

export interface MapNode {
  id: string;
  x: number;
  y: number;
  status: 'locked' | 'available' | 'current' | 'completed';
  type: 'mini-task' | 'mini-game' | 'lesson' | 'boss';
}

export interface MapPath {
  from: string;
  to: string;
}

export interface MapDecoration {
  type: string;
  x: number;
  y: number;
  size?: number;
  width?: number;
  height?: number;
}

export interface ZoneRequirements {
  level?: number;
  completedZones?: number[];
  items?: number[];
}

// Learning content
export interface MiniGame {
  id: number;
  name: string;
  description: string;
  type: 'multiple_choice' | 'puzzle' | 'battle';
  difficulty: number;
  xpReward: number;
  coinReward: number;
  questionIds?: number[];
  questions?: Question[];
}

export interface Question {
  id: number;
  text: string;
  choices: Choice[];
  correctAnswerId: string;
  hint?: string;
  difficulty: number;
  tags: string[];
}

export interface Choice {
  id: string;
  text: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  contentType: 'reading' | 'video' | 'audio' | 'interactive';
  content: string;
  difficulty: number;
  xpReward: number;
  coinReward: number;
  prerequisites?: number[];
  tags: string[];
}

// Analytics
export interface AnswerHistory {
  id: number;
  childId: number;
  questionId: number;
  selectedChoiceId: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface LessonCompletion {
  id: number;
  childId: number;
  lessonId: number;
  score: number;
  timestamp: string;
}

// Session types
export interface ActiveChildSession {
  childId: number;
  childName: string;
  parentId: number;
}
