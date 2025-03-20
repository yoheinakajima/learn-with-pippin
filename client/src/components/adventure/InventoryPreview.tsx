import { useQuery } from "@tanstack/react-query";
import { InventoryItem, Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Layers } from "lucide-react";
import { Loader2 } from "lucide-react";

interface InventoryPreviewProps {
  childId: number;
}

export function InventoryPreview({ childId }: InventoryPreviewProps) {
  const { data: inventoryItems, isLoading } = useQuery<(InventoryItem & { details?: Item })[]>({
    queryKey: ["/api/child-profiles", childId, "inventory"],
    queryFn: async () => {
      const res = await fetch(`/api/child-profiles/${childId}/inventory`);
      if (!res.ok) {
        throw new Error("Failed to fetch inventory");
      }
      return res.json();
    },
  });
  
  // Get equipped items only
  const equippedItems = inventoryItems?.filter(item => item.equipped) || [];
  
  // Icons for different types of items
  const getItemIcon = (item: Item) => {
    if (item.statBoosts.magicPower > 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      );
    } else if (item.statBoosts.wisdom > 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          ))
        )}
      </div>
      
      <div className="pt-2">
        <Link href={`/inventory/${childId}`}>
          <Button 
            variant="outline" 
            className="w-full bg-accent bg-opacity-10 text-accent hover:bg-opacity-20 border-0 flex items-center justify-center"
          >
            <Layers className="h-4 w-4 mr-1" />
            View Inventory
          </Button>
        </Link>
      </div>
    </div>
  );
}
