import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useParams } from "wouter";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { AdventureMap } from "@/components/adventure/AdventureMap";
import { Loader2 } from "lucide-react";
import { MapZone } from "@/lib/types";
import { LeftHeaderLayout } from "@/components/layout/LeftHeaderLayout";
import { gameService } from "@/services";

export default function AdventurePage() {
  const { activeChildSession } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams();
  
  // Redirect if no active child session
  useEffect(() => {
    if (!activeChildSession) {
      navigate("/");
    }
  }, [activeChildSession, navigate]);

  
  const { data: mapZones, isLoading } = useQuery<MapZone[]>({
    queryKey: ["/api/child-profiles", activeChildSession?.childId, "available-map-zones"],
    queryFn: async () => {
      console.log('[ADVENTURE-PAGE] Fetching available map zones for child');
      try {
        const data = await gameService.getAvailableMapZones(activeChildSession!.childId);
        return data;
      } catch (error) {
        console.error('[ADVENTURE-PAGE] Error fetching map zones:', error);
        throw new Error("Failed to fetch map zones");
      }
    },
    enabled: !!activeChildSession,
  });
  
  // Default to first zone if none specified
  const zoneId = params.zoneId ? parseInt(params.zoneId) : mapZones?.[0]?.id;
  
  // Find the current zone
  const currentZone = mapZones?.find(zone => zone.id === zoneId);

  console.log('mapzone', mapZones);
  
  
  useEffect(() => {
    if (currentZone) {
      console.log('[ADVENTURE-PAGE] Selected zone:', {
        id: currentZone.id,
        name: currentZone.name,
        nodeCount: currentZone.config.nodes.length,
        nodeStatuses: currentZone.config.nodes.map(n => ({ id: n.id, status: n.status }))
      });
    }
  }, [currentZone]);
  
  if (!activeChildSession) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <LeftHeaderLayout>
      <div className="flex-grow">
        {currentZone ? (
          <AdventureMap zone={currentZone} childId={activeChildSession.childId} />
        ) : (
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Zone not found</h2>
            <p className="text-gray-600 mb-8">The magical zone you're looking for doesn't exist.</p>
            <button 
              className="bg-primary text-white px-6 py-2 rounded-lg"
              onClick={() => navigate("/adventure")}
            >
              Return to Map
            </button>
          </div>
        )}
      </div>
    </LeftHeaderLayout>
  );
}
