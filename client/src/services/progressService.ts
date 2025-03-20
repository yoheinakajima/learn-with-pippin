import { MapZone, MapNode, LessonCompletion, ChildProfile } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

/**
 * Service for handling game progression and map node statuses
 */
export const progressService = {
  /**
   * Update a node status based on completion of a quest
   */
  updateNodeStatus: async (
    zoneId: number, 
    nodeId: string, 
    newStatus: 'locked' | 'available' | 'current' | 'completed'
  ): Promise<MapZone> => {
    return apiRequest(`/api/map-zones/${zoneId}/nodes/${nodeId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
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
  ): Promise<{ zone: MapZone; child: ChildProfile }> => {
    return apiRequest(`/api/game-progress/complete-quest`, {
      method: 'POST',
      body: JSON.stringify({
        zoneId,
        nodeId,
        childId,
        questType,
        questId
      }),
    });
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