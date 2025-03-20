import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { MiniGame as MiniGameComponent } from "@/components/games/MiniGame";
import { MiniGame, Question } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { miniGameService } from "@/services";

export default function MiniGamePage() {
  const { activeChildSession } = useAuth();
  const params = useParams<{ gameId: string }>();
  const [, navigate] = useLocation();
  
  const gameId = parseInt(params.gameId);
  
  // Redirect if no active child session
  useEffect(() => {
    if (!activeChildSession) {
      navigate("/");
    }
  }, [activeChildSession, navigate]);
  
  // Fetch mini-game data using the service
  const { data: miniGame, isLoading } = useQuery<MiniGame & { questions: Question[] }>({
    queryKey: ["/api/mini-games", gameId],
    queryFn: () => miniGameService.getMiniGame(gameId),
    enabled: !!activeChildSession && !isNaN(gameId),
  });
  
  // Handle game completion
  const handleGameComplete = () => {
    navigate("/adventure");
  };
  
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
  
  if (!miniGame) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Mini-Game Not Found</h2>
          <p className="text-gray-600 mb-8">The mini-game you're looking for doesn't exist.</p>
          <button 
            className="bg-primary text-white px-6 py-2 rounded-lg"
            onClick={() => navigate("/adventure")}
          >
            Return to Map
          </button>
        </div>
        <MobileNav />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-6">
        <MiniGameComponent 
          miniGame={miniGame} 
          questions={miniGame.questions} 
          childId={activeChildSession.childId}
          onGameComplete={handleGameComplete}
        />
      </div>
      <MobileNav />
    </div>
  );
}
