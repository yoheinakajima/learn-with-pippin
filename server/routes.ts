import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertChildProfileSchema,
  insertAnswerHistorySchema,
  insertLessonCompletionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }
      
      const user = await storage.createUser(result.data);
      return res.status(201).json(user);
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error logging in:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Child profile routes
  app.get("/api/parents/:parentId/children", async (req, res) => {
    try {
      const parentId = Number(req.params.parentId);
      const children = await storage.getChildProfilesByParentId(parentId);
      return res.status(200).json(children);
    } catch (error) {
      console.error("Error fetching children:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/child-profiles", async (req, res) => {
    try {
      const result = insertChildProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      
      const childProfile = await storage.createChildProfile(result.data);
      return res.status(201).json(childProfile);
    } catch (error) {
      console.error("Error creating child profile:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/child-profiles/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const profile = await storage.getChildProfile(id);
      
      if (!profile) {
        return res.status(404).json({ error: "Child profile not found" });
      }
      
      const updatedProfile = await storage.updateChildProfile(id, req.body);
      return res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Error updating child profile:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Item and inventory routes
  app.get("/api/items", async (req, res) => {
    try {
      const items = await storage.getAllItems();
      return res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/child-profiles/:childId/inventory", async (req, res) => {
    try {
      const childId = Number(req.params.childId);
      const inventoryItems = await storage.getInventoryItemsByChildId(childId);
      
      // Fetch complete item details
      const fullItems = await Promise.all(
        inventoryItems.map(async (invItem) => {
          const item = await storage.getItem(invItem.itemId);
          return {
            ...invItem,
            details: item
          };
        })
      );
      
      return res.status(200).json(fullItems);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Map, lessons, and mini-games routes
  app.get("/api/map-zones", async (req, res) => {
    try {
      const zones = await storage.getAllMapZones();
      return res.status(200).json(zones);
    } catch (error) {
      console.error("Error fetching map zones:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/mini-games", async (req, res) => {
    try {
      const games = await storage.getAllMiniGames();
      return res.status(200).json(games);
    } catch (error) {
      console.error("Error fetching mini-games:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/mini-games/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const game = await storage.getMiniGame(id);
      
      if (!game) {
        return res.status(404).json({ error: "Mini-game not found" });
      }
      
      // Include questions for this mini-game
      const questions = await storage.getQuestionsByMiniGameId(id);
      
      return res.status(200).json({
        ...game,
        questions
      });
    } catch (error) {
      console.error("Error fetching mini-game:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Progress tracking routes
  app.post("/api/answers", async (req, res) => {
    try {
      const result = insertAnswerHistorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      
      const answerHistory = await storage.recordAnswer(result.data);
      
      // Update child profile XP and coins if answer is correct
      if (answerHistory.isCorrect) {
        const childProfile = await storage.getChildProfile(answerHistory.childId);
        if (childProfile) {
          // Get the question to determine rewards
          const question = await storage.getQuestion(answerHistory.questionId);
          const xpReward = question ? (question.difficulty * 10) : 10;
          const coinReward = question ? (question.difficulty * 5) : 5;
          
          await storage.updateChildProfile(childProfile.id, {
            xp: childProfile.xp + xpReward,
            coins: childProfile.coins + coinReward
          });
        }
      }
      
      return res.status(201).json(answerHistory);
    } catch (error) {
      console.error("Error recording answer:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/lesson-completions", async (req, res) => {
    try {
      const result = insertLessonCompletionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      
      const completion = await storage.recordLessonCompletion(result.data);
      
      // Update child profile XP and coins
      const childProfile = await storage.getChildProfile(completion.childId);
      const lesson = await storage.getLesson(completion.lessonId);
      
      if (childProfile && lesson) {
        await storage.updateChildProfile(childProfile.id, {
          xp: childProfile.xp + lesson.xpReward,
          coins: childProfile.coins + lesson.coinReward
        });
      }
      
      return res.status(201).json(completion);
    } catch (error) {
      console.error("Error recording lesson completion:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Purchase item route
  app.post("/api/child-profiles/:childId/purchase-item", async (req, res) => {
    try {
      const childId = Number(req.params.childId);
      const { itemId } = req.body;
      
      if (!itemId) {
        return res.status(400).json({ error: "Item ID is required" });
      }
      
      const childProfile = await storage.getChildProfile(childId);
      const item = await storage.getItem(itemId);
      
      if (!childProfile) {
        return res.status(404).json({ error: "Child profile not found" });
      }
      
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      // Check if child has enough coins
      if (childProfile.coins < item.price) {
        return res.status(400).json({ error: "Not enough coins to purchase this item" });
      }
      
      // Add item to inventory
      const inventoryItem = await storage.addItemToInventory({
        childId,
        itemId,
        equipped: false,
        acquiredAt: new Date().toISOString()
      });
      
      // Deduct coins
      await storage.updateChildProfile(childId, {
        coins: childProfile.coins - item.price
      });
      
      return res.status(201).json({
        inventoryItem,
        item,
        remainingCoins: childProfile.coins - item.price
      });
    } catch (error) {
      console.error("Error purchasing item:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Equipment management
  app.put("/api/inventory/:inventoryItemId/equip", async (req, res) => {
    try {
      const inventoryItemId = Number(req.params.inventoryItemId);
      const inventoryItem = await storage.updateInventoryItem(inventoryItemId, { equipped: true });
      
      return res.status(200).json(inventoryItem);
    } catch (error) {
      console.error("Error equipping item:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/inventory/:inventoryItemId/unequip", async (req, res) => {
    try {
      const inventoryItemId = Number(req.params.inventoryItemId);
      const inventoryItem = await storage.updateInventoryItem(inventoryItemId, { equipped: false });
      
      return res.status(200).json(inventoryItem);
    } catch (error) {
      console.error("Error unequipping item:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
