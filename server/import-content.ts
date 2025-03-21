import fs from 'fs';
import path from 'path';
import { storage } from './storage';
import { InsertLesson, InsertMiniGame, InsertQuestion, InsertItem } from '../shared/schema';

/**
 * Helper function to resolve file paths
 */
function resolveFilePath(filePath: string): string {
  // Check if the filePath is absolute or relative
  if (path.isAbsolute(filePath) || filePath.startsWith('./') || filePath.startsWith('../')) {
    return path.resolve(filePath);
  }
  return path.join(process.cwd(), 'data', filePath);
}

async function importLessons(jsonFilePath: string) {
  try {
    // Read the lessons data from JSON file
    const dataPath = resolveFilePath(jsonFilePath);
    
    if (!fs.existsSync(dataPath)) {
      console.error(`File not found: ${dataPath}`);
      return { success: false, error: `File not found: ${dataPath}` };
    }
    
    const fileData = fs.readFileSync(dataPath, 'utf8');
    const lessonsData = JSON.parse(fileData);

    console.log(`Importing ${lessonsData.lessons.length} lessons`);

    // Insert each lesson
    const createdLessons = [];
    for (const lessonData of lessonsData.lessons) {
      const lessonInsert: InsertLesson = {
        title: lessonData.title,
        description: lessonData.description,
        contentType: lessonData.contentType,
        content: lessonData.content,
        difficulty: lessonData.difficulty,
        xpReward: lessonData.xpReward,
        coinReward: lessonData.coinReward,
        prerequisites: lessonData.prerequisites || [],
        tags: lessonData.tags || []
      };

      const createdLesson = await storage.createLesson(lessonInsert);
      console.log(`Lesson created with ID: ${createdLesson.id}`);
      createdLessons.push(createdLesson);
    }

    return { success: true, lessonIds: createdLessons.map(l => l.id) };
  } catch (error) {
    console.error('Error importing lessons:', error);
    return { success: false, error };
  }
}

async function importMiniGames(jsonFilePath: string) {
  try {
    // Read the mini-games data from JSON file
    const dataPath = resolveFilePath(jsonFilePath);
    
    if (!fs.existsSync(dataPath)) {
      console.error(`File not found: ${dataPath}`);
      return { success: false, error: `File not found: ${dataPath}` };
    }
    
    const fileData = fs.readFileSync(dataPath, 'utf8');
    const gamesData = JSON.parse(fileData);

    console.log(`Importing ${gamesData.miniGames.length} mini-games`);

    // Insert each mini-game and its questions
    const createdGames = [];
    for (const gameData of gamesData.miniGames) {
      // First create the mini-game
      const gameInsert: InsertMiniGame = {
        name: gameData.name,
        description: gameData.description,
        type: gameData.type,
        difficulty: gameData.difficulty,
        xpReward: gameData.xpReward,
        coinReward: gameData.coinReward
      };

      const createdGame = await storage.createMiniGame(gameInsert);
      console.log(`Mini-game created with ID: ${createdGame.id}`);
      
      // Then create the questions for this mini-game
      if (gameData.questions && gameData.questions.length > 0) {
        for (const questionData of gameData.questions) {
          const questionInsert: InsertQuestion = {
            text: questionData.text,
            choices: questionData.choices,
            correctAnswerId: questionData.correctAnswerId,
            hint: questionData.hint,
            difficulty: questionData.difficulty,
            tags: questionData.tags || [],
            miniGameId: createdGame.id
          };

          const createdQuestion = await storage.createQuestion(questionInsert);
          console.log(`Question created with ID: ${createdQuestion.id} for mini-game ${createdGame.id}`);
        }
      }

      createdGames.push(createdGame);
    }

    return { success: true, gameIds: createdGames.map(g => g.id) };
  } catch (error) {
    console.error('Error importing mini-games:', error);
    return { success: false, error };
  }
}

async function importItems(jsonFilePath: string) {
  try {
    // Read the items data from JSON file
    const dataPath = resolveFilePath(jsonFilePath);
    
    if (!fs.existsSync(dataPath)) {
      console.error(`File not found: ${dataPath}`);
      return { success: false, error: `File not found: ${dataPath}` };
    }
    
    const fileData = fs.readFileSync(dataPath, 'utf8');
    const itemsData = JSON.parse(fileData);

    console.log(`Importing ${itemsData.items.length} items`);

    // Insert each item
    const createdItems = [];
    for (const itemData of itemsData.items) {
      const itemInsert: InsertItem = {
        name: itemData.name,
        description: itemData.description,
        rarity: itemData.rarity,
        price: itemData.price,
        statBoosts: itemData.statBoosts,
        imageUrl: itemData.imageUrl || '',
        requirements: itemData.requirements || {}
      };

      const createdItem = await storage.createItem(itemInsert);
      console.log(`Item created with ID: ${createdItem.id}`);
      createdItems.push(createdItem);
    }

    return { success: true, itemIds: createdItems.map(i => i.id) };
  } catch (error) {
    console.error('Error importing items:', error);
    return { success: false, error };
  }
}

// If this file is run directly with arguments, execute the import
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: tsx import-content.ts <type> <json-file-name>');
    console.error('Types: lessons, mini-games, items');
    process.exit(1);
  }
  
  const [type, jsonFileName] = args;
  
  let importPromise;
  switch (type) {
    case 'lessons':
      importPromise = importLessons(jsonFileName);
      break;
    case 'mini-games':
      importPromise = importMiniGames(jsonFileName);
      break;
    case 'items':
      importPromise = importItems(jsonFileName);
      break;
    default:
      console.error('Invalid content type. Use: lessons, mini-games, or items');
      process.exit(1);
  }
  
  importPromise
    .then(result => {
      if (result.success) {
        console.log('Import completed successfully');
        process.exit(0);
      } else {
        console.error('Import failed:', result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unhandled error during import:', err);
      process.exit(1);
    });
}

export { importLessons, importMiniGames, importItems };