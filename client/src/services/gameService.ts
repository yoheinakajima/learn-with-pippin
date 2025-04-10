// Game service for managing adventure maps and mini-games
import { apiRequest } from "@/lib/queryClient";
import { 
  MapZone, 
  MiniGame, 
  Question, 
  ChildProfile, 
  MapNode,
  Lesson
} from "@/lib/types";

// Game services for adventure maps and mini-games
export const gameService = {
  // Get all map zones
  getAllMapZones: async (): Promise<MapZone[]> => {
    const res = await apiRequest("GET", "/api/map-zones");
    return await res.json();
  },
  
  // Get a specific map zone
  getMapZone: async (id: number): Promise<MapZone> => {
    const res = await apiRequest("GET", `/api/map-zones/${id}`);
    return await res.json();
  },
  
  // Get available map zones for a child (based on their level and progress)
  getAvailableMapZones: async (childId: number): Promise<MapZone[]> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/available-map-zones`);
    return await res.json();
  },
  
  // Update status of a map zone for a child
  updateMapZoneAvailability: async (childId: number, zoneId: number, nodeId: string, status: 'locked' | 'available' | 'current' | 'completed'): Promise<any> => {
    console.log(`[CLIENT] Updating zone ${zoneId} node ${nodeId} availability to ${status} for child ${childId}`);
    try {
      const res = await apiRequest("PATCH", `/api/child-profiles/${childId}/available-map-zones/${zoneId}/${nodeId}`, { 
        status 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error(`[CLIENT] Error updating zone availability: ${errorData.error || 'Unknown error'}`);
        throw new Error(errorData.error || 'Failed to update zone availability');
      }
      
      const response = await res.json();
      console.log(`[CLIENT] Successfully updated zone ${zoneId} availability`, response);
      
      // // Invalidate the query cache to refresh all affected data
      // try {
      //   const { queryClient } = await import('@/lib/queryClient');
        
      //   // Invalidate available map zones query to trigger a refresh
      //   queryClient.invalidateQueries({ 
      //     queryKey: ["/api/child-profiles", childId, "available-map-zones"]
      //   });
        
      //   // Also invalidate the specific map zone
      //   queryClient.invalidateQueries({
      //     queryKey: ["/api/map-zones", zoneId]
      //   });
      // } catch (err) {
      //   console.error("[CLIENT] Error invalidating queries:", err);
      // }
      
      return response;
    } catch (error) {
      console.error('[CLIENT] Error in updateMapZoneAvailability:', error);
      throw error;
    }
  },
  
  // Update the status of a map node (locked, available, current, completed)
  updateNodeStatus: async (childId: number, zoneId: number, nodeId: string, status: 'locked' | 'available' | 'current' | 'completed'): Promise<MapZone> => {
    console.log(`[CLIENT] Updating node ${nodeId} status to ${status} for child ${childId} in zone ${zoneId}`);
    try {
      const res = await apiRequest("PATCH", `/api/child-profiles/${childId}/available-map-zones/${zoneId}/${nodeId}`, { 
        status 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error(`[CLIENT] Error updating node status: ${errorData.error || 'Unknown error'}`);
        throw new Error(errorData.error || 'Failed to update node status');
      }
      
      const response = await res.json();
      console.log(`[CLIENT] Successfully updated node ${nodeId} to status ${status}`, response);
      
      // Manually import and invalidate the query cache to refresh all affected data
      try {
        const { queryClient } = await import('@/lib/queryClient');
        
        // Invalidate available map zones query to trigger a refresh
        queryClient.invalidateQueries({ 
          queryKey: ["/api/child-profiles", childId, "available-map-zones"]
        });
        
        // Also invalidate the specific map zone
        queryClient.invalidateQueries({
          queryKey: ["/api/map-zones", zoneId]
        });
      } catch (err) {
        console.error("[CLIENT] Error invalidating queries:", err);
      }
      
      return response.zone;
    } catch (error) {
      console.error('[CLIENT] Error in updateNodeStatus:', error);
      throw error;
    }
  },
  
  // Get all mini-games
  getAllMiniGames: async (): Promise<MiniGame[]> => {
    const res = await apiRequest("GET", "/api/mini-games");
    return await res.json();
  },
  
  // Get a specific mini-game with its questions
  getMiniGame: async (id: number): Promise<MiniGame & { questions: Question[] }> => {
    const res = await apiRequest("GET", `/api/mini-games/${id}`);
    return await res.json();
  },
  
  // Get mini-games by difficulty
  getMiniGamesByDifficulty: async (difficulty: number): Promise<MiniGame[]> => {
    const res = await apiRequest("GET", `/api/mini-games/difficulty/${difficulty}`);
    return await res.json();
  },
  
  // Record mini-game completion and award rewards
  completeMiniGame: async (childId: number, miniGameId: number, score: number): Promise<{
    childProfile: ChildProfile;
    xpAwarded: number;
    coinsAwarded: number;
    levelUp: boolean;
  }> => {
    const res = await apiRequest("POST", "/api/mini-game-completions", {
      childId,
      miniGameId,
      score,
      timestamp: new Date().toISOString()
    });
    return await res.json();
  },
  
  // Get node content (mini-game or lesson) based on node type
  getNodeContent: async (nodeId: string, zoneId: number): Promise<{
    type: 'mini-game' | 'lesson';
    content: MiniGame | Lesson;
  }> => {
    const res = await apiRequest("GET", `/api/map-zones/${zoneId}/nodes/${nodeId}/content`);
    return await res.json();
  },
  
  // Check if a child has met the requirements to unlock a map zone
  checkZoneRequirements: async (childId: number, zoneId: number): Promise<{
    canAccess: boolean;
    missingRequirements: {
      level?: number;
      completedZones?: number[];
      items?: number[];
    }
  }> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/can-access-zone/${zoneId}`);
    return await res.json();
  },
  
  // Calculate rewards based on performance in a mini-game
  calculateRewards: (baseXP: number, baseCoins: number, score: number, difficulty: number): {
    xp: number;
    coins: number;
  } => {
    // Performance multiplier: 0.5 (poor) to 1.5 (perfect)
    const performanceMultiplier = 0.5 + (score / 100);
    
    // Difficulty multiplier: 1.0 (easy) to 2.0 (hard)
    const difficultyMultiplier = 1 + (difficulty * 0.2);
    
    return {
      xp: Math.round(baseXP * performanceMultiplier * difficultyMultiplier),
      coins: Math.round(baseCoins * performanceMultiplier * difficultyMultiplier)
    };
  }
};