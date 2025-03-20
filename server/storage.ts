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
  MiniGame, InsertMiniGame,
  MapNode, MapPath, MapConfig, MapDecoration
} from "@shared/schema";

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
  updateNodeStatus(zoneId: number, nodeId: string, status: 'locked' | 'available' | 'current' | 'completed'): Promise<MapZone>;
  updateNodeStatuses(zoneId: number, updates: { nodeId: string, status: 'locked' | 'available' | 'current' | 'completed' }[]): Promise<MapZone>;
  completeQuest(zoneId: number, nodeId: string, childId: number, questType: string, questId: number): Promise<MapZone>;
  
  // Mini-games
  getMiniGame(id: number): Promise<MiniGame | undefined>;
  getAllMiniGames(): Promise<MiniGame[]>;
  createMiniGame(miniGame: InsertMiniGame): Promise<MiniGame>;
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
      avatarColor: "primary"
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
      avatarColor: "accent"
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
      unlockRequirements: null
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
  
  async updateNodeStatus(zoneId: number, nodeId: string, status: 'locked' | 'available' | 'current' | 'completed'): Promise<MapZone> {
    const zone = await this.getMapZone(zoneId);
    if (!zone) {
      throw new Error(`Map zone with id ${zoneId} not found`);
    }
    
    // Create a deep copy of the zone to avoid modifying the original object
    const updatedZone = { ...zone };
    const updatedConfig = { ...zone.config };
    updatedZone.config = updatedConfig;
    
    // Deep copy the nodes array
    updatedConfig.nodes = [...zone.config.nodes];
    
    // Find the node to update
    const nodeIndex = updatedConfig.nodes.findIndex(node => node.id === nodeId);
    if (nodeIndex === -1) {
      throw new Error(`Node with id ${nodeId} not found in zone ${zoneId}`);
    }
    
    // Update the node status
    updatedConfig.nodes[nodeIndex] = {
      ...updatedConfig.nodes[nodeIndex],
      status
    };
    
    // Save the updated zone
    this.mapZones.set(zoneId, updatedZone);
    return updatedZone;
  }
  
  async updateNodeStatuses(zoneId: number, updates: { nodeId: string, status: 'locked' | 'available' | 'current' | 'completed' }[]): Promise<MapZone> {
    const zone = await this.getMapZone(zoneId);
    if (!zone) {
      throw new Error(`Map zone with id ${zoneId} not found`);
    }
    
    // Create a deep copy of the zone to avoid modifying the original object
    const updatedZone = { ...zone };
    const updatedConfig = { ...zone.config };
    updatedZone.config = updatedConfig;
    
    // Deep copy the nodes array
    updatedConfig.nodes = [...zone.config.nodes];
    
    // Apply all the updates
    updates.forEach(update => {
      const nodeIndex = updatedConfig.nodes.findIndex(node => node.id === update.nodeId);
      if (nodeIndex !== -1) {
        updatedConfig.nodes[nodeIndex] = {
          ...updatedConfig.nodes[nodeIndex],
          status: update.status
        };
      }
    });
    
    // Save the updated zone
    this.mapZones.set(zoneId, updatedZone);
    return updatedZone;
  }
  
  async completeQuest(zoneId: number, nodeId: string, childId: number, questType: string, questId: number): Promise<MapZone> {
    const zone = await this.getMapZone(zoneId);
    if (!zone) {
      throw new Error(`Map zone with id ${zoneId} not found`);
    }
    
    // Create a deep copy of the zone to avoid modifying the original object
    const updatedZone = { ...zone };
    const updatedConfig = { ...zone.config };
    updatedZone.config = updatedConfig;
    
    // Deep copy the nodes array and paths array
    updatedConfig.nodes = [...zone.config.nodes];
    updatedConfig.paths = [...zone.config.paths];
    
    // 1. Find the node that was completed
    const nodeIndex = updatedConfig.nodes.findIndex(node => node.id === nodeId);
    if (nodeIndex === -1) {
      throw new Error(`Node with id ${nodeId} not found in zone ${zoneId}`);
    }
    
    // 2. Mark the completed node as 'completed'
    updatedConfig.nodes[nodeIndex] = {
      ...updatedConfig.nodes[nodeIndex],
      status: 'completed'
    };
    
    // 3. Find nodes that should be unlocked (nodes connected to the completed node)
    const nodesToUnlock: string[] = [];
    updatedConfig.paths.forEach(path => {
      if (path.from === nodeId) {
        // This is a path leading from the completed node
        const targetNode = updatedConfig.nodes.find(node => node.id === path.to);
        if (targetNode && targetNode.status === 'locked') {
          nodesToUnlock.push(targetNode.id);
        }
      }
    });
    
    // 4. Update status of nodes to unlock
    for (const nodeToUnlockId of nodesToUnlock) {
      const nodeToUnlockIndex = updatedConfig.nodes.findIndex(node => node.id === nodeToUnlockId);
      if (nodeToUnlockIndex !== -1) {
        // Set first unlocked node as 'current', others as 'available'
        const isFirstUnlocked = !updatedConfig.nodes.some(node => 
          node.status === 'current' || (node.status === 'available' && node.id !== nodeToUnlockId)
        );
        updatedConfig.nodes[nodeToUnlockIndex] = {
          ...updatedConfig.nodes[nodeToUnlockIndex],
          status: isFirstUnlocked ? 'current' : 'available'
        };
      }
    }
    
    // 5. If there's no 'current' node, set the first 'available' node as 'current'
    if (!updatedConfig.nodes.some(node => node.status === 'current')) {
      const firstAvailableIndex = updatedConfig.nodes.findIndex(node => node.status === 'available');
      if (firstAvailableIndex !== -1) {
        updatedConfig.nodes[firstAvailableIndex] = {
          ...updatedConfig.nodes[firstAvailableIndex],
          status: 'current'
        };
      }
    }
    
    // 6. Update child's XP and coins based on quest type if needed
    // (this would typically be done in a separate function for a real implementation)
    
    // 7. Save the updated zone
    this.mapZones.set(zoneId, updatedZone);
    return updatedZone;
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
}

export const storage = new MemStorage();
