import fs from 'fs';
import path from 'path';
import { storage } from './storage';
import { InsertMapZone } from '../shared/schema';

async function importMapZone(jsonFilePath: string, masterMapId: number, masterMapNodeId: string) {
  try {
    // Read the map zone data from JSON file
    const dataPath = path.join(process.cwd(), 'data', jsonFilePath);
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

// If this file is run directly with arguments, execute the import
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 3) {
    console.error('Usage: tsx import-map-zone.ts <json-file-name> <master-map-id> <master-map-node-id>');
    process.exit(1);
  }
  
  const [jsonFileName, masterMapIdStr, masterMapNodeId] = args;
  const masterMapId = parseInt(masterMapIdStr, 10);
  
  importMapZone(jsonFileName, masterMapId, masterMapNodeId)
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

export { importMapZone };