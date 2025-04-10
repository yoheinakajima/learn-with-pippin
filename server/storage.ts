import { 
  User, InsertUser, 
  ChildProfile, InsertChildProfile,
  Item, InsertItem,
  InventoryItem, InsertInventoryItem,
  Lesson, InsertLesson,
  Question, InsertQuestion,
  AnswerHistory, InsertAnswerHistory,
  LessonCompletion, InsertLessonCompletion,
  MapZone, InsertMapZone,
  MasterMap, InsertMasterMap,
  MasterMapGate, InsertMasterMapGate,
  ChildMasterMapProgress, InsertChildMasterMapProgress,
  MiniGame, InsertMiniGame,
  ChildMapProgress, InsertChildMapProgress
} from "@shared/schema";

// These types are now used from client/src/lib/types.ts instead of schema.ts
interface MapNode {
  id: string;
  x: number;
  y: number;
  status: 'locked' | 'available' | 'current' | 'completed';
  type: 'mini-task' | 'mini-game' | 'lesson' | 'boss';
}

interface MapPath {
  from: string;
  to: string;
}

interface MapDecoration {
  type: string;
  x: number;
  y: number;
  size?: number;
  width?: number;
  height?: number;
}

interface MapConfig {
  background: string;
  nodes: MapNode[];
  paths: MapPath[];
  decorations: MapDecoration[];
}

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Child profile management
  getChildProfile(id: number): Promise<ChildProfile | undefined>;
  getChildProfilesByParentId(parentId: number): Promise<ChildProfile[]>;
  createChildProfile(childProfile: InsertChildProfile): Promise<ChildProfile>;
  updateChildProfile(id: number, data: Partial<ChildProfile>): Promise<ChildProfile>;
  
  // Item management
  getItem(id: number): Promise<Item | undefined>;
  getAllItems(): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  
  // Inventory management
  getInventoryItemsByChildId(childId: number): Promise<InventoryItem[]>;
  addItemToInventory(inventoryItem: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, data: Partial<InventoryItem>): Promise<InventoryItem>;
  
  // Lesson management
  getLesson(id: number): Promise<Lesson | undefined>;
  getAllLessons(): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  
  // Question management
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionsByMiniGameId(miniGameId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // Answer history
  getAnswerHistoryByChildId(childId: number): Promise<AnswerHistory[]>;
  recordAnswer(answerHistory: InsertAnswerHistory): Promise<AnswerHistory>;
  
  // Lesson completion
  getLessonCompletionsByChildId(childId: number): Promise<LessonCompletion[]>;
  recordLessonCompletion(lessonCompletion: InsertLessonCompletion): Promise<LessonCompletion>;
  
  // Map zones
  getMapZone(id: number): Promise<MapZone | undefined>;
  getAllMapZones(): Promise<MapZone[]>;
  createMapZone(mapZone: InsertMapZone): Promise<MapZone>;
  updateMapZone(id: number, data: Partial<MapZone>): Promise<MapZone>;
  
  // Child Map Progress - For child-specific map node statuses
  getChildMapProgress(id: number): Promise<ChildMapProgress | undefined>;
  getChildMapProgressByChildIdAndZoneId(childId: number, zoneId: number): Promise<ChildMapProgress | undefined>;
  getChildMapProgressByChildId(childId: number): Promise<ChildMapProgress[]>;
  createChildMapProgress(progress: InsertChildMapProgress): Promise<ChildMapProgress>;
  updateChildMapProgress(id: number, data: Partial<ChildMapProgress>): Promise<ChildMapProgress>;
  
  // The following methods will use child-specific map progress data
  // They'll be updated to use child map progress internally
  updateNodeStatus(zoneId: number, nodeId: string, childId: number, status: 'locked' | 'available' | 'current' | 'completed'): Promise<MapZone>;
  updateNodeStatuses(zoneId: number, childId: number, updates: { nodeId: string, status: 'locked' | 'available' | 'current' | 'completed' }[]): Promise<MapZone>;
  completeQuest(zoneId: number, nodeId: string, childId: number, questType: string, questId: number): Promise<MapZone>;
  
  // Mini-games
  getMiniGame(id: number): Promise<MiniGame | undefined>;
  getAllMiniGames(): Promise<MiniGame[]>;
  createMiniGame(miniGame: InsertMiniGame): Promise<MiniGame>;
  
  // Master Map
  getMasterMap(id: number): Promise<MasterMap | undefined>;
  getActiveMasterMap(): Promise<MasterMap | undefined>;
  getAllMasterMaps(): Promise<MasterMap[]>;
  createMasterMap(masterMap: InsertMasterMap): Promise<MasterMap>;
  updateMasterMap(id: number, data: Partial<MasterMap>): Promise<MasterMap>;
  setActiveMasterMap(id: number): Promise<MasterMap>;
  
  // Master Map Gates
  getMasterMapGate(id: number): Promise<MasterMapGate | undefined>;
  getMasterMapGatesByMasterMapId(masterMapId: number): Promise<MasterMapGate[]>;
  getMasterMapGateByNodeId(masterMapId: number, nodeId: string): Promise<MasterMapGate | undefined>;
  createMasterMapGate(gate: InsertMasterMapGate): Promise<MasterMapGate>;
  updateMasterMapGate(id: number, data: Partial<MasterMapGate>): Promise<MasterMapGate>;
  
  // Child Master Map Progress
  getChildMasterMapProgress(id: number): Promise<ChildMasterMapProgress | undefined>;
  getChildMasterMapProgressByChildId(childId: number, masterMapId?: number): Promise<ChildMasterMapProgress[]>;
  getChildMasterMapProgressByChildIdAndMapId(childId: number, masterMapId: number): Promise<ChildMasterMapProgress | undefined>;
  createChildMasterMapProgress(progress: InsertChildMasterMapProgress): Promise<ChildMasterMapProgress>;
  updateChildMasterMapProgress(id: number, data: Partial<ChildMasterMapProgress>): Promise<ChildMasterMapProgress>;
  
  // Key management for master maps
  addKeyToChildProfile(childId: number, keyId: string): Promise<ChildProfile>;
  checkIfChildHasKey(childId: number, keyId: string): Promise<boolean>;
  checkIfChildCanUnlockGate(childId: number, gateId: number): Promise<boolean>;
  
  // Master map node operations
  updateMasterMapNodeStatus(masterMapId: number, nodeId: string, childId: number, status: 'locked' | 'available' | 'current' | 'completed'): Promise<MasterMap>;
  completeZoneInMasterMap(childId: number, masterMapId: number, zoneId: number): Promise<{
    updatedMasterMap?: MasterMap;
    childProfile?: ChildProfile;
    addedKey?: string;
    unlockedGates?: MasterMapGate[];
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private childProfiles: Map<number, ChildProfile>;
  private items: Map<number, Item>;
  private inventoryItems: Map<number, InventoryItem>;
  private lessons: Map<number, Lesson>;
  private questions: Map<number, Question>;
  private answerHistory: Map<number, AnswerHistory>;
  private lessonCompletions: Map<number, LessonCompletion>;
  private mapZones: Map<number, MapZone>;
  private miniGames: Map<number, MiniGame>;
  private childMapProgress: Map<number, ChildMapProgress>;
  private masterMaps: Map<number, MasterMap>;
  private masterMapGates: Map<number, MasterMapGate>;
  private childMasterMapProgress: Map<number, ChildMasterMapProgress>;
  
  private userCurrentId: number;
  private childProfileCurrentId: number;
  private itemCurrentId: number;
  private inventoryItemCurrentId: number;
  private lessonCurrentId: number;
  private questionCurrentId: number;
  private answerHistoryCurrentId: number;
  private lessonCompletionCurrentId: number;
  private mapZoneCurrentId: number;
  private miniGameCurrentId: number;
  private childMapProgressCurrentId: number;
  private masterMapCurrentId: number;
  private masterMapGateCurrentId: number;
  private childMasterMapProgressCurrentId: number;

  constructor() {
    this.users = new Map();
    this.childProfiles = new Map();
    this.items = new Map();
    this.inventoryItems = new Map();
    this.lessons = new Map();
    this.questions = new Map();
    this.answerHistory = new Map();
    this.lessonCompletions = new Map();
    this.mapZones = new Map();
    this.miniGames = new Map();
    this.childMapProgress = new Map();
    this.masterMaps = new Map();
    this.masterMapGates = new Map();
    this.childMasterMapProgress = new Map();
    
    this.userCurrentId = 1;
    this.childProfileCurrentId = 1;
    this.itemCurrentId = 1;
    this.inventoryItemCurrentId = 1;
    this.lessonCurrentId = 1;
    this.questionCurrentId = 1;
    this.answerHistoryCurrentId = 1;
    this.lessonCompletionCurrentId = 1;
    this.mapZoneCurrentId = 1;
    this.miniGameCurrentId = 1;
    this.childMapProgressCurrentId = 1;
    this.masterMapCurrentId = 1;
    this.masterMapGateCurrentId = 1;
    this.childMasterMapProgressCurrentId = 1;
    
    // Initialize with sample data
    this._initializeData();
  }

  private _initializeData() {
    // Initialize test user account
    this.createUser({
      username: "testparent",
      password: "password123",
      name: "Test Parent",
      email: "test@example.com",
      role: "parent"
    });
    
    // Initialize child profiles for the test parent
    this.createChildProfile({
      parentId: 1, // ID of the test parent
      name: "Test Child",
      age: 8,
      level: 3,
      xp: 150,
      coins: 75,
      stats: {
        magicPower: 12,
        wisdom: 15,
        agility: 10
      },
      equipmentSlots: {},
      preferences: {
        subjects: ["math", "science"],
        difficulty: "intermediate",
        readingLevel: 3,
        mathLevel: 2,
        skipKnownLessons: false
      },
      avatarColor: "primary",
      keys: ["forest_key"] // Give one key to test gate unlocking
    });
    
    this.createChildProfile({
      parentId: 1, // ID of the test parent
      name: "Magical Explorer",
      age: 10,
      level: 4,
      xp: 220,
      coins: 90,
      stats: {
        magicPower: 18,
        wisdom: 14,
        agility: 12
      },
      equipmentSlots: {},
      preferences: {
        subjects: ["reading", "history"],
        difficulty: "intermediate",
        readingLevel: 4,
        mathLevel: 3,
        skipKnownLessons: false
      },
      avatarColor: "accent",
      keys: []
    });
    
    // Initialize map zones
    this.createMapZone({
      name: "Enchanted Forest",
      description: "A magical forest filled with ancient trees and mystical creatures.",
      config: {
        background: "green",
        nodes: [
          { id: "node1", x: 100, y: 300, status: "completed", type: "mini-task" },
          { id: "node2", x: 200, y: 200, status: "current", type: "mini-game" },
          { id: "node3", x: 350, y: 300, status: "available", type: "lesson" },
          { id: "node4", x: 500, y: 350, status: "locked", type: "mini-game" },
          { id: "node5", x: 650, y: 300, status: "locked", type: "boss" },
        ],
        paths: [
          { from: "node1", to: "node2" },
          { from: "node2", to: "node3" },
          { from: "node3", to: "node4" },
          { from: "node4", to: "node5" },
        ],
        decorations: [
          { type: "tree", x: 150, y: 200, size: 50 },
          { type: "tree", x: 250, y: 150, size: 45 },
          { type: "tree", x: 350, y: 180, size: 55 },
          { type: "lake", x: 500, y: 450, width: 150, height: 80 },
        ]
      },
      unlockRequirements: null,
      // Link to master map
      isMasterMap: false,
      masterMapId: 1,
      masterMapNodeId: "zone1",
      rewardKey: "forest_key" // This zone rewards the forest key when completed
    });
    
    // Create different map progress for each child
    // For Child 1 (id: 1)
    this.createChildMapProgress({
      childId: 1,
      zoneId: 1,
      nodeStatuses: [
        { nodeId: "node1", status: "completed" },
        { nodeId: "node2", status: "current" },
        { nodeId: "node3", status: "available" },
        { nodeId: "node4", status: "locked" },
        { nodeId: "node5", status: "locked" }
      ],
      lastUpdatedAt: new Date().toISOString()
    });
    
    // For Child 2 (id: 2)
    this.createChildMapProgress({
      childId: 2,
      zoneId: 1,
      nodeStatuses: [
        { nodeId: "node1", status: "completed" },
        { nodeId: "node2", status: "completed" },
        { nodeId: "node3", status: "current" },
        { nodeId: "node4", status: "available" },
        { nodeId: "node5", status: "locked" }
      ],
      lastUpdatedAt: new Date().toISOString()
    });
    
    // Initialize Master Map
    this.createMasterMap({
      name: "Magical Kingdoms",
      description: "A map of the magical kingdoms where each area contains unique challenges and lessons.",
      config: {
        background: "purple",
        nodes: [
          { id: "zone1", x: 150, y: 250, status: "current", type: "zone" },
          { id: "gate1", x: 300, y: 250, status: "available", type: "gate" },
          { id: "zone2", x: 450, y: 250, status: "locked", type: "zone" },
          { id: "gate2", x: 600, y: 250, status: "locked", type: "gate" },
          { id: "zone3", x: 750, y: 250, status: "locked", type: "zone" },
        ],
        paths: [
          { from: "zone1", to: "gate1" },
          { from: "gate1", to: "zone2" },
          { from: "zone2", to: "gate2" },
          { from: "gate2", to: "zone3" },
        ],
        decorations: [
          { type: "mountain", x: 200, y: 150, size: 80 },
          { type: "castle", x: 450, y: 150, size: 60 },
          { type: "tower", x: 700, y: 150, size: 70 },
          { type: "cloud", x: 300, y: 100, width: 100, height: 50 },
          { type: "cloud", x: 550, y: 80, width: 120, height: 40 },
        ]
      },
      currentActive: true
    });
    
    // Initialize Master Map Gates
    this.createMasterMapGate({
      masterMapId: 1,
      nodeId: "gate1",
      requiredKeys: ["forest_key"],
      description: "A magical gate that requires the Forest Key to unlock. Only those who have mastered the Enchanted Forest can pass through."
    });
    
    this.createMasterMapGate({
      masterMapId: 1,
      nodeId: "gate2",
      requiredKeys: ["mountain_key", "river_key"],
      description: "An ancient gate guarded by powerful magic. It requires both the Mountain Key and River Key to open."
    });
    
    // Create Child Master Map Progress
    this.createChildMasterMapProgress({
      childId: 1,
      masterMapId: 1,
      completedZones: [],
      lastUpdatedAt: new Date().toISOString()
    });
    
    this.createChildMasterMapProgress({
      childId: 2,
      masterMapId: 1,
      completedZones: [],
      lastUpdatedAt: new Date().toISOString()
    });
    
    // Initialize items
    this.createItem({
      name: "Crystal Wand",
      description: "A mystical wand carved from enchanted forest crystal. Boosts spell-casting abilities and enhances magical knowledge.",
      rarity: "Rare",
      price: 100,
      statBoosts: {
        magicPower: 15,
        wisdom: 5,
        agility: 0
      },
      imageUrl: null,
      requirements: null
    });
    
    this.createItem({
      name: "Scholar's Amulet",
      description: "A powerful amulet passed down by the wisest scholars. Significantly increases knowledge retention and lesson comprehension.",
      rarity: "Epic",
      price: 200,
      statBoosts: {
        magicPower: 0,
        wisdom: 20,
        agility: 0
      },
      imageUrl: null,
      requirements: null
    });
    
    this.createItem({
      name: "Swift Boots",
      description: "Enchanted boots that allow the wearer to move more quickly through the world. Perfect for exploration and quick challenge completion.",
      rarity: "Uncommon",
      price: 75,
      statBoosts: {
        magicPower: 0,
        wisdom: 0,
        agility: 25
      },
      imageUrl: null,
      requirements: null
    });
    
    // Create some questions
    this.createQuestion({
      text: "What fraction of the magical potion has been used?",
      choices: [
        { id: "a", text: "1/3" },
        { id: "b", text: "2/3" },
        { id: "c", text: "1/4" },
        { id: "d", text: "3/4" }
      ],
      correctAnswerId: "b",
      hint: "Look at how much liquid is remaining in the potion bottle compared to its full capacity.",
      difficulty: 2,
      tags: ["math", "fractions"]
    });
    
    this.createQuestion({
      text: "If a wizard has 12 spell books and gives away 1/4 of them, how many books does the wizard have left?",
      choices: [
        { id: "a", text: "3 books" },
        { id: "b", text: "6 books" },
        { id: "c", text: "8 books" },
        { id: "d", text: "9 books" }
      ],
      correctAnswerId: "d",
      hint: "First calculate how many books represent 1/4 of the total, then subtract from the original amount.",
      difficulty: 2,
      tags: ["math", "fractions", "subtraction"]
    });
    
    this.createQuestion({
      text: "A magical garden has 3 plants that each grow 2/5 inch per day. How much total growth will there be after 1 day?",
      choices: [
        { id: "a", text: "6/5 inches" },
        { id: "b", text: "6/15 inches" },
        { id: "c", text: "2/15 inches" },
        { id: "d", text: "1 1/5 inches" }
      ],
      correctAnswerId: "a",
      hint: "Multiply the growth of one plant by the number of plants.",
      difficulty: 3,
      tags: ["math", "fractions", "multiplication"]
    });
    
    // Initialize mini-games
    this.createMiniGame({
      name: "Forest Fraction Challenge",
      description: "Test your fraction knowledge in the magical forest!",
      type: "multiple_choice",
      difficulty: 2,
      xpReward: 25,
      coinReward: 10,
      questionIds: [1, 2, 3]
    });
    
    // Initialize lessons
    this.createLesson({
      title: "Magical Math Adventure",
      description: "Learn about basic math through magical adventures!",
      contentType: "reading",
      content: JSON.stringify({
        introduction: "Welcome to the magical world of numbers! In this lesson, we'll explore how magic and math combine to create powerful spells.",
        key_concepts: [
          {
            heading: "Addition Magic",
            content: "When wizards combine magical crystals, they use addition. If you have 3 crystals and find 4 more, you now have 7 crystals total!"
          },
          {
            heading: "Subtraction Spells",
            content: "Sometimes we need to use some of our magical items. If you have 10 potions and use 4 during your adventure, you'll have 6 potions left."
          }
        ],
        activity: {
          title: "Crystal Counting Challenge",
          instructions: "Collect different colored crystals and count how many you have in total. Try combining different amounts and see what happens!"
        },
        summary: "Today we learned how wizards use addition and subtraction in their magical adventures. These skills will help you on your journey!"
      }),
      difficulty: 1,
      xpReward: 30,
      coinReward: 15,
      tags: ["math", "addition", "subtraction"],
      prerequisites: []
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      // Ensure role is always a string
      role: insertUser.role || 'parent'
    };
    this.users.set(id, user);
    return user;
  }

  // Child Profile Management
  async getChildProfile(id: number): Promise<ChildProfile | undefined> {
    return this.childProfiles.get(id);
  }

  async getChildProfilesByParentId(parentId: number): Promise<ChildProfile[]> {
    return Array.from(this.childProfiles.values()).filter(
      (profile) => profile.parentId === parentId
    );
  }

  async createChildProfile(profile: InsertChildProfile): Promise<ChildProfile> {
    const id = this.childProfileCurrentId++;
    const childProfile: ChildProfile = { 
      ...profile, 
      id,
      // Ensure required fields have default values
      level: profile.level || 1,
      xp: profile.xp || 0,
      coins: profile.coins || 0,
      avatarColor: profile.avatarColor || 'primary'
    };
    this.childProfiles.set(id, childProfile);
    return childProfile;
  }

  async updateChildProfile(id: number, data: Partial<ChildProfile>): Promise<ChildProfile> {
    const profile = await this.getChildProfile(id);
    if (!profile) {
      throw new Error(`Child profile with id ${id} not found`);
    }
    
    const updatedProfile = { ...profile, ...data };
    this.childProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Item Management
  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async getAllItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async createItem(item: InsertItem): Promise<Item> {
    const id = this.itemCurrentId++;
    const newItem: Item = { 
      ...item, 
      id,
      // Ensure imageUrl is either a string or null, not undefined
      imageUrl: item.imageUrl ?? null,
      // Ensure requirements is not undefined
      requirements: item.requirements ?? {}
    };
    this.items.set(id, newItem);
    return newItem;
  }

  // Inventory Management
  async getInventoryItemsByChildId(childId: number): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      (item) => item.childId === childId
    );
  }

  async addItemToInventory(inventoryItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryItemCurrentId++;
    const newInventoryItem: InventoryItem = { 
      ...inventoryItem, 
      id,
      // Default to not equipped if not specified
      equipped: inventoryItem.equipped ?? false
    };
    this.inventoryItems.set(id, newInventoryItem);
    return newInventoryItem;
  }

  async updateInventoryItem(id: number, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const item = this.inventoryItems.get(id);
    if (!item) {
      throw new Error(`Inventory item with id ${id} not found`);
    }
    
    const updatedItem = { ...item, ...data };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  // Lesson Management
  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async getAllLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values());
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const id = this.lessonCurrentId++;
    const newLesson: Lesson = { 
      ...lesson, 
      id,
      // Ensure prerequisites is not undefined
      prerequisites: lesson.prerequisites ?? []
    };
    this.lessons.set(id, newLesson);
    return newLesson;
  }

  // Question Management
  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getQuestionsByMiniGameId(miniGameId: number): Promise<Question[]> {
    const miniGame = await this.getMiniGame(miniGameId);
    if (!miniGame || !miniGame.questionIds) {
      return [];
    }
    
    const questionIds = miniGame.questionIds as number[];
    return Promise.all(
      questionIds.map(id => this.getQuestion(id))
    ).then(questions => questions.filter(Boolean) as Question[]);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.questionCurrentId++;
    const newQuestion: Question = { 
      ...question, 
      id,
      // Ensure hint is either a string or null, not undefined
      hint: question.hint ?? null
    };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  // Answer History
  async getAnswerHistoryByChildId(childId: number): Promise<AnswerHistory[]> {
    return Array.from(this.answerHistory.values()).filter(
      (history) => history.childId === childId
    );
  }

  async recordAnswer(answerHistory: InsertAnswerHistory): Promise<AnswerHistory> {
    const id = this.answerHistoryCurrentId++;
    const newHistory: AnswerHistory = { ...answerHistory, id };
    this.answerHistory.set(id, newHistory);
    return newHistory;
  }

  // Lesson Completion
  async getLessonCompletionsByChildId(childId: number): Promise<LessonCompletion[]> {
    return Array.from(this.lessonCompletions.values()).filter(
      (completion) => completion.childId === childId
    );
  }

  async recordLessonCompletion(lessonCompletion: InsertLessonCompletion): Promise<LessonCompletion> {
    const id = this.lessonCompletionCurrentId++;
    const newCompletion: LessonCompletion = { ...lessonCompletion, id };
    this.lessonCompletions.set(id, newCompletion);
    return newCompletion;
  }

  // Map Zones
  async getMapZone(id: number): Promise<MapZone | undefined> {
    return this.mapZones.get(id);
  }

  async getAllMapZones(): Promise<MapZone[]> {
    return Array.from(this.mapZones.values());
  }

  async createMapZone(mapZone: InsertMapZone): Promise<MapZone> {
    const id = this.mapZoneCurrentId++;
    const newZone: MapZone = { 
      ...mapZone, 
      id,
      // Ensure unlockRequirements is not undefined
      unlockRequirements: mapZone.unlockRequirements ?? {}
    };
    this.mapZones.set(id, newZone);
    return newZone;
  }
  
  async updateMapZone(id: number, data: Partial<MapZone>): Promise<MapZone> {
    const zone = await this.getMapZone(id);
    if (!zone) {
      throw new Error(`Map zone with id ${id} not found`);
    }
    
    const updatedZone = { ...zone, ...data };
    this.mapZones.set(id, updatedZone);
    return updatedZone;
  }
  
  // Child Map Progress
  async getChildMapProgress(id: number): Promise<ChildMapProgress | undefined> {
    return this.childMapProgress.get(id);
  }
  
  async getChildMapProgressByChildIdAndZoneId(childId: number, zoneId: number): Promise<ChildMapProgress | undefined> {
    return Array.from(this.childMapProgress.values()).find(
      (progress) => progress.childId === childId && progress.zoneId === zoneId
    );
  }
  
  async getChildMapProgressByChildId(childId: number): Promise<ChildMapProgress[]> {
    return Array.from(this.childMapProgress.values()).filter(
      (progress) => progress.childId === childId
    );
  }
  
  async createChildMapProgress(progress: InsertChildMapProgress): Promise<ChildMapProgress> {
    const id = this.childMapProgressCurrentId++;
    const newProgress: ChildMapProgress = {
      ...progress,
      id,
      completedAt: progress.completedAt ?? null,
    };
    this.childMapProgress.set(id, newProgress);
    return newProgress;
  }
  
  async updateChildMapProgress(id: number, data: Partial<ChildMapProgress>): Promise<ChildMapProgress> {
    console.log(`[SERVER] updateChildMapProgress called for id ${id} with data:`, JSON.stringify(data));
    
    const progress = await this.getChildMapProgress(id);
    if (!progress) {
      console.log(`[SERVER] Error: Child map progress with id ${id} not found`);
      throw new Error(`Child map progress with id ${id} not found`);
    }
    
    console.log(`[SERVER] Original progress:`, {
      id: progress.id,
      childId: progress.childId,
      zoneId: progress.zoneId,
      nodeStatusCount: progress.nodeStatuses ? (progress.nodeStatuses as any).length : 0
    });
    
    const updatedProgress = { ...progress, ...data };
    
    console.log(`[SERVER] Saving updated progress:`, {
      id: updatedProgress.id,
      childId: updatedProgress.childId,
      zoneId: updatedProgress.zoneId,
      nodeStatusCount: updatedProgress.nodeStatuses ? (updatedProgress.nodeStatuses as any).length : 0
    });
    
    this.childMapProgress.set(id, updatedProgress);
    return updatedProgress;
  }
  
  async updateNodeStatus(zoneId: number, nodeId: string, childId: number, status: 'locked' | 'available' | 'current' | 'completed'): Promise<MapZone> {
    // Get the map zone
    const zone = await this.getMapZone(zoneId);
    if (!zone) {
      throw new Error(`Map zone with id ${zoneId} not found`);
    }
    
    // Get child-specific map progress or create it if it doesn't exist
    let childProgress = await this.getChildMapProgressByChildIdAndZoneId(childId, zoneId);
    
    if (!childProgress) {
      // Initialize node statuses based on the map zone's default config
      const nodeStatuses = (zone.config as MapConfig).nodes.map(node => ({
        nodeId: node.id,
        status: node.status
      }));
      
      // Create new progress entry
      childProgress = await this.createChildMapProgress({
        childId,
        zoneId,
        nodeStatuses,
        lastUpdatedAt: new Date().toISOString()
      });
    }
    
    // Create a deep copy of the node statuses to avoid modifying the original object
    const updatedNodeStatuses = [...childProgress.nodeStatuses as any];
    
    // Find the node to update
    const nodeStatusIndex = updatedNodeStatuses.findIndex((nodeStatus: any) => nodeStatus.nodeId === nodeId);
    if (nodeStatusIndex === -1) {
      throw new Error(`Node with id ${nodeId} not found in child progress for zone ${zoneId}`);
    }
    
    // Update the node status
    updatedNodeStatuses[nodeStatusIndex] = {
      ...updatedNodeStatuses[nodeStatusIndex],
      status
    };
    
    // Update the child's map progress
    await this.updateChildMapProgress(childProgress.id, {
      nodeStatuses: updatedNodeStatuses,
      lastUpdatedAt: new Date().toISOString()
    });
    
    // Return the map zone with the updated node statuses for this child
    // Create a customized view of the map zone with child-specific node statuses
    const customZone = { ...zone };
    const customConfig = { ...(zone.config as MapConfig) };
    customZone.config = customConfig;
    
    // Update the nodes with child-specific statuses
    customConfig.nodes = (zone.config as MapConfig).nodes.map(node => {
      const nodeStatus = updatedNodeStatuses.find((ns: any) => ns.nodeId === node.id);
      return {
        ...node,
        status: nodeStatus ? nodeStatus.status : node.status
      };
    });
    
    return customZone;
  }
  
  async updateNodeStatuses(zoneId: number, childId: number, updates: { nodeId: string, status: 'locked' | 'available' | 'current' | 'completed' }[]): Promise<MapZone> {
    // Get the map zone
    const zone = await this.getMapZone(zoneId);
    if (!zone) {
      throw new Error(`Map zone with id ${zoneId} not found`);
    }
    
    // Get child-specific map progress or create it if it doesn't exist
    let childProgress = await this.getChildMapProgressByChildIdAndZoneId(childId, zoneId);
    
    if (!childProgress) {
      // Initialize node statuses based on the map zone's default config
      const nodeStatuses = (zone.config as MapConfig).nodes.map(node => ({
        nodeId: node.id,
        status: node.status
      }));
      
      // Create new progress entry
      childProgress = await this.createChildMapProgress({
        childId,
        zoneId,
        nodeStatuses,
        lastUpdatedAt: new Date().toISOString()
      });
    }
    
    // Create a deep copy of the node statuses to avoid modifying the original object
    const updatedNodeStatuses = [...childProgress.nodeStatuses as any];
    
    // Apply all the updates
    updates.forEach(update => {
      const nodeStatusIndex = updatedNodeStatuses.findIndex((nodeStatus: any) => nodeStatus.nodeId === update.nodeId);
      if (nodeStatusIndex !== -1) {
        updatedNodeStatuses[nodeStatusIndex] = {
          ...updatedNodeStatuses[nodeStatusIndex],
          status: update.status
        };
      }
    });
    
    // Update the child's map progress
    await this.updateChildMapProgress(childProgress.id, {
      nodeStatuses: updatedNodeStatuses,
      lastUpdatedAt: new Date().toISOString()
    });
    
    // Return the map zone with the updated node statuses for this child
    // Create a customized view of the map zone with child-specific node statuses
    const customZone = { ...zone };
    const customConfig = { ...(zone.config as MapConfig) };
    customZone.config = customConfig;
    
    // Update the nodes with child-specific statuses
    customConfig.nodes = (zone.config as MapConfig).nodes.map(node => {
      const nodeStatus = updatedNodeStatuses.find((ns: any) => ns.nodeId === node.id);
      return {
        ...node,
        status: nodeStatus ? nodeStatus.status : node.status
      };
    });
    
    return customZone;
  }
  
  async completeQuest(zoneId: number, nodeId: string, childId: number, questType: string, questId: number): Promise<MapZone> {
    console.log(`[SERVER] completeQuest called with params:`, {zoneId, nodeId, childId, questType, questId});
    
    // Get the map zone
    const zone = await this.getMapZone(zoneId);
    if (!zone) {
      console.log(`[SERVER] Error: Map zone with id ${zoneId} not found`);
      throw new Error(`Map zone with id ${zoneId} not found`);
    }
    console.log(`[SERVER] Found map zone:`, {zoneId: zone.id, name: zone.name});
    
    // Get child-specific map progress or create it if it doesn't exist
    let childProgress = await this.getChildMapProgressByChildIdAndZoneId(childId, zoneId);

    console.log('[SERVER] Child progress:', childProgress);
    
    if (!childProgress) {
      console.log(`[SERVER] No child progress found, creating new entry for childId ${childId} and zoneId ${zoneId}`);
      // Initialize node statuses based on the map zone's default config
      const nodeStatuses = (zone.config as MapConfig).nodes.map(node => ({
        nodeId: node.id,
        status: node.status
      }));
      
      // Create new progress entry
      childProgress = await this.createChildMapProgress({
        childId,
        zoneId,
        nodeStatuses,
        lastUpdatedAt: new Date().toISOString()
      });
      console.log('[SERVER] Child progress inside:', childProgress);
    } else {
      console.log(`[SERVER] Found existing child progress:`, {
        progressId: childProgress.id,
        childId: childProgress.childId,
        zoneId: childProgress.zoneId
      });
    }
    
    // Create a deep copy of the node statuses to avoid modifying the original object
    const updatedNodeStatuses = [...childProgress.nodeStatuses as any];
    
    // Create a reference to the map config for easier access
    const mapConfig = zone.config as MapConfig;
    
    // 1. Find the node status that was completed
    const nodeStatusIndex = updatedNodeStatuses.findIndex((nodeStatus: any) => nodeStatus.nodeId === nodeId);
    if (nodeStatusIndex === -1) {
      console.log(`[SERVER] Error: Node with id ${nodeId} not found in child progress for zone ${zoneId}`);
      throw new Error(`Node with id ${nodeId} not found in child progress for zone ${zoneId}`);
    }
    
    console.log(`[SERVER] Found node to complete:`, {
      nodeId,
      currentStatus: updatedNodeStatuses[nodeStatusIndex].status,
      index: nodeStatusIndex
    });
    
    // 2. Mark the completed node as 'completed'
    updatedNodeStatuses[nodeStatusIndex] = {
      ...updatedNodeStatuses[nodeStatusIndex],
      status: 'completed'
    };
    
    console.log(`[SERVER] Marked node as completed:`, {
      nodeId,
      newStatus: updatedNodeStatuses[nodeStatusIndex].status
    });
    
    // 3. Find nodes that should be unlocked (nodes connected to the completed node)
    const nodesToUnlock: string[] = [];
    mapConfig.paths.forEach(path => {
      if (path.from === nodeId) {
        // This is a path leading from the completed node
        const targetNodeStatus = updatedNodeStatuses.find((ns: any) => ns.nodeId === path.to);
        if (targetNodeStatus && targetNodeStatus.status === 'locked') {
          nodesToUnlock.push(targetNodeStatus.nodeId);
        }
      }
    });
    
    console.log(`[SERVER] Nodes to unlock:`, nodesToUnlock);
    
    // 4. Update status of nodes to unlock
    for (const nodeToUnlockId of nodesToUnlock) {
      const nodeToUnlockIndex = updatedNodeStatuses.findIndex((ns: any) => ns.nodeId === nodeToUnlockId);
      if (nodeToUnlockIndex !== -1) {
        // Set first unlocked node as 'current', others as 'available'
        const isFirstUnlocked = !updatedNodeStatuses.some((ns: any) => 
          ns.status === 'current' || (ns.status === 'available' && ns.nodeId !== nodeToUnlockId)
        );
        updatedNodeStatuses[nodeToUnlockIndex] = {
          ...updatedNodeStatuses[nodeToUnlockIndex],
          status: isFirstUnlocked ? 'current' : 'available'
        };
        console.log(`[SERVER] Unlocked node ${nodeToUnlockId} with status:`, {
          newStatus: updatedNodeStatuses[nodeToUnlockIndex].status,
          isFirstUnlocked
        });
      }
    }
    
    // 5. If there's no 'current' node, set the first 'available' node as 'current'
    if (!updatedNodeStatuses.some((ns: any) => ns.status === 'current')) {
      const firstAvailableIndex = updatedNodeStatuses.findIndex((ns: any) => ns.status === 'available');
      if (firstAvailableIndex !== -1) {
        updatedNodeStatuses[firstAvailableIndex] = {
          ...updatedNodeStatuses[firstAvailableIndex],
          status: 'current'
        };
        console.log(`[SERVER] Set first available node as current:`, {
          nodeId: updatedNodeStatuses[firstAvailableIndex].nodeId,
          index: firstAvailableIndex
        });
      }
    }
    
    // 6. Update child's map progress
    const isMapCompleted = updatedNodeStatuses.every((ns: any) => ns.status === 'completed');
    const updateData = {
      nodeStatuses: updatedNodeStatuses,
      completedAt: isMapCompleted ? new Date().toISOString() : childProgress.completedAt,
      lastUpdatedAt: new Date().toISOString()
    };
    console.log(`[SERVER] Updating child map progress:`, {
      progressId: childProgress.id,
      updateData: JSON.stringify(updateData)
    });
    
    await this.updateChildMapProgress(childProgress.id, updateData);
    
    // 7. Return the map zone with the updated node statuses for this child
    // Create a customized view of the map zone with child-specific node statuses
    const customZone = { ...zone };
    const customConfig = { ...mapConfig };
    customZone.config = customConfig;
    
    // Update the nodes with child-specific statuses
    customConfig.nodes = mapConfig.nodes.map(node => {
      const nodeStatus = updatedNodeStatuses.find((ns: any) => ns.nodeId === node.id);
      return {
        ...node,
        status: nodeStatus ? nodeStatus.status : node.status
      };
    });
    
    console.log(`[SERVER] Returning customized zone with updated node statuses`);
    return customZone;
  }

  // Mini-Games
  async getMiniGame(id: number): Promise<MiniGame | undefined> {
    return this.miniGames.get(id);
  }

  async getAllMiniGames(): Promise<MiniGame[]> {
    return Array.from(this.miniGames.values());
  }

  async createMiniGame(miniGame: InsertMiniGame): Promise<MiniGame> {
    const id = this.miniGameCurrentId++;
    const newGame: MiniGame = { 
      ...miniGame, 
      id,
      // Ensure questionIds is not undefined 
      questionIds: miniGame.questionIds ?? [] 
    };
    this.miniGames.set(id, newGame);
    return newGame;
  }

  // Master Map Methods
  async getMasterMap(id: number): Promise<MasterMap | undefined> {
    return this.masterMaps.get(id);
  }

  async getActiveMasterMap(): Promise<MasterMap | undefined> {
    return Array.from(this.masterMaps.values()).find(
      (map) => map.currentActive === true
    );
  }

  async getAllMasterMaps(): Promise<MasterMap[]> {
    return Array.from(this.masterMaps.values());
  }

  async createMasterMap(masterMap: InsertMasterMap): Promise<MasterMap> {
    const id = this.masterMapCurrentId++;
    const newMap: MasterMap = {
      ...masterMap,
      id,
      currentActive: masterMap.currentActive ?? false
    };
    this.masterMaps.set(id, newMap);
    
    // If this map is set as active, deactivate all other maps
    if (newMap.currentActive) {
      for (const [mapId, map] of this.masterMaps.entries()) {
        if (mapId !== id && map.currentActive) {
          this.masterMaps.set(mapId, { ...map, currentActive: false });
        }
      }
    }
    
    return newMap;
  }

  async updateMasterMap(id: number, data: Partial<MasterMap>): Promise<MasterMap> {
    const map = await this.getMasterMap(id);
    if (!map) {
      throw new Error(`Master map with id ${id} not found`);
    }
    
    const updatedMap = { ...map, ...data };
    this.masterMaps.set(id, updatedMap);
    
    // If this map is set as active, deactivate all other maps
    if (data.currentActive) {
      for (const [mapId, map] of this.masterMaps.entries()) {
        if (mapId !== id && map.currentActive) {
          this.masterMaps.set(mapId, { ...map, currentActive: false });
        }
      }
    }
    
    return updatedMap;
  }

  async setActiveMasterMap(id: number): Promise<MasterMap> {
    const maps = await this.getAllMasterMaps();
    
    // Set all maps to inactive first
    for (const map of maps) {
      if (map.currentActive) {
        await this.updateMasterMap(map.id, { currentActive: false });
      }
    }
    
    // Then set the desired map as active
    const targetMap = await this.getMasterMap(id);
    if (!targetMap) {
      throw new Error(`Master map with id ${id} not found`);
    }
    
    return this.updateMasterMap(id, { currentActive: true });
  }

  // Master Map Gate Methods
  async getMasterMapGate(id: number): Promise<MasterMapGate | undefined> {
    return this.masterMapGates.get(id);
  }

  async getMasterMapGatesByMasterMapId(masterMapId: number): Promise<MasterMapGate[]> {
    return Array.from(this.masterMapGates.values()).filter(
      (gate) => gate.masterMapId === masterMapId
    );
  }

  async getMasterMapGateByNodeId(masterMapId: number, nodeId: string): Promise<MasterMapGate | undefined> {
    return Array.from(this.masterMapGates.values()).find(
      (gate) => gate.masterMapId === masterMapId && gate.nodeId === nodeId
    );
  }

  async createMasterMapGate(gate: InsertMasterMapGate): Promise<MasterMapGate> {
    const id = this.masterMapGateCurrentId++;
    const newGate: MasterMapGate = {
      ...gate,
      id
    };
    this.masterMapGates.set(id, newGate);
    return newGate;
  }

  async updateMasterMapGate(id: number, data: Partial<MasterMapGate>): Promise<MasterMapGate> {
    const gate = await this.getMasterMapGate(id);
    if (!gate) {
      throw new Error(`Master map gate with id ${id} not found`);
    }
    
    const updatedGate = { ...gate, ...data };
    this.masterMapGates.set(id, updatedGate);
    return updatedGate;
  }

  // Child Master Map Progress Methods
  async getChildMasterMapProgress(id: number): Promise<ChildMasterMapProgress | undefined> {
    return this.childMasterMapProgress.get(id);
  }

  async getChildMasterMapProgressByChildId(childId: number, masterMapId?: number): Promise<ChildMasterMapProgress[]> {
    let progress = Array.from(this.childMasterMapProgress.values()).filter(
      (progress) => progress.childId === childId
    );
    
    if (masterMapId !== undefined) {
      progress = progress.filter(p => p.masterMapId === masterMapId);
    }
    
    return progress;
  }

  async getChildMasterMapProgressByChildIdAndMapId(childId: number, masterMapId: number): Promise<ChildMasterMapProgress | undefined> {
    return Array.from(this.childMasterMapProgress.values()).find(
      (progress) => progress.childId === childId && progress.masterMapId === masterMapId
    );
  }

  async createChildMasterMapProgress(progress: InsertChildMasterMapProgress): Promise<ChildMasterMapProgress> {
    const id = this.childMasterMapProgressCurrentId++;
    const newProgress: ChildMasterMapProgress = {
      ...progress,
      id,
      completedZones: progress.completedZones || [],
      lastUpdatedAt: progress.lastUpdatedAt || new Date().toISOString()
    };
    this.childMasterMapProgress.set(id, newProgress);
    return newProgress;
  }

  async updateChildMasterMapProgress(id: number, data: Partial<ChildMasterMapProgress>): Promise<ChildMasterMapProgress> {
    const progress = await this.getChildMasterMapProgress(id);
    if (!progress) {
      throw new Error(`Child master map progress with id ${id} not found`);
    }
    
    const updatedProgress = { ...progress, ...data };
    this.childMasterMapProgress.set(id, updatedProgress);
    return updatedProgress;
  }

  // Key management for master maps
  async addKeyToChildProfile(childId: number, keyId: string): Promise<ChildProfile> {
    const childProfile = await this.getChildProfile(childId);
    if (!childProfile) {
      throw new Error(`Child profile with id ${childId} not found`);
    }
    
    // Initialize keys array if it doesn't exist
    const currentKeys = childProfile.keys || [];
    
    // Check if key already exists
    if (currentKeys.includes(keyId)) {
      return childProfile; // No need to add duplicate key
    }
    
    // Add the new key
    const updatedKeys = [...currentKeys, keyId];
    
    // Update child profile
    return this.updateChildProfile(childId, { keys: updatedKeys });
  }

  async checkIfChildHasKey(childId: number, keyId: string): Promise<boolean> {
    const childProfile = await this.getChildProfile(childId);
    if (!childProfile) {
      return false;
    }
    
    const keys = childProfile.keys || [];
    return keys.includes(keyId);
  }

  async checkIfChildCanUnlockGate(childId: number, gateId: number): Promise<boolean> {
    // Get the child profile and gate
    const childProfile = await this.getChildProfile(childId);
    const gate = await this.getMasterMapGate(gateId);
    
    if (!childProfile || !gate) {
      return false;
    }
    
    // Check if child has all required keys
    const childKeys = childProfile.keys || [];
    return gate.requiredKeys.every(key => childKeys.includes(key));
  }

  // Master map node operations
  async updateMasterMapNodeStatus(masterMapId: number, nodeId: string, childId: number, status: 'locked' | 'available' | 'current' | 'completed'): Promise<MasterMap> {
    const masterMap = await this.getMasterMap(masterMapId);
    if (!masterMap) {
      throw new Error(`Master map with id ${masterMapId} not found`);
    }
    
    // Get progress for this child
    let progress = await this.getChildMasterMapProgressByChildIdAndMapId(childId, masterMapId);
    
    // Create progress if it doesn't exist
    if (!progress) {
      progress = await this.createChildMasterMapProgress({
        childId,
        masterMapId,
        completedZones: [],
        lastUpdatedAt: new Date().toISOString()
      });
    }
    
    // Update node status in the map config
    const updatedNodes = masterMap.config.nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, status };
      }
      return node;
    });
    
    // Update the master map
    const updatedConfig = {
      ...masterMap.config,
      nodes: updatedNodes
    };
    
    return this.updateMasterMap(masterMapId, { config: updatedConfig });
  }

  async completeZoneInMasterMap(childId: number, masterMapId: number, zoneId: number): Promise<{
    updatedMasterMap?: MasterMap;
    childProfile?: ChildProfile;
    addedKey?: string;
    unlockedGates?: MasterMapGate[];
  }> {
    // Get the master map, child profile, and zone
    const masterMap = await this.getMasterMap(masterMapId);
    const childProfile = await this.getChildProfile(childId);
    const zone = await this.getMapZone(zoneId);
    
    if (!masterMap || !childProfile || !zone) {
      throw new Error("Missing required data for completing zone in master map");
    }
    
    // Get or create child master map progress
    let masterMapProgress = await this.getChildMasterMapProgressByChildIdAndMapId(childId, masterMapId);
    if (!masterMapProgress) {
      masterMapProgress = await this.createChildMasterMapProgress({
        childId,
        masterMapId,
        completedZones: [],
        lastUpdatedAt: new Date().toISOString()
      });
    }
    
    // Add zone to completed zones if not already there
    const completedZones = [...masterMapProgress.completedZones];
    if (!completedZones.includes(zoneId)) {
      completedZones.push(zoneId);
      
      // Update the progress
      await this.updateChildMasterMapProgress(masterMapProgress.id, {
        completedZones,
        lastUpdatedAt: new Date().toISOString()
      });
    }
    
    // Add key to child profile if zone grants one
    let addedKey: string | undefined;
    if (zone.rewardKey) {
      await this.addKeyToChildProfile(childId, zone.rewardKey);
      addedKey = zone.rewardKey;
    }
    
    // Find the node in the master map corresponding to this zone
    const nodeId = zone.masterMapNodeId;
    if (nodeId) {
      // Update the node status to completed
      await this.updateMasterMapNodeStatus(masterMapId, nodeId, childId, 'completed');
      
      // Find nodes that should be unlocked next
      const connectedNodes = masterMap.config.paths
        .filter(path => path.from === nodeId)
        .map(path => path.to);
      
      // Set connected nodes as available or keep them locked if they are gates that the child can't unlock
      for (const connectedNodeId of connectedNodes) {
        // Check if the node is a gate
        const node = masterMap.config.nodes.find(n => n.id === connectedNodeId);
        
        if (node?.type === 'gate') {
          const gate = await this.getMasterMapGateByNodeId(masterMapId, connectedNodeId);
          
          if (gate) {
            const canUnlock = await this.checkIfChildCanUnlockGate(childId, gate.id);
            
            // Set the gate to available if the child has the required keys
            if (canUnlock) {
              await this.updateMasterMapNodeStatus(masterMapId, connectedNodeId, childId, 'available');
            }
          }
        } else {
          // For non-gate nodes, set them as available
          await this.updateMasterMapNodeStatus(masterMapId, connectedNodeId, childId, 'available');
        }
      }
    }
    
    // Get all gates that the child can now unlock
    const gates = await this.getMasterMapGatesByMasterMapId(masterMapId);
    const unlockedGates: MasterMapGate[] = [];
    
    for (const gate of gates) {
      const canUnlock = await this.checkIfChildCanUnlockGate(childId, gate.id);
      if (canUnlock) {
        unlockedGates.push(gate);
      }
    }
    
    // Get the updated master map
    const updatedMasterMap = await this.getMasterMap(masterMapId);
    const updatedChildProfile = await this.getChildProfile(childId);
    
    return {
      updatedMasterMap,
      childProfile: updatedChildProfile,
      addedKey,
      unlockedGates
    };
  }
}

export const storage = new MemStorage();
