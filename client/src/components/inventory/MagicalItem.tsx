import { Item, Stats } from "@/lib/types";
import { ArrowUp } from "lucide-react";

interface MagicalItemProps {
  item: Item;
  isOwned: boolean;
}

export function MagicalItem({ item, isOwned }: MagicalItemProps) {
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
  
  // Get icon based on primary stat boost
  const getItemIcon = () => {
    const { statBoosts } = item;
    
    if (statBoosts.magicPower > 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      );
    } else if (statBoosts.wisdom > 0) {
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
  
  // Get text color based on stat type
  const getStatColor = (statType: keyof Stats) => {
    switch(statType) {
      case 'magicPower':
        return 'text-primary';
      case 'wisdom':
        return 'text-accent';
      case 'agility':
        return 'text-secondary';
      default:
        return 'text-gray-600';
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <div className={`h-14 w-14 bg-gradient-to-br ${getItemGradient(item.rarity)} rounded-lg flex items-center justify-center mr-3 magical-item`}>
          {getItemIcon()}
        </div>
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.rarity} Item</p>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        {Object.entries(item.statBoosts).map(([stat, value]) => {
          if (value <= 0) return null;
          
          return (
            <div key={stat} className="flex items-center text-sm">
              <span className="w-32">{stat === 'magicPower' ? 'Magic Power' : stat === 'wisdom' ? 'Wisdom' : 'Agility'}</span>
              <div className={`flex items-center ${getStatColor(stat as keyof Stats)}`}>
                <span>+{value}</span>
                <ArrowUp className="h-4 w-4 ml-1" />
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-600 mb-4">{item.description}</p>
      
      {!isOwned && (
        <div className="flex items-center mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{item.price} coins</span>
        </div>
      )}
    </div>
  );
}
