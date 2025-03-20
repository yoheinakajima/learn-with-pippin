import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapZone, ChildProfile, MapNode } from "@/lib/types";
import { MapSvg } from "./MapSvg";
import { PlayerStats } from "./PlayerStats";
import { InventoryPreview } from "./InventoryPreview";
import { RewardsModal } from "./RewardsModal";
import { Link, useLocation } from "wouter";
import { 
  MapPin, 
  Globe, 
  Compass,
  Zap,
  Coins,
  BookOpen,
  Gamepad2,
  ShieldHalf,
  Star,
  BadgePlus,
  Timer,
  ArrowBigRight,
  Info,
  Clock,
  Wand2,
  Map,
  Flag,
  CheckCircle,
  XCircle,
  Lock as LockKeyhole,
  HelpCircle,
  Medal,
  Trophy,
  ArrowRight,
  Gift as GiftIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { childProfileService, gameService, mapService, progressService } from "@/services";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface AdventureMapProps {
  zone: MapZone;
  childId: number;
}

export function AdventureMap({ zone, childId }: AdventureMapProps) {
  // Setup toast and query client
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
  // Fetch child profile for stats and inventory using the service
  const { data: childProfile, isLoading: profileLoading } = useQuery<ChildProfile>({
    queryKey: ["/api/child-profiles", childId],
    queryFn: () => childProfileService.getChildProfile(childId),
  });

  // Show node info modal and map completion modal
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [mapCompletionModalOpen, setMapCompletionModalOpen] = useState<boolean>(false);
  const [showRewardsModal, setShowRewardsModal] = useState<boolean>(false);
  const [rewardsClaimed, setRewardsClaimed] = useState<boolean>(false);
  const [completionData, setCompletionData] = useState<{
    nextZone?: MapZone;
    rewards?: {
      xp: number;
      coins: number;
      levelUp: boolean;
      newLevel?: number;
      specialItem?: any;
      timeBonus?: number;
      unlockNextZone?: boolean;
    };
  } | null>(null);
  
  // Get progress through current zone
  const availableNodes = zone.config.nodes.filter(n => n.status === "available" || n.status === "current").length;
  const completedNodes = zone.config.nodes.filter(n => n.status === "completed").length;
  const totalNodes = zone.config.nodes.length;
  const zoneProgress = Math.round((completedNodes / totalNodes) * 100);
  
  // Find the current quest/task node
  const currentNode = zone.config.nodes.find(n => n.status === "current");
  
  // Check if map is completed
  const isMapCompleted = progressService.isMapCompleted(zone);
  
  // Mutation for completing a map
  const completeMapMutation = useMutation({
    mutationFn: () => {
      return mapService.checkMapCompletion(childId, zone.id);
    },
    onSuccess: (data) => {
      if (data.isCompleted) {
        // Update the map data in the queryClient cache
        queryClient.invalidateQueries({ queryKey: ["/api/map-zones"] });
        queryClient.invalidateQueries({ queryKey: ["/api/child-profiles", childId] });
        
        // Store completion data for rewards
        setCompletionData(data);
        // Initially show the map completion modal
        setMapCompletionModalOpen(true);
        // After a short delay, show the rewards modal
        setTimeout(() => {
          setMapCompletionModalOpen(false);
          setShowRewardsModal(true);
        }, 1500);
      }
    },
    onError: (error) => {
      console.error("Error completing map:", error);
      toast({
        title: "Error",
        description: "There was a problem completing the map. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Check for map completion when the zone data changes or component mounts
  useEffect(() => {
    // If map is completed and modal isn't already shown and we don't have completion data
    if (isMapCompleted && !mapCompletionModalOpen && !completionData) {
      console.log("Map is completed, showing completion modal");
      completeMapMutation.mutate();
    }
  }, [zone, isMapCompleted, mapCompletionModalOpen, completionData]);
  
  // Handle node selection
  const handleNodeSelect = (node: MapNode) => {
    setSelectedNode(node);
    setInfoModalOpen(true);
  };
  
  // XP to next level calculation (example formula)
  const xpToNextLevel = childProfile ? Math.pow(childProfile.level, 2) * 100 : 0;
  const xpProgress = childProfile ? Math.min(100, Math.round((childProfile.xp / xpToNextLevel) * 100)) : 0;
  
  // Get node icon based on type and status
  const getNodeIcon = (type: string, status: string) => {
    if (status === "locked") return <LockKeyhole className="h-5 w-5 text-gray-400" />;
    if (status === "completed") return <CheckCircle className="h-5 w-5 text-green-500" />;
    
    switch (type) {
      case "mini-game":
        return <Gamepad2 className="h-5 w-5 text-accent" />;
      case "lesson":
        return <BookOpen className="h-5 w-5 text-primary" />;
      case "mini-task":
        return <Clock className="h-5 w-5 text-secondary" />;
      case "boss":
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="sticky top-0 z-10 bg-gray-100 bg-opacity-95 py-2 px-4 -mx-4 backdrop-blur-sm rounded-lg mb-6">
        <div className="flex flex-wrap justify-between items-center">
          <h2 className="text-2xl font-heading font-bold flex items-center">
            <Map className="h-6 w-6 mr-2 text-secondary" />
            {zone.name}
          </h2>
          
          {/* Progress & Resources Display */}
          <div className="flex flex-wrap items-center gap-3">
            {childProfile && (
              <>
                {/* XP Progress */}
                <div className="bg-white rounded-lg shadow px-3 py-2">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-primary mr-1" />
                    <span className="font-bold">Level {childProfile.level}</span>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                    <div className="h-2 bg-primary rounded-full" style={{ width: `${xpProgress}%` }}></div>
                  </div>
                </div>
                
                {/* Coins */}
                <div className="bg-white rounded-lg shadow px-3 py-2 flex items-center">
                  <Coins className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="font-bold">{childProfile.coins}</span>
                </div>
                
                {/* Zone Progress */}
                <div className="bg-white rounded-lg shadow px-3 py-2">
                  <div className="flex items-center">
                    <Flag className="h-5 w-5 text-secondary mr-1" />
                    <span className="font-medium">{completedNodes}/{totalNodes} Completed</span>
                  </div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                    <div className="h-2 bg-secondary rounded-full" style={{ width: `${zoneProgress}%` }}></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Current Quest Indicator */}
      {currentNode && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border-l-4 border-accent">
          <div className="flex items-start">
            <div className="bg-accent bg-opacity-10 p-2 rounded-full mr-4">
              {getNodeIcon(currentNode.type, currentNode.status)}
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-gray-800">Current Quest: {currentNode.type === "mini-game" ? "Math Challenge" : 
                                                      currentNode.type === "lesson" ? "Reading Adventure" : 
                                                      currentNode.type === "boss" ? "Boss Battle" : "Mini Task"}</h3>
              <p className="text-gray-600 mt-1">
                {currentNode.type === "mini-game" ? "Complete the math game to earn rewards and unlock new areas!" : 
                 currentNode.type === "lesson" ? "Read through the magical story and answer questions to progress!" :
                 currentNode.type === "boss" ? "Face the zone boss to test all your knowledge and skills!" :
                 "Complete this quick task to earn bonus coins and experience!"}
              </p>
              <div className="mt-2">
                <Link href={currentNode.type === "mini-game" ? "/mini-game/1" : 
                            currentNode.type === "lesson" ? "/lesson/1" :
                            currentNode.type === "boss" ? "/mini-game/1" : "#"}>
                  <Button className="bg-accent hover:bg-accent/90 text-white">
                    Start Quest <ArrowBigRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            {/* Badge showing rewards */}
            <div className="flex flex-col items-center ml-2">
              <Badge variant="outline" className="mb-1 border-yellow-500 text-yellow-600 flex items-center">
                <Coins className="h-3 w-3 mr-1" /> +30
              </Badge>
              <Badge variant="outline" className="border-primary text-primary flex items-center">
                <Zap className="h-3 w-3 mr-1" /> +50 XP
              </Badge>
            </div>
          </div>
        </div>
      )}
      
      {/* Map with Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
            {/* SVG Map Background */}
            <div className="w-full h-[500px] lg:h-[600px] relative rounded-lg overflow-hidden bg-gradient-to-b from-secondary to-green-700">
              <MapSvg config={zone.config} onNodeSelect={handleNodeSelect} />
              
              {/* Map Completion Badge */}
              {isMapCompleted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
                  <div className="bg-white rounded-xl p-6 shadow-xl text-center transform rotate-6 border-4 border-yellow-500">
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-gray-800">MAP COMPLETED!</h3>
                    <p className="text-gray-600">All challenges conquered!</p>
                    <Button 
                      className="mt-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:opacity-90"
                      onClick={() => {
                        // Manually trigger the map completion flow if not already completed
                        if (!completionData) {
                          // Show loading state on the button
                          toast({
                            title: "Calculating rewards...",
                            description: "Your rewards are being calculated for map completion!",
                          });
                          completeMapMutation.mutate();
                        } else {
                          // If we already have completion data, close map completion modal and show rewards
                          setMapCompletionModalOpen(false);
                          setShowRewardsModal(true);
                        }
                      }}
                      disabled={completeMapMutation.isPending}
                    >
                      {completeMapMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Calculating...
                        </>
                      ) : (
                        <>
                          <GiftIcon className="h-4 w-4 mr-2" />
                          Claim Rewards
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
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
            
            {/* Map Legend */}
            <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-md p-3">
              <div className="text-sm font-medium mb-2">Map Legend</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs">Completed</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-xs">Current</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-xs">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-xs">Locked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Player Info Sidebar */}
        <div className="space-y-6">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="stats" className="w-1/2">Stats</TabsTrigger>
              <TabsTrigger value="items" className="w-1/2">Items</TabsTrigger>
            </TabsList>
            <TabsContent value="stats" className="pt-4">
              {childProfile && <PlayerStats stats={childProfile.stats} />}
            </TabsContent>
            <TabsContent value="items" className="pt-4">
              <InventoryPreview childId={childId} />
            </TabsContent>
          </Tabs>
          
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
          
          {/* Daily Rewards */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              Daily Rewards
            </h3>
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-700">Login Streak</span>
                <span className="text-sm font-medium">Day 3</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(day => (
                  <div 
                    key={day} 
                    className={`h-12 flex flex-col items-center justify-center rounded-md border ${day <= 3 ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}
                  >
                    <span className="text-xs">{day}</span>
                    {day <= 3 && <CheckCircle className="h-3 w-3 text-green-500 mt-1" />}
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:opacity-90"
                disabled={true}
              >
                <Medal className="h-4 w-4 mr-2" />
                Claimed Today
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Node Info Modal */}
      {infoModalOpen && selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className={`p-4 ${
              selectedNode.status === "completed" ? "bg-green-500" :
              selectedNode.status === "current" ? "bg-orange-500" :
              selectedNode.status === "available" ? "bg-purple-500" :
              "bg-gray-500"
            } text-white rounded-t-xl`}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {selectedNode.type === "mini-game" ? "Mini-Game Challenge" :
                   selectedNode.type === "lesson" ? "Learning Adventure" :
                   selectedNode.type === "boss" ? "Boss Battle" :
                   "Quick Task"}
                </h3>
                <button 
                  onClick={() => setInfoModalOpen(false)}
                  className="rounded-full hover:bg-white hover:bg-opacity-20 p-1"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedNode.status === "locked" ? (
                <div className="flex items-center justify-center flex-col p-6">
                  <LockKeyhole className="h-16 w-16 text-gray-400 mb-4" />
                  <h4 className="text-lg font-bold text-center mb-2">This area is locked!</h4>
                  <p className="text-gray-600 text-center">Complete previous quests to unlock this challenge.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-full mr-4 ${
                      selectedNode.type === "mini-game" ? "bg-accent bg-opacity-10" :
                      selectedNode.type === "lesson" ? "bg-primary bg-opacity-10" :
                      selectedNode.type === "boss" ? "bg-yellow-100" :
                      "bg-secondary bg-opacity-10"
                    }`}>
                      {getNodeIcon(selectedNode.type, selectedNode.status)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">
                        {selectedNode.type === "mini-game" ? "Math Wizardry" :
                         selectedNode.type === "lesson" ? "Spellcasting Stories" :
                         selectedNode.type === "boss" ? "Forest Guardian Challenge" :
                         "Magical Crystal Collection"}
                      </h4>
                      <p className="text-gray-500">
                        {selectedNode.type} • {selectedNode.status === "completed" ? "Completed" : 
                                              selectedNode.status === "current" ? "In Progress" : 
                                              "Ready to Start"}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    {selectedNode.type === "mini-game" ? 
                      "Test your math skills in this magical challenge! Solve problems to earn rewards and unlock new areas of the map." :
                     selectedNode.type === "lesson" ? 
                      "Embark on a reading adventure through enchanted stories. Learn new concepts while enjoying the magical narrative." :
                     selectedNode.type === "boss" ? 
                      "Face the mighty guardian of this area! This challenging battle will test all the skills you've learned so far." :
                     "A quick task to gather magical crystals. Complete it to earn bonus rewards!"}
                  </p>
                  
                  <div className="bg-gray-100 rounded-lg p-3 mb-4">
                    <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-primary" />
                      Rewards
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 text-yellow-500 mr-2" />
                        <span>{30 + (selectedNode.type === "boss" ? 50 : 0)} Coins</span>
                      </div>
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-primary mr-2" />
                        <span>{50 + (selectedNode.type === "boss" ? 100 : 0)} XP</span>
                      </div>
                      {selectedNode.type === "boss" && (
                        <div className="flex items-center col-span-2">
                          <Wand2 className="h-4 w-4 text-accent mr-2" />
                          <span>Magical Item Reward</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Timer className="h-4 w-4 mr-1" />
                      <span>Est. {selectedNode.type === "mini-game" ? "5" : 
                                 selectedNode.type === "lesson" ? "10" : 
                                 selectedNode.type === "boss" ? "15" : "3"} min</span>
                    </div>
                    
                    {selectedNode.status !== "completed" && (
                      <Link href={
                        selectedNode.type === "mini-game" ? "/mini-game/1" : 
                        selectedNode.type === "lesson" ? "/lesson/1" : 
                        selectedNode.type === "boss" ? "/mini-game/1" : "#"
                      }>
                        <Button className={
                          selectedNode.type === "mini-game" ? "bg-accent text-white" : 
                          selectedNode.type === "lesson" ? "bg-primary text-white" : 
                          selectedNode.type === "boss" ? "bg-yellow-500 text-white" : 
                          "bg-secondary text-white"
                        }>
                          {selectedNode.status === "current" ? "Continue" : "Start"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Map Completion Modal */}
      {mapCompletionModalOpen && completionData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-primary p-6 text-white text-center">
              <Trophy className="h-14 w-14 mx-auto mb-2 text-yellow-300" />
              <h2 className="text-2xl font-bold mb-2">Area Completed!</h2>
              <p className="text-white text-opacity-90">
                You've conquered the {zone.name}! Your mastery has unlocked new adventures.
              </p>
            </div>
            
            <div className="p-6">
              {/* Rewards Section */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-center mb-2 text-yellow-800">Rewards Earned</h3>
                <div className="flex justify-around">
                  <div className="text-center">
                    <div className="flex items-center justify-center bg-yellow-200 rounded-full h-12 w-12 mx-auto mb-1">
                      <Coins className="h-6 w-6 text-yellow-700" />
                    </div>
                    <div className="font-bold text-yellow-700">+{completionData.rewards?.coins || 100}</div>
                    <div className="text-xs text-yellow-700">Coins</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center bg-blue-200 rounded-full h-12 w-12 mx-auto mb-1">
                      <Zap className="h-6 w-6 text-blue-700" />
                    </div>
                    <div className="font-bold text-blue-700">+{completionData.rewards?.xp || 200}</div>
                    <div className="text-xs text-blue-700">XP</div>
                  </div>
                  {completionData.rewards?.levelUp && (
                    <div className="text-center">
                      <div className="flex items-center justify-center bg-green-200 rounded-full h-12 w-12 mx-auto mb-1">
                        <BadgePlus className="h-6 w-6 text-green-700" />
                      </div>
                      <div className="font-bold text-green-700">Level Up!</div>
                      <div className="text-xs text-green-700">New Level</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Next Area */}
              {completionData.nextZone && (
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-center mb-2">New Area Unlocked</h3>
                  <div className="flex items-center">
                    <div className="bg-secondary bg-opacity-20 p-2 rounded-full mr-3">
                      <Map className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <div className="font-medium">{completionData.nextZone.name}</div>
                      <div className="text-sm text-gray-600">{completionData.nextZone.description.substring(0, 60)}...</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-4">
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={() => {
                    setMapCompletionModalOpen(false);
                    setShowRewardsModal(true);
                  }}
                >
                  Claim Rewards <GiftIcon className="ml-2 h-4 w-4" />
                </Button>
                {completionData.nextZone && rewardsClaimed && (
                  <Button 
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                    onClick={() => {
                      navigate(`/adventure/${completionData.nextZone?.id}`);
                    }}
                  >
                    Explore New Area <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setMapCompletionModalOpen(false)}
                >
                  Continue Exploring
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rewards Modal */}
      {showRewardsModal && completionData && completionData.rewards && (
        <RewardsModal
          isOpen={showRewardsModal}
          onClose={() => {
            setShowRewardsModal(false);
            setRewardsClaimed(true);
            // After showing the rewards, refresh the data
            queryClient.invalidateQueries({ queryKey: ["/api/map-zones"] });
            queryClient.invalidateQueries({ queryKey: ["/api/child-profiles", childId] });
            
            // Show a toast congratulating the player
            toast({
              title: "Rewards Claimed!",
              description: completionData.nextZone 
                ? `You've unlocked the ${completionData.nextZone.name}!` 
                : "Keep exploring to discover more areas!",
              variant: "default"
            });
            
            // If there's a next zone available, navigate there after a short delay
            if (completionData.nextZone) {
              setTimeout(() => {
                // In a real implementation, you would navigate to the next zone
                // This is a placeholder for now
                toast({
                  title: "New Area Available!",
                  description: `${completionData.nextZone.name} is now ready for adventure!`,
                  variant: "default"
                });
              }, 1500);
            }
          }}
          rewards={completionData.rewards}
          zoneName={zone.name}
          nextZoneName={completionData.nextZone?.name}
        />
      )}
    </div>
  );
}
