import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { InventoryItem, Item, ChildProfile, Stats } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";
import { MagicalItem } from "./MagicalItem";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Coins, Loader2, Sparkles } from "lucide-react";
import { childProfileService, inventoryService } from "@/services";

interface InventoryScreenProps {
  childId: number;
}

type TabType = 'equipped' | 'available' | 'shop';

export function InventoryScreen({ childId }: InventoryScreenProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('equipped');
  
  // Fetch child profile for stats and coins using the service
  const { data: childProfile, isLoading: profileLoading } = useQuery<ChildProfile>({
    queryKey: ["/api/child-profiles", childId],
    queryFn: () => childProfileService.getChildProfile(childId),
  });
  
  // Fetch inventory items using the service
  const { data: inventoryItems, isLoading: inventoryLoading } = useQuery<(InventoryItem & { details?: Item })[]>({
    queryKey: ["/api/child-profiles", childId, "inventory"],
    queryFn: () => inventoryService.getInventory(childId),
  });
  
  // Fetch all available items for shop using the service
  const { data: allItems, isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["/api/items"],
    queryFn: () => inventoryService.getAllItems(),
  });
  
  // Mutations for equipping/unequipping items
  const equipItemMutation = useMutation({
    mutationFn: (inventoryItemId: number) => inventoryService.equipItem(inventoryItemId, childId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles", childId, "inventory"] });
      toast({
        title: "Item Equipped",
        description: "Your magical item has been equipped!",
      });
    },
  });
  
  const unequipItemMutation = useMutation({
    mutationFn: (inventoryItemId: number) => inventoryService.unequipItem(inventoryItemId, childId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles", childId, "inventory"] });
      toast({
        title: "Item Unequipped",
        description: "Your magical item has been unequipped.",
      });
    },
  });
  
  // Purchase item mutation
  const purchaseItemMutation = useMutation({
    mutationFn: (itemId: number) => inventoryService.purchaseItem(childId, itemId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles", childId] });
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles", childId, "inventory"] });
      toast({
        title: "Item Purchased!",
        description: `You have successfully purchased ${data.inventoryItem.details?.name || 'an item'}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Calculate total stat boosts from equipped items using the service
  const calculateEquippedStats = (): Stats => {
    const baseStats = { magicPower: 0, wisdom: 0, agility: 0 };
    
    if (!inventoryItems || !childProfile) return baseStats;
    
    return inventoryService.calculateEquippedStats(childProfile, inventoryItems);
  };
  
  const handleEquipItem = (inventoryItemId: number) => {
    equipItemMutation.mutate(inventoryItemId);
  };
  
  const handleUnequipItem = (inventoryItemId: number) => {
    unequipItemMutation.mutate(inventoryItemId);
  };
  
  const handlePurchaseItem = (itemId: number) => {
    purchaseItemMutation.mutate(itemId);
  };
  
  // Filter items based on active tab
  const getFilteredItems = () => {
    if (!inventoryItems) return [];
    
    if (activeTab === 'equipped') {
      return inventoryItems.filter(item => item.equipped);
    } else if (activeTab === 'available') {
      return inventoryItems.filter(item => !item.equipped);
    }
    
    return [];
  };
  
  // Check if an item is already in inventory
  const isItemInInventory = (itemId: number): boolean => {
    if (!inventoryItems) return false;
    return inventoryItems.some(item => item.itemId === itemId);
  };
  
  const equippedStats = calculateEquippedStats();
  const filteredItems = getFilteredItems();
  const isLoading = profileLoading || inventoryLoading || itemsLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6 bg-white rounded-md p-4 shadow-md backdrop-blur-sm">
        <h2 className="text-2xl font-heading font-bold flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          Magical Items
        </h2>
        {childProfile && (
          <div className="flex items-center space-x-2">
            <div className="bg-white rounded-lg shadow px-3 py-2 flex items-center border-2 border-primary">
              <Coins className="h-5 w-5 text-yellow-500 mr-1" />
              <span className="font-medium">{childProfile.coins}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Inventory Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'equipped' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('equipped')}
          >
            Equipped
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'available' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('available')}
          >
            Available
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'shop' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('shop')}
          >
            Shop
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'shop' ? (
            // Shop Items
            <div className="grid md:grid-cols-3 gap-6">
              {allItems && allItems.map(item => {
                const alreadyOwned = isItemInInventory(item.id);
                const canAfford = childProfile && childProfile.coins >= item.price;
                
                return (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <MagicalItem item={item} isOwned={false} />
                    
                    <Button 
                      className={`w-full mt-4 ${alreadyOwned ? 'bg-gray-300' : canAfford ? 'bg-accent text-white' : 'bg-gray-300'}`}
                      disabled={alreadyOwned || !canAfford || purchaseItemMutation.isPending}
                      onClick={() => handlePurchaseItem(item.id)}
                    >
                      {alreadyOwned ? 'Already Owned' : (
                        <>
                          <Coins className="h-4 w-4 mr-1" />
                          Purchase for {item.price} coins
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            // Equipped/Available Items
            <>
              <div className="grid md:grid-cols-3 gap-6">
                {filteredItems.length > 0 ? (
                  filteredItems.map(inventoryItem => (
                    <div key={inventoryItem.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      {inventoryItem.details && (
                        <MagicalItem item={inventoryItem.details} isOwned={true} />
                      )}
                      
                      <Button 
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => inventoryItem.equipped 
                          ? handleUnequipItem(inventoryItem.id) 
                          : handleEquipItem(inventoryItem.id)
                        }
                        disabled={equipItemMutation.isPending || unequipItemMutation.isPending}
                      >
                        {inventoryItem.equipped ? 'Unequip' : 'Equip'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    {activeTab === 'equipped' ? (
                      <p>You don't have any equipped items. Go to Available tab to equip some items!</p>
                    ) : (
                      <p>You don't have any available items. Visit the Shop to buy magical items!</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Stat Summary (only shown in Equipped tab) */}
              {activeTab === 'equipped' && (
                <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium mb-4">Current Stats with Equipment</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Magic Power</span>
                        <span className="text-sm text-gray-500">
                          {childProfile?.stats.magicPower} 
                          {equippedStats.magicPower > 0 && (
                            <span className="text-primary"> (+{equippedStats.magicPower})</span>
                          )}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-primary rounded-full" 
                          style={{ width: `${Math.min((childProfile?.stats.magicPower || 0) + equippedStats.magicPower, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Wisdom</span>
                        <span className="text-sm text-gray-500">
                          {childProfile?.stats.wisdom}
                          {equippedStats.wisdom > 0 && (
                            <span className="text-accent"> (+{equippedStats.wisdom})</span>
                          )}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-secondary rounded-full" 
                          style={{ width: `${Math.min((childProfile?.stats.wisdom || 0) + equippedStats.wisdom, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Agility</span>
                        <span className="text-sm text-gray-500">
                          {childProfile?.stats.agility}
                          {equippedStats.agility > 0 && (
                            <span className="text-secondary"> (+{equippedStats.agility})</span>
                          )}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-accent rounded-full" 
                          style={{ width: `${Math.min((childProfile?.stats.agility || 0) + equippedStats.agility, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
