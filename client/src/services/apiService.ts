// API Service Layer for modular API operations
import { apiRequest } from "@/lib/queryClient";
import {
  User,
  ChildProfile,
  Item,
  InventoryItem,
  Lesson,
  Question,
  MapZone,
  MasterMap,
  MiniGame,
  LessonCompletion,
  AnswerHistory
} from "@/lib/types";

// User services
export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const res = await apiRequest("GET", "/api/user");
    return await res.json();
  },
  
  login: async (username: string, password: string): Promise<User> => {
    const res = await apiRequest("POST", "/api/login", { username, password });
    return await res.json();
  },
  
  register: async (userData: {
    username: string;
    password: string;
    email: string;
    name: string;
    role: string;
  }): Promise<User> => {
    const res = await apiRequest("POST", "/api/register", userData);
    return await res.json();
  }
};

// Child profile services
export const childProfileService = {
  getChildProfiles: async (parentId: number): Promise<ChildProfile[]> => {
    const res = await apiRequest("GET", `/api/parents/${parentId}/children`);
    return await res.json();
  },
  
  getChildProfile: async (id: number): Promise<ChildProfile> => {
    const res = await apiRequest("GET", `/api/child-profiles/${id}`);
    return await res.json();
  },
  
  createChildProfile: async (profile: Partial<ChildProfile>): Promise<ChildProfile> => {
    const res = await apiRequest("POST", "/api/child-profiles", profile);
    return await res.json();
  },
  
  updateChildProfile: async (id: number, data: Partial<ChildProfile>): Promise<ChildProfile> => {
    const res = await apiRequest("PUT", `/api/child-profiles/${id}`, data);
    return await res.json();
  }
};

// Inventory and item services
export const inventoryService = {
  getInventory: async (childId: number): Promise<(InventoryItem & { details?: Item })[]> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/inventory`);
    return await res.json();
  },
  
  getAllItems: async (): Promise<Item[]> => {
    const res = await apiRequest("GET", "/api/items");
    return await res.json();
  },
  
  purchaseItem: async (childId: number, itemId: number): Promise<{ 
    inventoryItem: InventoryItem;
    item: Item;
    remainingCoins: number;
  }> => {
    const res = await apiRequest("POST", `/api/child-profiles/${childId}/purchase-item`, { itemId });
    return await res.json();
  },
  
  equipItem: async (inventoryItemId: number): Promise<InventoryItem> => {
    const res = await apiRequest("PUT", `/api/inventory/${inventoryItemId}/equip`);
    return await res.json();
  },
  
  unequipItem: async (inventoryItemId: number): Promise<InventoryItem> => {
    const res = await apiRequest("PUT", `/api/inventory/${inventoryItemId}/unequip`);
    return await res.json();
  }
};

// Map services
export const mapService = {
  getMapZones: async (): Promise<MapZone[]> => {
    const res = await apiRequest("GET", "/api/map-zones");
    return await res.json();
  },
  
  getAllMapZones: async (): Promise<MapZone[]> => {
    // Alias for backward compatibility
    return mapService.getMapZones();
  },
  
  getMapZone: async (id: number): Promise<MapZone> => {
    const res = await apiRequest("GET", `/api/map-zones/${id}`);
    return await res.json();
  },
  
  updateNodeStatus: async (
    zoneId: number, 
    nodeId: string, 
    childId: number,
    status: 'locked' | 'available' | 'current' | 'completed'
  ): Promise<MapZone> => {
    const res = await apiRequest("PATCH", `/api/map-zones/${zoneId}/nodes/${nodeId}/status`, { status, childId });
    return await res.json();
  },
  
  /**
   * Check if a map is completed and calculate detailed rewards
   * This is called when all nodes in a map are completed to show reward modal
   */
  checkMapCompletion: async (childId: number, zoneId: number): Promise<{
    isCompleted: boolean;
    rewards?: {
      xp: number;
      coins: number;
      levelUp: boolean;
      newLevel?: number;
      specialItem?: any;
      timeBonus?: number;
      unlockNextZone?: boolean;
    };
    nextZone?: MapZone;
    updatedChildProfile?: ChildProfile;
    masterMapId?: number; // ID of the master map to return to
  }> => {
    const res = await apiRequest("POST", `/api/map-zones/${zoneId}/check-completion`, { childId });
    return await res.json();
  },
  
  /**
   * Return to master map after completing a zone
   * This is used when a player completes a zone that is part of a master map
   */
  returnToMasterMap: async (childId: number, zoneId: number): Promise<{
    masterMap?: MasterMap;
    nodeCompleted?: boolean;
  }> => {
    const res = await apiRequest("POST", `/api/map-zones/${zoneId}/return-to-master-map`, { childId });
    return await res.json();
  },
  
  completeQuest: async (
    zoneId: number,
    nodeId: string,
    childId: number,
    questType: 'lesson' | 'mini-game' | 'mini-task' | 'boss',
    questId: number
  ): Promise<{
    zone: MapZone;
    childProfile?: ChildProfile;
    rewards?: {
      xp: number;
      coins: number;
      levelUp: boolean;
    };
  }> => {
    const res = await apiRequest("POST", `/api/game-progress/complete-quest`, {
      zoneId,
      nodeId,
      childId,
      questType,
      questId
    });
    return await res.json();
  },
  
  /**
   * Complete a map zone and unlock the next available map
   * This is called when all nodes in a map are completed
   */
  completeMapZone: async (
    childId: number,
    currentZoneId: number
  ): Promise<{
    isCompleted: boolean;
    nextZone?: MapZone;
    rewards?: {
      xp: number;
      coins: number;
      levelUp: boolean;
    };
  }> => {
    const res = await apiRequest("POST", `/api/game-progress/complete-map`, {
      childId,
      zoneId: currentZoneId
    });
    return await res.json();
  }
};

// Lesson services
export const lessonService = {
  getAllLessons: async (): Promise<Lesson[]> => {
    const res = await apiRequest("GET", "/api/lessons");
    return await res.json();
  },
  
  getLesson: async (id: number): Promise<Lesson> => {
    const res = await apiRequest("GET", `/api/lessons/${id}`);
    return await res.json();
  },
  
  recordLessonCompletion: async (data: {
    childId: number;
    lessonId: number;
    score: number;
  }): Promise<LessonCompletion> => {
    const res = await apiRequest("POST", "/api/lesson-completions", {
      ...data,
      timestamp: new Date().toISOString()
    });
    return await res.json();
  }
};

// Mini-game services
export const miniGameService = {
  getAllMiniGames: async (): Promise<MiniGame[]> => {
    const res = await apiRequest("GET", "/api/mini-games");
    return await res.json();
  },
  
  getMiniGame: async (id: number): Promise<MiniGame & { questions: Question[] }> => {
    const res = await apiRequest("GET", `/api/mini-games/${id}`);
    return await res.json();
  },
  
  recordAnswer: async (data: {
    childId: number;
    questionId: number;
    selectedChoiceId: string;
    isCorrect: boolean;
  }): Promise<AnswerHistory> => {
    const res = await apiRequest("POST", "/api/answers", {
      ...data,
      timestamp: new Date().toISOString()
    });
    return await res.json();
  }
};

// Analytics services
export const analyticsService = {
  getAnswerHistory: async (childId: number): Promise<AnswerHistory[]> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/answer-history`);
    return await res.json();
  },
  
  getLessonCompletions: async (childId: number): Promise<LessonCompletion[]> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/lesson-completions`);
    return await res.json();
  }
};

// AI content generation services
export const aiService = {
  generateLesson: async (params: {
    subject: string;
    childAge: number;
    difficulty: string;
    interests?: string[];
    title?: string;
  }): Promise<{ lesson: any; savedLessonId: number | null }> => {
    const res = await apiRequest("POST", "/api/ai/generate-lesson", params);
    return await res.json();
  },
  
  generateQuestions: async (params: {
    topic: string;
    childAge: number;
    difficulty: string;
    count?: number;
    previousQuestionsTopics?: string[];
  }): Promise<{ questions: Question[]; savedQuestionIds: number[] }> => {
    const res = await apiRequest("POST", "/api/ai/generate-questions", params);
    return await res.json();
  },
  
  generateMagicalItem: async (params: {
    itemType: string;
    rarity: string;
    primaryStat: string;
    theme?: string;
  }): Promise<{ item: Item; savedItemId: number | null }> => {
    const res = await apiRequest("POST", "/api/ai/generate-magical-item", params);
    return await res.json();
  }
};