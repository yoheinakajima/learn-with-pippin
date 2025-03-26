import { useQuery } from "@tanstack/react-query";
import { InventoryItem, Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Layers, Sparkles, ShieldHalf, Wand2, Plus } from "lucide-react";
import { Loader2 } from "lucide-react";
import { inventoryService } from "@/services";

interface InventoryPreviewProps {
  childId: number;
}

export function InventoryPreview({ childId }: InventoryPreviewProps) {
  const { data: inventoryItems, isLoading } = useQuery<(InventoryItem & { details?: Item })[]>({
    queryKey: ["/api/child-profiles", childId, "inventory"],
    queryFn: () => inventoryService.getInventory(childId),
  });
  
  // Get equipped items only
  const equippedItems = inventoryItems?.filter(item => item.equipped) || [];
  
  // Icons for different types of items using Lucide icons
  const getItemIcon = (item: Item) => {
    if (item.statBoosts.magicPower > 0) {
      return <Wand2 className="h-8 w-8 text-white" />;
    } else if (item.statBoosts.wisdom > 0) {
      return <Sparkles className="h-8 w-8 text-white" />;
    } else {
      return <ShieldHalf className="h-8 w-8 text-white" />;
    }
  };
  
  // Get gradient based on item rarity
  const getItemGradient = (rarity: string) => {
    switch(rarity) {
      case 'Common':
        return 'from-blue-400 to-blue-600';
      case 'Uncommon':
        return 'from-secondary to-green-700';
      case 'Rare':
        return 'from-primary to-purple-600';
      case 'Epic':
        return 'from-accent to-yellow-600';
      case 'Legendary':
        return 'from-red-500 to-orange-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="font-medium mb-4 flex items-center">
        <Wand2 className="h-5 w-5 text-accent mr-2" />
        Equipped Items
      </h3>
      
      <div className="grid grid-cols-3 gap-3 mb-3">
        {equippedItems.length > 0 ? (
          equippedItems.slice(0, 3).map((inventoryItem) => (
            <div 
              key={inventoryItem.id}
              className={`h-16 w-full bg-gradient-to-br ${getItemGradient(inventoryItem.details?.rarity || 'Common')} rounded-lg flex items-center justify-center magical-item`}
            >
              {inventoryItem.details && getItemIcon(inventoryItem.details)}
            </div>
          ))
        ) : (
          // Empty slots
          Array.from({ length: 3 }).map((_, index) => (
            <div 
              key={index}
              className="h-16 w-full bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
            >
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
          ))
        )}
      </div>
      
      <div className="pt-2">
        <Link href={`/inventory/${childId}`}>
          <Button 
            variant="outline" 
            className="w-full bg-accent bg-opacity-10 hover:bg-opacity-20 border-0 flex items-center justify-center"
          >
            <Layers className="h-4 w-4 mr-1" />
            View Inventory
          </Button>
        </Link>
      </div>
    </div>
  );
}
