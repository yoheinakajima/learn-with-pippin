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
  Lightning,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdventureMapProps {
  zone: MapZone;
  childId: number;
}

export function AdventureMap({ zone, childId }: AdventureMapProps) {
  // Fetch child profile for stats and inventory
  const { data: childProfile, isLoading: profileLoading } = useQuery<ChildProfile>({
    queryKey: ["/api/child-profiles", childId],
    queryFn: async () => {
      const res = await fetch(`/api/child-profiles/${childId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch child profile");
      }
      return res.json();
    },
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
                <Lightning className="h-5 w-5 text-primary mr-1" />
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
            <Lightning className="h-5 w-5 text-secondary mr-2" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button className="w-full bg-primary text-white hover:bg-opacity-90 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Daily Challenge
            </Button>
            <Link href={`/mini-game/1`}>
              <Button className="w-full bg-accent text-white hover:bg-opacity-90 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Mini-Game
              </Button>
            </Link>
            <Button className="w-full bg-secondary text-white hover:bg-opacity-90 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Magic Duel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
