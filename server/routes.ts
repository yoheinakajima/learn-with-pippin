import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertChildProfileSchema,
  insertAnswerHistorySchema,
  insertLessonCompletionSchema,
  insertQuestionSchema,
  insertItemSchema,
  insertLessonSchema,
  insertMapZoneSchema
} from "@shared/schema";
import * as openaiService from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user", async (req, res) => {
    try {
      // This is a simplified implementation - in a real app with authentication
      // you would use req.user or a session token to determine the current user
      
      // For our prototype, we'll use a query parameter to identify the user
      const userId = Number(req.query.userId) || null;
      
      if (userId) {
        const user = await storage.getUser(userId);
        if (user) {
          return res.status(200).json(user);
        }
      }
      
      // Return 401 if no userId is provided or user not found
      return res.status(401).json({ error: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
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
  
  app.get("/api/map-zones/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const zone = await storage.getMapZone(id);
      
      if (!zone) {
        return res.status(404).json({ error: "Map zone not found" });
      }
      
      return res.status(200).json(zone);
    } catch (error) {
      console.error("Error fetching map zone:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.patch("/api/map-zones/:zoneId/nodes/:nodeId/status", async (req, res) => {
    try {
      const zoneId = Number(req.params.zoneId);
      const nodeId = req.params.nodeId;
      const { status } = req.body;
      
      // Validate status
      if (!status || !['locked', 'available', 'current', 'completed'].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      const updatedZone = await storage.updateNodeStatus(zoneId, nodeId, status);
      return res.status(200).json(updatedZone);
    } catch (error) {
      console.error("Error updating node status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/game-progress/complete-quest", async (req, res) => {
    try {
      const { zoneId, nodeId, childId, questType, questId } = req.body;
      
      // Validate required parameters
      if (!zoneId || !nodeId || !childId || !questType || !questId) {
        return res.status(400).json({ 
          error: "Missing required parameters. Required: zoneId, nodeId, childId, questType, questId"
        });
      }
      
      // Validate questType
      if (!['lesson', 'mini-game', 'mini-task', 'boss'].includes(questType)) {
        return res.status(400).json({ error: "Invalid questType" });
      }
      
      // Update zone with completed quest
      const updatedZone = await storage.completeQuest(
        Number(zoneId), 
        nodeId, 
        Number(childId), 
        questType, 
        Number(questId)
      );
      
      // Check if child profile exists
      const childProfile = await storage.getChildProfile(Number(childId));
      if (!childProfile) {
        return res.status(404).json({ error: "Child profile not found" });
      }
      
      // Award XP and coins based on quest type
      let xpAwarded = 0;
      let coinsAwarded = 0;
      
      // Different rewards for different quest types
      switch (questType) {
        case 'mini-game':
          const miniGame = await storage.getMiniGame(Number(questId));
          if (miniGame) {
            xpAwarded = miniGame.xpReward;
            coinsAwarded = miniGame.coinReward;
          }
          break;
        case 'lesson':
          const lesson = await storage.getLesson(Number(questId));
          if (lesson) {
            xpAwarded = lesson.xpReward;
            coinsAwarded = lesson.coinReward;
          }
          break;
        case 'mini-task':
          xpAwarded = 15;
          coinsAwarded = 5;
          break;
        case 'boss':
          xpAwarded = 100;
          coinsAwarded = 50;
          break;
      }
      
      // Update child profile with awarded XP and coins (if any)
      if (xpAwarded > 0 || coinsAwarded > 0) {
        const updatedChildProfile = await storage.updateChildProfile(Number(childId), {
          xp: childProfile.xp + xpAwarded,
          coins: childProfile.coins + coinsAwarded
        });
        
        // Check if level up occurred
        const oldLevel = childProfile.level;
        const newLevel = Math.floor(1 + Math.sqrt(updatedChildProfile.xp / 100));
        
        if (newLevel > oldLevel) {
          // Level up!
          await storage.updateChildProfile(Number(childId), {
            level: newLevel
          });
        }
        
        return res.status(200).json({
          zone: updatedZone,
          childProfile: await storage.getChildProfile(Number(childId)),
          rewards: {
            xp: xpAwarded,
            coins: coinsAwarded,
            levelUp: newLevel > oldLevel
          }
        });
      }
      
      return res.status(200).json({
        zone: updatedZone
      });
    } catch (error) {
      console.error("Error completing quest:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Handle map completion and unlocking the next map
  app.post("/api/game-progress/complete-map", async (req, res) => {
    try {
      const { childId, zoneId } = req.body;
      
      // Validate inputs
      if (!childId || !zoneId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Get the zone
      const currentZone = await storage.getMapZone(Number(zoneId));
      if (!currentZone) {
        return res.status(404).json({ error: "Map zone not found" });
      }
      
      // Get the child profile
      const childProfile = await storage.getChildProfile(Number(childId));
      if (!childProfile) {
        return res.status(404).json({ error: "Child profile not found" });
      }
      
      // Check if zone is actually completed
      const isCompleted = currentZone.config.nodes.every(node => node.status === 'completed');
      if (!isCompleted) {
        return res.status(400).json({ 
          error: "Map zone is not fully completed",
          isCompleted: false
        });
      }
      
      // Award completion bonus (scaled by zone difficulty)
      const zoneDifficulty = currentZone.id; // Use zone ID as a difficulty indicator (higher ID = harder zone)
      const baseXpReward = 50;
      const baseCoinReward = 25;
      
      // Scale rewards by zone difficulty (each zone gives better rewards)
      const xpAwarded = baseXpReward * (1 + 0.25 * zoneDifficulty);
      const coinsAwarded = baseCoinReward * (1 + 0.2 * zoneDifficulty);
      
      // Give a time bonus if the map was completed quickly
      // (this is a placeholder; in a real app we'd track when the map was first started)
      const timeBonus = 20;
      
      // Calculate total rewards
      const totalXp = Math.round(xpAwarded + timeBonus);
      const totalCoins = Math.round(coinsAwarded + timeBonus/2);
      
      // Generate a special item as a reward
      // Get all available items
      const allItems = await storage.getAllItems();
      
      // Find items appropriate for the child's level
      const suitableItems = allItems.filter(item => 
        !item.requirements?.level || item.requirements.level <= childProfile.level
      );
      
      // Select a random item as a reward (prefer rarer items for higher zones)
      let specialItem = null;
      const rarityScores = {
        'Legendary': 5,
        'Epic': 4,
        'Rare': 3,
        'Uncommon': 2,
        'Common': 1
      };
      
      // Weighted selection based on zone difficulty
      if (suitableItems.length > 0) {
        // For higher zones, increase chances of better items
        const minRarityScore = Math.min(zoneDifficulty, 3);
        const itemCandidates = suitableItems.filter(
          item => rarityScores[item.rarity as keyof typeof rarityScores] >= minRarityScore
        );
        
        if (itemCandidates.length > 0) {
          // Select a random item from candidates
          specialItem = itemCandidates[Math.floor(Math.random() * itemCandidates.length)];
          
          // Add the item to child's inventory
          if (specialItem) {
            await storage.addItemToInventory({
              childId: Number(childId),
              itemId: specialItem.id,
              equipped: false,
              acquiredAt: new Date().toISOString()
            });
          }
        }
      }
      
      // Update child profile with awarded XP and coins
      const updatedChildProfile = await storage.updateChildProfile(Number(childId), {
        xp: childProfile.xp + totalXp,
        coins: childProfile.coins + totalCoins
      });
      
      // Check if level up occurred
      const oldLevel = childProfile.level;
      const newLevel = Math.floor(1 + Math.sqrt(updatedChildProfile.xp / 100));
      
      if (newLevel > oldLevel) {
        // Level up!
        await storage.updateChildProfile(Number(childId), {
          level: newLevel
        });
      }
      
      // Get all zones to find next available zone
      const allZones = await storage.getAllMapZones();
      
      // Find the next zone to unlock
      let nextZone = null;
      
      // Look for zones with level requirements that the child now meets
      for (const zone of allZones) {
        // Skip current zone and already completed zones
        if (zone.id === Number(zoneId) || zone.config.nodes.every(node => node.status === 'completed')) {
          continue;
        }
        
        // Check if zone is locked but requirements are met
        if (zone.unlockRequirements) {
          const levelMet = !zone.unlockRequirements.level || updatedChildProfile.level >= zone.unlockRequirements.level;
          
          // Check for completed zones prerequisite
          const completedZonesMet = !zone.unlockRequirements.completedZones || 
            zone.unlockRequirements.completedZones.every(prereqZoneId => {
              // Check if the required zone is completed
              const prereqZone = allZones.find(z => z.id === prereqZoneId);
              return prereqZone && prereqZone.config.nodes.every(node => node.status === 'completed');
            });
          
          if (levelMet && completedZonesMet) {
            // This zone can be unlocked
            nextZone = zone;
            
            // Initialize the first node as 'current' and unlock it
            if (nextZone.config.nodes.length > 0) {
              // Find the starting node (usually the one with no incoming paths)
              const startingNodeIndex = nextZone.config.nodes.findIndex(node => {
                // No incoming paths means it's a starting node
                return !nextZone.config.paths.some(path => path.to === node.id);
              });
              
              // If no clear starting node, use the first one
              const nodeIndexToUnlock = startingNodeIndex >= 0 ? startingNodeIndex : 0;
              const nodeIdToUnlock = nextZone.config.nodes[nodeIndexToUnlock].id;
              
              // Update the node status to 'current'
              await storage.updateNodeStatus(nextZone.id, nodeIdToUnlock, 'current');
              
              // Refresh the next zone data
              nextZone = await storage.getMapZone(nextZone.id);
            }
            
            break;
          }
        }
      }
      
      // Return the results with detailed rewards
      return res.status(200).json({
        isCompleted: true,
        nextZone: nextZone,
        rewards: {
          xp: totalXp,
          coins: totalCoins,
          levelUp: newLevel > oldLevel,
          newLevel: newLevel > oldLevel ? newLevel : undefined,
          specialItem: specialItem,
          timeBonus: timeBonus,
          unlockNextZone: !!nextZone
        }
      });
      
    } catch (error) {
      console.error("Error completing map:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/lessons", async (req, res) => {
    try {
      const lessons = await storage.getAllLessons();
      return res.status(200).json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const lesson = await storage.getLesson(id);
      
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      
      return res.status(200).json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
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

  // =========== OpenAI Integration Routes ===========
  
  // Generate personalized lesson
  app.post("/api/ai/generate-lesson", async (req, res) => {
    try {
      const { subject, childAge, difficulty, interests, title } = req.body;
      
      if (!subject || !childAge || !difficulty) {
        return res.status(400).json({ error: "Subject, childAge, and difficulty are required" });
      }
      
      const lesson = await openaiService.generateLesson({
        subject,
        childAge,
        difficulty,
        interests,
        title
      });
      
      // Optionally save the generated lesson to the database
      const lessonData = {
        title: lesson.title,
        description: `Auto-generated lesson about ${subject}`,
        contentType: 'reading',
        content: JSON.stringify(lesson),
        difficulty: difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3,
        xpReward: difficulty === 'beginner' ? 20 : difficulty === 'intermediate' ? 40 : 60,
        coinReward: difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 20 : 30,
        tags: [subject, ...interests || []]
      };
      
      const result = insertLessonSchema.safeParse(lessonData);
      let savedLesson = null;
      
      if (result.success) {
        savedLesson = await storage.createLesson(result.data);
      }
      
      return res.status(200).json({ 
        lesson, 
        savedLessonId: savedLesson ? savedLesson.id : null 
      });
    } catch (error) {
      console.error("Error generating lesson:", error);
      return res.status(500).json({ error: "Failed to generate lesson" });
    }
  });
  
  // Generate quiz questions
  app.post("/api/ai/generate-questions", async (req, res) => {
    try {
      const { topic, childAge, difficulty, count = 3, previousQuestionsTopics } = req.body;
      
      if (!topic || !childAge || !difficulty) {
        return res.status(400).json({ error: "Topic, childAge, and difficulty are required" });
      }
      
      const questions = await openaiService.generateQuestions({
        topic,
        childAge,
        difficulty,
        count,
        previousQuestionsTopics
      });
      
      // Optionally save the generated questions to the database
      const savedQuestions = [];
      
      for (const question of questions) {
        const questionData = {
          text: question.text,
          choices: question.choices,
          correctAnswerId: question.correctAnswerId,
          hint: question.hint,
          difficulty: question.difficulty,
          tags: question.tags
        };
        
        const result = insertQuestionSchema.safeParse(questionData);
        
        if (result.success) {
          const savedQuestion = await storage.createQuestion(result.data);
          savedQuestions.push(savedQuestion);
        }
      }
      
      return res.status(200).json({ 
        questions, 
        savedQuestionIds: savedQuestions.map(q => q.id) 
      });
    } catch (error) {
      console.error("Error generating questions:", error);
      return res.status(500).json({ error: "Failed to generate questions" });
    }
  });
  
  // Generate magical item
  app.post("/api/ai/generate-magical-item", async (req, res) => {
    try {
      const { itemType, rarity, primaryStat, theme } = req.body;
      
      if (!itemType || !rarity || !primaryStat) {
        return res.status(400).json({ error: "ItemType, rarity, and primaryStat are required" });
      }
      
      const item = await openaiService.generateMagicalItem({
        itemType,
        rarity,
        primaryStat,
        theme
      });
      
      // Optionally save the generated item to the database
      const itemData = {
        name: item.name,
        description: item.description,
        rarity: item.rarity,
        price: item.price,
        statBoosts: item.statBoosts,
        imageUrl: null, // Would need to use an image generation service
        requirements: null
      };
      
      const result = insertItemSchema.safeParse(itemData);
      let savedItem = null;
      
      if (result.success) {
        savedItem = await storage.createItem(result.data);
      }
      
      return res.status(200).json({ 
        item, 
        savedItemId: savedItem ? savedItem.id : null 
      });
    } catch (error) {
      console.error("Error generating magical item:", error);
      return res.status(500).json({ error: "Failed to generate magical item" });
    }
  });
  
  // Generate map zone
  app.post("/api/ai/generate-map-zone", async (req, res) => {
    try {
      const { zoneName, educationalTheme, previousZones } = req.body;
      
      if (!zoneName || !educationalTheme) {
        return res.status(400).json({ error: "ZoneName and educationalTheme are required" });
      }
      
      const mapZone = await openaiService.generateMapZone({
        zoneName,
        educationalTheme,
        previousZones
      });
      
      // Optionally save to database with placeholder config
      // A real implementation would need to convert the suggested nodes to proper map nodes
      const placeholderConfig = {
        background: "default_background.png",
        nodes: [
          {
            id: "node1",
            x: 100,
            y: 100,
            status: 'locked',
            type: 'lesson'
          },
          {
            id: "node2",
            x: 300,
            y: 200,
            status: 'locked',
            type: 'mini-game'
          }
        ],
        paths: [
          {
            from: "node1",
            to: "node2"
          }
        ],
        decorations: []
      };
      
      const mapZoneData = {
        name: mapZone.name,
        description: mapZone.description,
        config: placeholderConfig,
        unlockRequirements: null
      };
      
      const result = insertMapZoneSchema.safeParse(mapZoneData);
      let savedMapZone = null;
      
      if (result.success) {
        savedMapZone = await storage.createMapZone(result.data);
      }
      
      return res.status(200).json({ 
        mapZone, 
        savedMapZoneId: savedMapZone ? savedMapZone.id : null 
      });
    } catch (error) {
      console.error("Error generating map zone:", error);
      return res.status(500).json({ error: "Failed to generate map zone" });
    }
  });
  
  // Generate personalized feedback
  app.post("/api/ai/generate-feedback", async (req, res) => {
    try {
      const { childName, childAge, performance, subject, specificAreas } = req.body;
      
      if (!childName || !childAge || !performance || !subject) {
        return res.status(400).json({ error: "ChildName, childAge, performance, and subject are required" });
      }
      
      const feedback = await openaiService.generateFeedback({
        childName,
        childAge,
        performance,
        subject,
        specificAreas
      });
      
      return res.status(200).json(feedback);
    } catch (error) {
      console.error("Error generating feedback:", error);
      return res.status(500).json({ error: "Failed to generate feedback" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
