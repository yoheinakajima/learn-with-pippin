import fs from 'fs';
import path from 'path';
import { storage } from './storage';
import { InsertMapZone } from '../shared/schema';

async function importMapZone(jsonFilePath: string, masterMapId?: number, masterMapNodeId?: string) {
  try {
    // Read the map zone data from JSON file
    let dataPath;
    
    // Check if the filePath is absolute or relative
    if (path.isAbsolute(jsonFilePath) || jsonFilePath.startsWith('./') || jsonFilePath.startsWith('../')) {
      dataPath = path.resolve(jsonFilePath);
    } else {
      dataPath = path.join(process.cwd(), 'data', jsonFilePath);
    }
    
    if (!fs.existsSync(dataPath)) {
      console.error(`File not found: ${dataPath}`);
      return { success: false, error: `File not found: ${dataPath}` };
    }
    
    const fileData = fs.readFileSync(dataPath, 'utf8');
    const zoneData = JSON.parse(fileData);

    console.log(`Importing map zone: ${zoneData.name}`);

    // Create the map zone with connection to master map
    const zoneInsert: InsertMapZone = {
      name: zoneData.name,
      description: zoneData.description,
      config: zoneData.config,
      unlockRequirements: zoneData.unlockRequirements || {},
      isMasterMap: false,
      masterMapNodeId: masterMapNodeId,
      masterMapId: masterMapId,
      rewardKey: zoneData.rewardKey || null
    };

    // Insert the map zone
    const createdZone = await storage.createMapZone(zoneInsert);
    console.log(`Map zone created with ID: ${createdZone.id}`);

    return { success: true, zoneId: createdZone.id };
  } catch (error) {
    console.error('Error importing map zone:', error);
    return { success: false, error };
  }
}

// Direct execution is no longer supported - use the API endpoints instead

export { importMapZone };