import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Item } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Brain, Wind } from "lucide-react";

interface MagicalItemProps {
  item: Item;
  isOwned: boolean;
}

const rarityColors = {
  Common: "bg-slate-100 text-slate-800",
  Uncommon: "bg-green-100 text-green-800",
  Rare: "bg-blue-100 text-blue-700",
  Epic: "bg-purple-100 text-purple-800",
  Legendary: "bg-amber-100 text-amber-800",
};

export function MagicalItem({ item, isOwned }: MagicalItemProps) {
  const rarityColor = rarityColors[item.rarity] || rarityColors.Common;
  
  const getStatIcon = (stat: string) => {
    switch (stat) {
      case 'magicPower':
        return <Zap className="h-4 w-4" />;
      case 'wisdom':
        return <Brain className="h-4 w-4" />;
      case 'agility':
        return <Wind className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn(
      "border-2 transition-all overflow-hidden",
      item.rarity === "Legendary" && "border-amber-400 shadow-md shadow-amber-100",
      item.rarity === "Epic" && "border-purple-400 shadow-md shadow-purple-100",
      item.rarity === "Rare" && "border-blue-400 shadow-md shadow-blue-100",
      item.rarity === "Uncommon" && "border-green-400 shadow-md shadow-green-100",
      item.rarity === "Common" && "border-slate-200",
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base md:text-lg">{item.name}</CardTitle>
          <Badge variant="outline" className={cn(rarityColor, "ml-2 px-2 py-0.5 text-xs font-medium")}>
            {item.rarity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="outline" className="px-2 py-0.5 font-semibold">
            {item.price} Coins
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
        
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-muted-foreground mb-1">Stat Boosts</h4>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(item.statBoosts).map(([stat, value]) => (
              value > 0 && (
                <div 
                  key={stat} 
                  className={cn(
                    "flex items-center justify-between px-2 py-1 rounded text-xs",
                    stat === "magicPower" && "bg-indigo-50 text-indigo-700",
                    stat === "wisdom" && "bg-cyan-50 text-cyan-700",
                    stat === "agility" && "bg-emerald-50 text-emerald-700",
                  )}
                >
                  <span className="flex items-center">
                    {getStatIcon(stat)}
                    <span className="ml-1 capitalize">{stat.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </span>
                  <span className="font-bold">+{value}</span>
                </div>
              )
            ))}
          </div>
        </div>
      </CardContent>
      {item.requirements && (
        <CardFooter className="pt-0">
          <div className="w-full">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Requirements</h4>
            <div className="text-xs text-muted-foreground">
              {item.requirements.level && (
                <div className="flex items-center text-xs">
                  <span>Level {item.requirements.level}+</span>
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}