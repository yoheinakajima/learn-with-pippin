// Inventory service for managing items and equipment
import { apiRequest } from "@/lib/queryClient";
import { 
  Item, 
  InventoryItem, 
  Stats, 
  EquipmentSlots,
  ChildProfile 
} from "@/lib/types";

// Inventory and item services
export const inventoryService = {
  // Get a child's inventory
  getInventory: async (childId: number): Promise<(InventoryItem & { details?: Item })[]> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/inventory`);
    return await res.json();
  },
  
  // Get all items in the shop
  getAllItems: async (): Promise<Item[]> => {
    const res = await apiRequest("GET", "/api/items");
    return await res.json();
  },
  
  // Get items of a specific rarity
  getItemsByRarity: async (rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'): Promise<Item[]> => {
    const res = await apiRequest("GET", `/api/items/rarity/${rarity}`);
    return await res.json();
  },
  
  // Get items that a child can purchase (meets requirements and has enough coins)
  getPurchasableItems: async (childId: number): Promise<Item[]> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/purchasable-items`);
    return await res.json();
  },
  
  // Purchase an item
  purchaseItem: async (childId: number, itemId: number): Promise<{ 
    inventoryItem: InventoryItem & { details?: Item };
    remainingCoins: number;
  }> => {
    const res = await apiRequest("POST", `/api/child-profiles/${childId}/purchase-item`, { itemId });
    return await res.json();
  },
  
  // Equip an item
  equipItem: async (inventoryItemId: number, childId: number): Promise<{
    inventoryItem: InventoryItem;
    updatedEquipmentSlots: EquipmentSlots;
    updatedStats: Stats;
  }> => {
    const res = await apiRequest("PUT", `/api/inventory/${inventoryItemId}/equip`, { childId });
    return await res.json();
  },
  
  // Unequip an item
  unequipItem: async (inventoryItemId: number, childId: number): Promise<{
    inventoryItem: InventoryItem;
    updatedEquipmentSlots: EquipmentSlots;
    updatedStats: Stats;
  }> => {
    const res = await apiRequest("PUT", `/api/inventory/${inventoryItemId}/unequip`, { childId });
    return await res.json();
  },
  
  // Calculate stats with equipped items
  calculateEquippedStats: (childProfile: ChildProfile, inventoryItems: (InventoryItem & { details?: Item })[]): Stats => {
    // Start with base stats
    const stats = { ...childProfile.stats };
    
    // Add bonuses from equipped items
    const equippedItems = inventoryItems.filter(item => item.equipped && item.details);
    
    equippedItems.forEach(item => {
      if (item.details) {
        stats.magicPower += item.details.statBoosts.magicPower;
        stats.wisdom += item.details.statBoosts.wisdom;
        stats.agility += item.details.statBoosts.agility;
      }
    });
    
    return stats;
  },
  
  // Check if a child meets requirements for an item
  checkItemRequirements: (childProfile: ChildProfile, item: Item): {
    meetsRequirements: boolean;
    missingRequirements: {
      level?: number;
      stats?: Partial<Stats>;
      achievements?: string[];
    }
  } => {
    const missingRequirements: {
      level?: number;
      stats?: Partial<Stats>;
      achievements?: string[];
    } = {};
    
    // Check level requirement
    if (item.requirements?.level && childProfile.level < item.requirements.level) {
      missingRequirements.level = item.requirements.level;
    }
    
    // Check stat requirements
    if (item.requirements?.stats) {
      const missingStats: Partial<Stats> = {};
      let hasMissingStats = false;
      
      if (item.requirements.stats.magicPower && childProfile.stats.magicPower < item.requirements.stats.magicPower) {
        missingStats.magicPower = item.requirements.stats.magicPower;
        hasMissingStats = true;
      }
      
      if (item.requirements.stats.wisdom && childProfile.stats.wisdom < item.requirements.stats.wisdom) {
        missingStats.wisdom = item.requirements.stats.wisdom;
        hasMissingStats = true;
      }
      
      if (item.requirements.stats.agility && childProfile.stats.agility < item.requirements.stats.agility) {
        missingStats.agility = item.requirements.stats.agility;
        hasMissingStats = true;
      }
      
      if (hasMissingStats) {
        missingRequirements.stats = missingStats;
      }
    }
    
    // For now, we're not checking achievements
    // Would need to add this logic once we have achievements implemented
    
    const meetsRequirements = Object.keys(missingRequirements).length === 0;
    
    return {
      meetsRequirements,
      missingRequirements
    };
  }
};