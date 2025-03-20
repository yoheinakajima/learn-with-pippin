import { useQuery } from "@tanstack/react-query";
import { MapZone, ChildProfile } from "@/lib/types";
import { MapSvg } from "./MapSvg";
import { PlayerStats } from "./PlayerStats";
import { InventoryPreview } from "./InventoryPreview";
import { Link } from "wouter";
import { 
  MapPin, 
  Globe, 
  Compass,
  Zap,
  Coins,
  BookOpen,
  Gamepad2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { childProfileService, gameService } from "@/services";

interface AdventureMapProps {
  zone: MapZone;
  childId: number;
}

export function AdventureMap({ zone, childId }: AdventureMapProps) {
  // Fetch child profile for stats and inventory using the service
  const { data: childProfile, isLoading: profileLoading } = useQuery<ChildProfile>({
    queryKey: ["/api/child-profiles", childId],
    queryFn: () => childProfileService.getChildProfile(childId),
  });
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold">{zone.name}</h2>
        <div className="flex items-center space-x-4">
          {/* Currency Display */}
          {childProfile && (
            <>
              <div className="bg-white rounded-lg shadow px-3 py-2 flex items-center">
                <Coins className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="font-medium">{childProfile.coins}</span>
              </div>
              <div className="bg-white rounded-lg shadow px-3 py-2 flex items-center">
                <Zap className="h-5 w-5 text-primary mr-1" />
                <span className="font-medium">Level {childProfile.level}</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Map Display with SVG Elements */}
      <div className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
        {/* SVG Map Background */}
        <div className="w-full h-[500px] lg:h-[600px] relative rounded-lg overflow-hidden bg-gradient-to-b from-secondary to-green-700">
          <MapSvg config={zone.config} />
          
          {/* Current Task Indicator */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg flex items-center">
            <div className="h-3 w-3 bg-accent rounded-full mr-2"></div>
            <span className="text-sm font-medium">Mini-Quest: Find the Magic Crystal (2/3)</span>
          </div>
        </div>
        
        {/* Zone Selection */}
        <div className="absolute top-6 right-6 bg-white rounded-lg shadow-md p-2">
          <Button variant="ghost" className="p-2 bg-secondary bg-opacity-20 rounded-lg mb-2">
            <Globe className="h-6 w-6 text-secondary" />
          </Button>
          <Button variant="ghost" className="p-2 hover:bg-gray-100 rounded-lg mb-2">
            <Compass className="h-6 w-6 text-gray-500" />
          </Button>
          <Button variant="ghost" className="p-2 hover:bg-gray-100 rounded-lg">
            <MapPin className="h-6 w-6 text-gray-500" />
          </Button>
        </div>
      </div>
      
      {/* Player Stats & Inventory Quick Access */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {/* Player Stats Card */}
        {childProfile && <PlayerStats stats={childProfile.stats} />}
        
        {/* Inventory Preview */}
        <InventoryPreview childId={childId} />
        
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-medium mb-4 flex items-center">
            <Zap className="h-5 w-5 text-secondary mr-2" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button className="w-full bg-primary text-white hover:bg-opacity-90 flex items-center justify-center">
              <Compass className="h-4 w-4 mr-2" />
              Daily Challenge
            </Button>
            <Link href={`/mini-game/1`}>
              <Button className="w-full bg-accent text-white hover:bg-opacity-90 flex items-center justify-center">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Start Mini-Game
              </Button>
            </Link>
            <Link href={`/lesson/1`}>
              <Button className="w-full bg-secondary text-white hover:bg-opacity-90 flex items-center justify-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Start Lesson
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
