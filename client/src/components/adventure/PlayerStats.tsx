import { Stats } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface PlayerStatsProps {
  stats: Stats;
}

export function PlayerStats({ stats }: PlayerStatsProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="font-medium mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.323l-3.954 1.582A1 1 0 004 6.868V16a1 1 0 001 1h10a1 1 0 001-1V6.868a1 1 0 00-.504-.926L11 4.323V3a1 1 0 00-1-1zM4 8.8V16h4V7.714L4 8.8zm6-1.657V16h6V7.143L10 7.143z" clipRule="evenodd" />
        </svg>
        Player Stats
      </h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Magic Power</span>
            <span className="text-sm text-gray-500">{stats.magicPower}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-primary rounded-full" 
              style={{ width: `${Math.min(stats.magicPower, 100)}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Wisdom</span>
            <span className="text-sm text-gray-500">{stats.wisdom}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-secondary rounded-full" 
              style={{ width: `${Math.min(stats.wisdom, 100)}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Agility</span>
            <span className="text-sm text-gray-500">{stats.agility}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-accent rounded-full" 
              style={{ width: `${Math.min(stats.agility, 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200 flex items-center justify-center"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Full Stats
          </Button>
        </div>
      </div>
    </div>
  );
}
