import { MapZone, MapNode, LessonCompletion, ChildProfile } from "@/lib/types";
import { mapService } from './apiService';

/**
 * Service for handling game progression and map node statuses
 */
export const progressService = {
  /**
   * Check if a map zone is fully completed
   * A map is completed when all nodes are in 'completed' status
   */
  isMapCompleted: (zone: MapZone): boolean => {
    return zone.config.nodes.every(node => node.status === 'completed');
  },
  
  /**
   * Find the next uncompleted or locked map zone
   * This helps determine which map to unlock next
   */
  findNextAvailableMapZone: (zones: MapZone[], childProfile: ChildProfile): MapZone | null => {
    // First look for zones with 'locked' status but meet requirements
    for (const zone of zones) {
      // Skip completed zones
      if (progressService.isMapCompleted(zone)) continue;
      
      // Check if zone is locked but requirements are met
      if (zone.unlockRequirements) {
        const levelMet = !zone.unlockRequirements.level || childProfile.level >= zone.unlockRequirements.level;
        
        // Check for completed zones prerequisite
        const completedZonesMet = !zone.unlockRequirements.completedZones || 
          zone.unlockRequirements.completedZones.every(zoneId => {
            const prereqZone = zones.find(z => z.id === zoneId);
            return prereqZone && progressService.isMapCompleted(prereqZone);
          });
          
        // Check for specific items
        const itemsMet = !zone.unlockRequirements.items || 
          zone.unlockRequirements.items.every(itemId => {
            // This would require checking inventory items
            // For now, we'll assume it's true as we build out this feature
            return true;
          });
        
        if (levelMet && completedZonesMet && itemsMet) {
          return zone;
        }
      } else {
        // If no requirements, this is available
        return zone;
      }
    }
    
    return null;
  },
  /**
   * Update a node status based on completion of a quest
   */
  updateNodeStatus: async (
    zoneId: number, 
    nodeId: string, 
    childId: number,
    newStatus: 'locked' | 'available' | 'current' | 'completed'
  ): Promise<MapZone> => {
    return await mapService.updateNodeStatus(zoneId, nodeId, childId, newStatus);
  },
  
  /**
   * Mark a quest as completed and update node statuses accordingly
   */
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
    return await mapService.completeQuest(zoneId, nodeId, childId, questType, questId);
  },
  
  /**
   * Get the next available node after completing a quest
   */
  getNextNodeId: (zone: MapZone, currentNodeId: string): string | null => {
    // Find the current node
    const currentNode = zone.config.nodes.find(n => n.id === currentNodeId);
    if (!currentNode) return null;
    
    // Find connected paths from the current node
    const outgoingPaths = zone.config.paths.filter(p => p.from === currentNodeId);
    if (outgoingPaths.length === 0) return null;
    
    // Find the first available locked node that's connected
    for (const path of outgoingPaths) {
      const targetNode = zone.config.nodes.find(n => n.id === path.to);
      if (targetNode && targetNode.status === 'locked') {
        return targetNode.id;
      }
    }
    
    return null;
  },
  
  /**
   * Check if a node should be unlocked
   */
  shouldUnlockNode: (zone: MapZone, nodeId: string): boolean => {
    const node = zone.config.nodes.find(n => n.id === nodeId);
    if (!node || node.status !== 'locked') return false;
    
    // Check if all prerequisite nodes are completed
    const incomingPaths = zone.config.paths.filter(p => p.to === nodeId);
    
    if (incomingPaths.length === 0) return false; // No incoming paths
    
    // Check if at least one of the source nodes is completed
    return incomingPaths.some(path => {
      const sourceNode = zone.config.nodes.find(n => n.id === path.from);
      return sourceNode && sourceNode.status === 'completed';
    });
  },
  
  /**
   * Find nodes that should be unlocked after a node is completed
   */
  findNodesToUnlock: (zone: MapZone, completedNodeId: string): string[] => {
    const nodesToUnlock: string[] = [];
    
    // Find all paths leading from the completed node
    const outgoingPaths = zone.config.paths.filter(p => p.from === completedNodeId);
    
    outgoingPaths.forEach(path => {
      const targetNode = zone.config.nodes.find(n => n.id === path.to);
      if (targetNode && targetNode.status === 'locked') {
        // For this node, check if all its other prerequisites are also completed
        const otherIncomingPaths = zone.config.paths.filter(
          p => p.to === targetNode.id && p.from !== completedNodeId
        );
        
        if (otherIncomingPaths.length === 0) {
          // No other prerequisites, unlock it
          nodesToUnlock.push(targetNode.id);
        } else {
          // Check if all other prerequisites are completed
          const allPrereqsMet = otherIncomingPaths.every(path => {
            const sourceNode = zone.config.nodes.find(n => n.id === path.from);
            return sourceNode && sourceNode.status === 'completed';
          });
          
          if (allPrereqsMet) {
            nodesToUnlock.push(targetNode.id);
          }
        }
      }
    });
    
    return nodesToUnlock;
  },
  
  /**
   * Find a suitable mini-game or lesson node for the player
   * This can be used to determine what lessons/games are appropriate for the current position
   */
  findCurrentQuestNode: async (childId: number): Promise<{
    node: MapNode | null, 
    zoneId: number | null,
    questType: 'lesson' | 'mini-game' | 'mini-task' | 'boss' | null
  }> => {
    // Get all map zones
    const zones = await mapService.getMapZones();
    
    for (const zone of zones) {
      // Find the current node in the zone
      const currentNode = zone.config.nodes.find(n => n.status === 'current');
      
      if (currentNode) {
        return {
          node: currentNode,
          zoneId: zone.id,
          questType: currentNode.type as 'lesson' | 'mini-game' | 'mini-task' | 'boss'
        };
      }
      
      // If no current node, find first available node
      const availableNode = zone.config.nodes.find(n => n.status === 'available');
      
      if (availableNode) {
        return {
          node: availableNode,
          zoneId: zone.id,
          questType: availableNode.type as 'lesson' | 'mini-game' | 'mini-task' | 'boss'
        };
      }
    }
    
    return { node: null, zoneId: null, questType: null };
  },
  
  /**
   * Update node statuses after completing a node
   * This is a client-side simulation that will update the local state
   * before the server responds
   */
  simulateNodeStatusUpdates: (zone: MapZone, completedNodeId: string): MapZone => {
    // Create a deep copy to avoid modifying the original
    const updatedZone = JSON.parse(JSON.stringify(zone)) as MapZone;
    
    // First, mark the completed node as completed
    const completedNodeIndex = updatedZone.config.nodes.findIndex(n => n.id === completedNodeId);
    if (completedNodeIndex >= 0) {
      updatedZone.config.nodes[completedNodeIndex].status = 'completed';
    }
    
    // Find nodes to unlock
    const nodesToUnlock = progressService.findNodesToUnlock(zone, completedNodeId);
    
    // Update statuses for nodes to unlock
    nodesToUnlock.forEach(nodeId => {
      const nodeIndex = updatedZone.config.nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex >= 0) {
        // If this is the first available node, mark it as 'current', otherwise 'available'
        const isFirst = !updatedZone.config.nodes.some(n => n.status === 'current' || n.status === 'available');
        updatedZone.config.nodes[nodeIndex].status = isFirst ? 'current' : 'available';
      }
    });
    
    // If no current node exists, set the first available node as current
    if (!updatedZone.config.nodes.some(n => n.status === 'current')) {
      const firstAvailableIndex = updatedZone.config.nodes.findIndex(n => n.status === 'available');
      if (firstAvailableIndex >= 0) {
        updatedZone.config.nodes[firstAvailableIndex].status = 'current';
      }
    }
    
    return updatedZone;
  }
};