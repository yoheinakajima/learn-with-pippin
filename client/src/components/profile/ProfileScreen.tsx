import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Zap, 
  Trophy, 
  Coins, 
  Gamepad2, 
  BookOpen, 
  Medal, 
  Key, 
  LineChart, 
  Clock,
  Map,
  Wand2,
  UserCircle,
  Calendar,
  Star,
  Award,
  Crown,
  Lightbulb,
  CheckCircle
} from "lucide-react";
import { ChildProfile, InventoryItem, Item } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileScreenProps {
  childId: number;
}

export function ProfileScreen({ childId }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Fetch child profile
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
  
  // Fetch inventory items
  const { data: inventoryItems = [], isLoading: inventoryLoading } = useQuery<(InventoryItem & { details?: Item })[]>({
    queryKey: ["/api/child-profiles", childId, "inventory"],
    queryFn: async () => {
      const res = await fetch(`/api/child-profiles/${childId}/inventory`);
      if (!res.ok) {
        throw new Error("Failed to fetch inventory");
      }
      return res.json();
    },
  });
  
  // Calculate XP needed for next level
  const calculateNextLevelXP = (level: number) => {
    return Math.pow(level, 2) * 100;
  };

  if (profileLoading) {
    return <div className="flex items-center justify-center h-64"><span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></span></div>;
  }
  
  if (!childProfile) {
    return <div className="text-center p-6">Profile not found</div>;
  }
  
  // Calculate progress to next level
  const xpForCurrentLevel = calculateNextLevelXP(childProfile.level);
  const xpForNextLevel = calculateNextLevelXP(childProfile.level + 1);
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = Math.min(100, Math.round(((childProfile.xp - xpForCurrentLevel) / xpNeeded) * 100));
  
  // Sample achievements data - in a real app, this would come from the API
  const achievements = [
    { name: "First Steps", description: "Complete your first zone", completed: true, icon: <Map className="h-5 w-5" /> },
    { name: "Treasure Hunter", description: "Collect 5 rare items", completed: false, icon: <Wand2 className="h-5 w-5" /> },
    { name: "Knowledge Seeker", description: "Complete 10 lessons", completed: true, icon: <BookOpen className="h-5 w-5" /> },
    { name: "Game Master", description: "Win 15 mini-games", completed: false, icon: <Gamepad2 className="h-5 w-5" /> },
    { name: "Key Collector", description: "Collect 3 magical keys", completed: !!childProfile.keys && (childProfile.keys as string[]).length >= 3, icon: <Key className="h-5 w-5" /> },
  ];
  
  // Sample recent activity - in a real app, this would come from the API
  const recentActivity = [
    { type: "lesson", name: "Potion Making Basics", date: "2 days ago", xp: 150, icon: <BookOpen className="h-5 w-5 text-primary" /> },
    { type: "game", name: "Math Challenge", date: "3 days ago", xp: 120, icon: <Gamepad2 className="h-5 w-5 text-accent" /> },
    { type: "achievement", name: "First Steps", date: "4 days ago", xp: 200, icon: <Medal className="h-5 w-5 text-yellow-500" /> },
    { type: "zone", name: "Enchanted Forest", date: "1 week ago", xp: 300, icon: <Map className="h-5 w-5 text-green-500" /> },
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className={`h-24 w-24 rounded-full flex items-center justify-center text-white text-2xl font-bold`} 
               style={{ backgroundColor: `var(--${childProfile.avatarColor})` }}>
            {childProfile.name.charAt(0)}
          </div>
          
          {/* Profile Info */}
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-2xl font-bold mb-1">{childProfile.name}</h1>
            <p className="text-gray-600 mb-3">Age: {childProfile.age} • Level {childProfile.level} Wizard</p>
            
            {/* Level Progress */}
            <div className="max-w-md mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Level {childProfile.level}</span>
                <span>Level {childProfile.level + 1}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary rounded-full" style={{ width: `${xpProgress}%` }}></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {childProfile.xp} / {xpForNextLevel} XP ({xpProgress}%)
              </div>
            </div>
            
            {/* Stats Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="outline" className="bg-primary/10 gap-1">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span>{childProfile.stats.magicPower} Magic</span>
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-blue-500" />
                <span>{childProfile.stats.wisdom} Wisdom</span>
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 gap-1">
                <Zap className="h-3.5 w-3.5 text-green-500" />
                <span>{childProfile.stats.agility} Agility</span>
              </Badge>
              <Badge variant="outline" className="bg-yellow-500/10 gap-1">
                <Coins className="h-3.5 w-3.5 text-yellow-500" />
                <span>{childProfile.coins} Coins</span>
              </Badge>
              <Badge variant="outline" className="bg-orange-500/10 gap-1">
                <Key className="h-3.5 w-3.5 text-orange-500" />
                <span>{childProfile.keys ? (childProfile.keys as string[]).length : 0} Keys</span>
              </Badge>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-col gap-2 min-w-[120px]">
            <Link href="/master-map">
              <Button className="w-full">
                <Map className="h-4 w-4 mr-1" />
                World Map
              </Button>
            </Link>
            <Link href={`/inventory/${childId}`}>
              <Button variant="outline" className="w-full">
                <Wand2 className="h-4 w-4 mr-1" />
                Inventory
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Rank */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {childProfile.level < 5 ? (
                      <Award className="h-8 w-8 text-primary" />
                    ) : childProfile.level < 10 ? (
                      <Medal className="h-8 w-8 text-amber-500" />
                    ) : (
                      <Crown className="h-8 w-8 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {childProfile.level < 5 ? "Apprentice Wizard" : 
                       childProfile.level < 10 ? "Journeyman Wizard" : 
                       "Master Wizard"}
                    </h3>
                    <p className="text-sm text-gray-500">Level {childProfile.level}</p>
                  </div>
                </div>
                <Badge className="bg-primary">
                  {childProfile.xp} XP
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Achievements */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Achievements</CardTitle>
              <CardDescription>Your latest magical feats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.filter(a => a.completed).slice(0, 3).map((achievement, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div className="p-2 bg-green-100 rounded-full text-green-700">
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                    <div className="ml-auto">
                      <Medal className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" onClick={() => setActiveTab("achievements")}>
                View All Achievements
              </Button>
            </CardFooter>
          </Card>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Your magical journey so far</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.slice(0, 3).map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div className="p-2 bg-blue-100 rounded-full">
                      {activity.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{activity.name}</h4>
                      <p className="text-xs text-gray-500">{activity.type} • {activity.date}</p>
                    </div>
                    <div className="ml-auto">
                      <Badge variant="outline" className="bg-blue-50">
                        +{activity.xp} XP
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" onClick={() => setActiveTab("activity")}>
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Magical Achievements</CardTitle>
              <CardDescription>Track your progress on your wizarding journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${achievement.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className={`p-3 rounded-full ${achievement.completed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <div className="ml-auto">
                      {achievement.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <div className="text-sm text-gray-500">In progress</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Magical Journey</CardTitle>
              <CardDescription>A chronicle of your adventures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-0 top-0 h-8 w-8 rounded-full bg-white flex items-center justify-center border-2 border-gray-200">
                        {activity.icon}
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium">{activity.name}</h4>
                          <Badge variant="outline">{activity.date}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {activity.type === "lesson" ? "Completed a magical lesson" :
                           activity.type === "game" ? "Won a magical challenge" :
                           activity.type === "achievement" ? "Earned an achievement" :
                           "Completed a magical zone"}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {activity.date}
                          </span>
                          <Badge className="bg-primary">+{activity.xp} XP</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Character Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Character Stats</CardTitle>
                <CardDescription>Your magical abilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-2">
                        <Zap className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>Magic Power</span>
                    </div>
                    <span className="font-medium">{childProfile.stats.magicPower}</span>
                  </div>
                  <Progress value={childProfile.stats.magicPower * 10} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                        <Lightbulb className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>Wisdom</span>
                    </div>
                    <span className="font-medium">{childProfile.stats.wisdom}</span>
                  </div>
                  <Progress value={childProfile.stats.wisdom * 10} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                        <Zap className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>Agility</span>
                    </div>
                    <span className="font-medium">{childProfile.stats.agility}</span>
                  </div>
                  <Progress value={childProfile.stats.agility * 10} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            {/* Game Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Game Progress</CardTitle>
                <CardDescription>Your adventure statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                      <h3 className="font-medium">Level</h3>
                    </div>
                    <p className="text-2xl font-bold">{childProfile.level}</p>
                    <p className="text-xs text-gray-500">Next: {xpForNextLevel - childProfile.xp} XP needed</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-yellow-500 mr-2" />
                      <h3 className="font-medium">XP</h3>
                    </div>
                    <p className="text-2xl font-bold">{childProfile.xp}</p>
                    <p className="text-xs text-gray-500">Total experience earned</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Coins className="h-5 w-5 text-yellow-500 mr-2" />
                      <h3 className="font-medium">Coins</h3>
                    </div>
                    <p className="text-2xl font-bold">{childProfile.coins}</p>
                    <p className="text-xs text-gray-500">Available to spend</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Wand2 className="h-5 w-5 text-purple-500 mr-2" />
                      <h3 className="font-medium">Items</h3>
                    </div>
                    <p className="text-2xl font-bold">{inventoryItems.length}</p>
                    <p className="text-xs text-gray-500">Magical items collected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}