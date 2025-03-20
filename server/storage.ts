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
  MiniGame, InsertMiniGame
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
    
    // Initialize a child profile for the test parent
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
    
    // Initialize mini-games
    this.createMiniGame({
      name: "Forest Fraction Challenge",
      description: "Test your fraction knowledge in the magical forest!",
      type: "multiple_choice",
      difficulty: 2,
      xpReward: 25,
      coinReward: 10,
      questionIds: [1]
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
    const user: User = { ...insertUser, id };
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
    const childProfile: ChildProfile = { ...profile, id };
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
    const newItem: Item = { ...item, id };
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
    const newInventoryItem: InventoryItem = { ...inventoryItem, id };
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
    const newLesson: Lesson = { ...lesson, id };
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
    const newQuestion: Question = { ...question, id };
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
    const newZone: MapZone = { ...mapZone, id };
    this.mapZones.set(id, newZone);
    return newZone;
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
    const newGame: MiniGame = { ...miniGame, id };
    this.miniGames.set(id, newGame);
    return newGame;
  }
}

export const storage = new MemStorage();
