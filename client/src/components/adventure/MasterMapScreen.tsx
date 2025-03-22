import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { MasterMap, ChildProfile, MapNode, MasterMapGate } from "@/lib/types";
import { MapSvg } from "./MapSvg";
import { PlayerStats } from "./PlayerStats";
import { InventoryPreview } from "./InventoryPreview";
import { PippinHint, FloatingPippinHint } from "@/components/ui/pippin-hint";
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
  Key,
  Gift as GiftIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { childProfileService, gameService, mapService } from "@/services";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface MasterMapScreenProps {
  masterMap: MasterMap;
  childId: number;
}

export function MasterMapScreen({ masterMap, childId }: MasterMapScreenProps) {
  // Setup toast and query client
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
  // Fetch child profile for stats and inventory
  const { data: childProfile, isLoading: profileLoading } = useQuery<ChildProfile>({
    queryKey: ["/api/child-profiles", childId],
    queryFn: () => childProfileService.getChildProfile(childId),
  });

  // Fetch gates for the master map
  const { data: gates = [], isLoading: gatesLoading } = useQuery<MasterMapGate[]>({
    queryKey: ["/api/master-maps", masterMap.id, "gates"],
    queryFn: async () => {
      const res = await fetch(`/api/master-maps/${masterMap.id}/gates`);
      if (!res.ok) {
        throw new Error("Failed to fetch master map gates");
      }
      return res.json();
    },
  });

  // State for node info modal
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [isGateModal, setIsGateModal] = useState<boolean>(false);
  const [selectedGate, setSelectedGate] = useState<MasterMapGate | null>(null);
  
  // Get progress through current master map
  const availableNodes = masterMap.config.nodes.filter(n => n.status === "available" || n.status === "current").length;
  const completedNodes = masterMap.config.nodes.filter(n => n.status === "completed").length;
  const totalNodes = masterMap.config.nodes.length;
  const mapProgress = Math.round((completedNodes / totalNodes) * 100);
  
  // XP to next level calculation
  const xpToNextLevel = childProfile ? Math.pow(childProfile.level, 2) * 100 : 0;
  const xpProgress = childProfile ? Math.min(100, Math.round((childProfile.xp / xpToNextLevel) * 100)) : 0;
  
  // Handle node selection
  const handleNodeSelect = (node: MapNode) => {
    setSelectedNode(node);
    
    // Check if this node is a gate
    const gate = gates.find(g => g.nodeId === node.id);
    if (gate) {
      setSelectedGate(gate);
      setIsGateModal(true);
    } else {
      setIsGateModal(false);
      setSelectedGate(null);
    }
    
    setInfoModalOpen(true);
  };
  
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
      case "zone":
        return <Map className="h-5 w-5 text-purple-500" />;
      case "gate":
        return <Key className="h-5 w-5 text-orange-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Check if a child has the keys to unlock a gate
  const canUnlockGate = (gate: MasterMapGate) => {
    if (!childProfile || !childProfile.keys) return false;
    
    const childKeys = childProfile.keys as string[];
    return gate.requiredKeys.every(key => childKeys.includes(key));
  };
  
  // Function to check and unlock a gate
  const checkGate = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/master-maps/${masterMap.id}/node/${nodeId}/check-gate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to check gate");
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Gate unlocked successfully
        queryClient.invalidateQueries({ queryKey: ["/api/master-maps"] });
        queryClient.invalidateQueries({ queryKey: ["/api/child-profiles", childId] });
        
        toast({
          title: "Gate Unlocked!",
          description: data.message || "You've successfully unlocked a new area!",
          variant: "default",
        });
        
        setInfoModalOpen(false);
      } else {
        // Missing required keys
        toast({
          title: "Gate Locked",
          description: data.message || "You don't have the required keys to unlock this gate.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error checking gate:", error);
      toast({
        title: "Error",
        description: "There was a problem checking the gate. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Navigate to zone when selecting a zone node
  const enterZone = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/master-maps/${masterMap.id}/node/${nodeId}/enter-zone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to enter zone");
      }
      
      const data = await response.json();
      
      if (data.success && data.zoneId) {
        // Navigate to the zone
        navigate(`/adventure/${data.zoneId}`);
      } else {
        toast({
          title: "Error",
          description: "Unable to find the selected zone.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error entering zone:", error);
      toast({
        title: "Error",
        description: "There was a problem accessing the zone. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="sticky top-0 z-10 bg-gray-100 bg-opacity-95 py-2 px-4 -mx-4 backdrop-blur-sm rounded-lg mb-6">
        <div className="flex flex-wrap justify-between items-center">
          <h2 className="text-2xl font-heading font-bold flex items-center">
            <Globe className="h-6 w-6 mr-2 text-primary" />
            {masterMap.name}
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
                
                {/* Keys */}
                <div className="bg-white rounded-lg shadow px-3 py-2 flex items-center">
                  <Key className="h-5 w-5 text-orange-500 mr-1" />
                  <span className="font-bold">{childProfile.keys ? (childProfile.keys as string[]).length : 0}</span>
                </div>
                
                {/* Zone Progress */}
                <div className="bg-white rounded-lg shadow px-3 py-2">
                  <div className="flex items-center">
                    <Flag className="h-5 w-5 text-secondary mr-1" />
                    <span className="font-medium">{completedNodes}/{totalNodes} Completed</span>
                  </div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                    <div className="h-2 bg-secondary rounded-full" style={{ width: `${mapProgress}%` }}></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Map with Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
            {/* Map Description with Pippin */}
            <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-lg">
              <div className="flex items-start gap-3">
                <PippinHint 
                  hint="This is the Master Map of all learning zones! Each zone contains different educational challenges and rewards."
                  size="md"
                />
                <p className="text-gray-700">{masterMap.description}</p>
              </div>
            </div>
            
            {/* SVG Map Background */}
            <div className="w-full h-[500px] lg:h-[600px] relative rounded-lg overflow-hidden bg-gradient-to-b from-purple-100 to-indigo-200">
              <MapSvg config={masterMap.config} onNodeSelect={handleNodeSelect} />
            </div>
            
            {/* Map Selection */}
            <div className="absolute top-6 right-6 bg-white rounded-lg shadow-md p-2">
              <Button variant="ghost" className="p-2 bg-primary bg-opacity-20 rounded-lg mb-2">
                <Globe className="h-6 w-6 text-primary" />
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
                  <span className="text-xs">Zone</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-xs">Gate</span>
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
          
          {/* Keys Display */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="font-medium mb-4 flex items-center">
              <Key className="h-5 w-5 text-orange-500 mr-2" />
              Your Keys
            </h3>
            <div className="space-y-2">
              {childProfile?.keys && (childProfile.keys as string[]).length > 0 ? (
                (childProfile.keys as string[]).map((key, index) => (
                  <div key={index} className="flex items-center p-2 bg-orange-50 rounded-lg">
                    <Key className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="text-sm font-medium">{key}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 p-2">
                  <p>No keys yet. Complete zones to earn keys!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="font-medium mb-4 flex items-center">
              <Zap className="h-5 w-5 text-secondary mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href="/adventure">
                <Button className="w-full bg-primary text-white hover:bg-opacity-90 flex items-center justify-center">
                  <Map className="h-4 w-4 mr-2" />
                  Adventure Zone
                </Button>
              </Link>
              <Link href="/inventory/1">
                <Button className="w-full bg-accent text-white hover:bg-opacity-90 flex items-center justify-center">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Node Information Modal */}
      <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedNode && (
                <>
                  {getNodeIcon(selectedNode.type, selectedNode.status)}
                  <span className="ml-2">
                    {isGateModal ? "Magical Gate" : (
                      selectedNode.type === "zone" ? "Adventure Zone" : 
                      selectedNode.type === "mini-game" ? "Mini Game" : 
                      selectedNode.type === "lesson" ? "Magic Lesson" : 
                      "Adventure Node"
                    )}
                  </span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isGateModal && selectedGate ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <PippinHint 
                      hint="Gates require specific magical keys to unlock. Complete adventure zones to collect keys!"
                      size="sm"
                    />
                    <p>{selectedGate.description}</p>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h4 className="font-medium text-orange-700 mb-2 flex items-center">
                      <Key className="h-4 w-4 mr-2" /> Required Keys:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGate.requiredKeys.map((key, index) => (
                        <span 
                          key={index}
                          className={`px-2 py-1 rounded-md text-sm ${
                            childProfile?.keys && (childProfile.keys as string[]).includes(key)
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {key}
                          {childProfile?.keys && (childProfile.keys as string[]).includes(key) && (
                            <CheckCircle className="h-3 w-3 ml-1 inline" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      className="w-full" 
                      disabled={!canUnlockGate(selectedGate)}
                      onClick={() => checkGate(selectedGate.nodeId)}
                    >
                      {canUnlockGate(selectedGate) ? (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          Unlock Gate
                        </>
                      ) : (
                        <>
                          <LockKeyhole className="h-4 w-4 mr-2" />
                          Missing Required Keys
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : selectedNode && selectedNode.type === "zone" ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <PippinHint 
                      hint="Adventure zones have educational challenges and magical rewards. Complete them to earn keys!"
                      size="sm"
                    />
                    <p>This node leads to an adventure zone where you can complete quests and earn rewards!</p>
                  </div>
                  
                  {selectedNode.status === "locked" ? (
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-gray-700 flex items-center">
                        <LockKeyhole className="h-4 w-4 mr-2" />
                        This zone is currently locked. Complete previous zones to unlock it.
                      </p>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => enterZone(selectedNode.id)}
                    >
                      <Map className="h-4 w-4 mr-2" />
                      Enter Adventure Zone
                    </Button>
                  )}
                </div>
              ) : (
                <p>Select nodes on the map to interact with different adventure zones and magical gates.</p>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      
      {/* Pippin the Unicorn Guide */}
      <FloatingPippinHint 
        hint={
          childProfile?.keys && (childProfile.keys as string[]).length > 0
            ? "You have magical keys! Look for gates to unlock with your keys and discover new areas."
            : "Welcome to the World Map! Click on adventure zones to explore and collect magical keys."
        } 
      />
    </div>
  );
}