import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useParams } from "wouter";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { MasterMapScreen } from "@/components/adventure/MasterMapScreen";
import { Loader2 } from "lucide-react";
import { MasterMap } from "@/lib/types";

export default function MasterMapPage() {
  const { activeChildSession } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams();
  
  // Redirect if no active child session
  useEffect(() => {
    if (!activeChildSession) {
      navigate("/");
    }
  }, [activeChildSession, navigate]);
  
  // Fetch master maps
  const { data: masterMaps, isLoading: mapsLoading } = useQuery<MasterMap[]>({
    queryKey: ["/api/master-maps"],
    queryFn: async () => {
      const res = await fetch("/api/master-maps");
      if (!res.ok) {
        throw new Error("Failed to fetch master maps");
      }
      return res.json();
    },
    enabled: !!activeChildSession,
  });
  
  // Default to first active map if none specified
  const mapId = params.mapId ? parseInt(params.mapId) : undefined;
  
  // Find the active map (either the specified one or the first active one)
  const activeMap = mapId 
    ? masterMaps?.find(m => m.id === mapId) 
    : masterMaps?.find(m => m.currentActive);
  
  if (!activeChildSession) {
    return null;
  }
  
  if (mapsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!activeMap) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">No Active Adventure Map</h2>
            <p className="text-gray-600 mb-8">
              There is no active master adventure map available. Please check back later!
            </p>
            <button 
              className="bg-primary text-white px-6 py-2 rounded-lg"
              onClick={() => navigate("/adventure")}
            >
              Back to Adventure
            </button>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-grow">
        <MasterMapScreen masterMap={activeMap} childId={activeChildSession.childId} />
      </div>
      <MobileNav />
    </div>
  );
}