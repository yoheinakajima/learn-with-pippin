import fs from 'fs';
import path from 'path';
import { storage } from './storage';
import { InsertMasterMap, InsertMasterMapGate } from '../shared/schema';

async function importMasterMap(filePath?: string) {
  try {
    // Read the master map data from JSON file
    const dataPath = filePath 
      ? path.resolve(filePath)
      : path.join(process.cwd(), 'data', 'master-map-data.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error(`File not found: ${dataPath}`);
      return { success: false, error: `File not found: ${dataPath}` };
    }
    
    const fileData = fs.readFileSync(dataPath, 'utf8');
    const masterMapData = JSON.parse(fileData);

    console.log('Importing master map:', masterMapData.name);

    // Create the master map
    const masterMapInsert: InsertMasterMap = {
      name: masterMapData.name,
      description: masterMapData.description,
      config: masterMapData.config,
      unlockRequirements: masterMapData.unlockRequirements || {},
      currentActive: true // Make this the active master map
    };

    // Insert the master map
    const createdMap = await storage.createMasterMap(masterMapInsert);
    console.log(`Master map created with ID: ${createdMap.id}`);

    // Set as active map
    await storage.setActiveMasterMap(createdMap.id);
    console.log(`Master map ${createdMap.id} set as active`);

    // Extract and create gates
    const gates = masterMapData.config.nodes
      .filter((node: any) => node.type === 'gate')
      .map((node: any) => {
        const gateInsert: InsertMasterMapGate = {
          masterMapId: createdMap.id,
          nodeId: node.id,
          requiredKeys: node.requiredKeys || [],
          name: node.name || `Gate ${node.id}`,
          description: node.description || `A mysterious gate`,
          unlockMessage: node.unlockMessage || `You've unlocked the gate with your keys!`
        };
        return gateInsert;
      });

    // Insert all gates
    for (const gate of gates) {
      const createdGate = await storage.createMasterMapGate(gate);
      console.log(`Gate created for node ${gate.nodeId} with ID: ${createdGate.id}`);
    }

    console.log('Master map import completed successfully!');
    return { success: true, mapId: createdMap.id };
  } catch (error) {
    console.error('Error importing master map:', error);
    return { success: false, error };
  }
}

// Direct execution is no longer supported - use the API endpoints instead

export { importMasterMap };