import { useEffect, useState } from "react";
import { LeftHeaderLayout } from "@/components/layout/LeftHeaderLayout";
import { ChildProfileForm } from "@/components/dashboard/ChildProfileForm";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuth } from "@/hooks/use-auth";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  ChildProfile as ChildProfileType,
  LessonCompletion,
  AnswerHistory,
  InventoryItem,
  Item,
  MapZone
} from "@/lib/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BarChart2,
  Book,
  Brain,
  CheckCircle2,
  Clock,
  Edit2,
  Flame,
  LockIcon,
  Map,
  Medal,
  Puzzle,
  Star,
  Sparkles,
  Wand2
} from "lucide-react";

export default function ChildProfilePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  // Determine if this is create mode or view mode
  const isCreateMode = !params.id;

  // Redirect if not logged in or not a parent
  useEffect(() => {
    if (user && user.role !== "parent") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch child profile if in view mode
  const { data: childProfile, isLoading: profileLoading } = useQuery<ChildProfileType>({
    queryKey: ["/api/child-profiles", Number(params.id)],
    enabled: !!params.id && !!user,
  });

  // Fetch profile related data if viewing a profile
  const { data: lessonCompletions = [] } = useQuery<LessonCompletion[]>({
    queryKey: ["/api/child-profiles", Number(params.id), "lesson-completions"],
    enabled: !!params.id && !!user,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/child-profiles/${params.id}/lesson-completions`);
      return await res.json();
    }
  });

  const { data: answerHistory = [] } = useQuery<AnswerHistory[]>({
    queryKey: ["/api/child-profiles", Number(params.id), "answer-history"],
    enabled: !!params.id && !!user,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/child-profiles/${params.id}/answer-history`);
      return await res.json();
    }
  });

  const { data: inventoryItems = [] } = useQuery<(InventoryItem & { details?: Item })[]>({
    queryKey: ["/api/child-profiles", Number(params.id), "inventory"],
    enabled: !!params.id && !!user,
  });

  // Compute some stats
  const correctAnswers = answerHistory.filter(a => a.isCorrect).length;
  const totalAnswers = answerHistory.length;
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  const completedLessons = lessonCompletions.length;

  // Calculate XP needed for next level
  const xpForNextLevel = childProfile ? childProfile.level * 500 : 500;
  const xpProgress = childProfile ? Math.min((childProfile.xp / xpForNextLevel) * 100, 100) : 0;

  // Go back to parent dashboard
  const handleBackClick = () => {
    navigate("/");
  };

  // Mock achievements data (would be fetched from backend in a real implementation)
  const achievements = [
    { id: 1, name: "First Steps", description: "Complete your first lesson", earned: completedLessons > 0, icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
    { id: 2, name: "Quick Learner", description: "Answer 5 questions correctly in a row", earned: correctAnswers >= 5, icon: <Flame className="h-4 w-4 text-orange-500" /> },
    { id: 3, name: "Treasure Hunter", description: "Collect 3 magical items", earned: inventoryItems.length >= 3, icon: <Sparkles className="h-4 w-4 text-purple-500" /> },
    { id: 4, name: "Knowledge Seeker", description: "Complete 5 lessons", earned: completedLessons >= 5, icon: <Brain className="h-4 w-4 text-blue-500" /> },
    { id: 5, name: "Wizard Apprentice", description: "Reach level 5", earned: (childProfile?.level ?? 0) >= 5, icon: <Wand2 className="h-4 w-4 text-violet-500" /> },
  ];

  if (!user) return null;

  if (isCreateMode) {
    return (

      <LeftHeaderLayout>
        <div className="flex-grow container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-heading font-bold mb-6">Create Child Profile</h2>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <ChildProfileForm />
            </div>
          </div>
        </div>
        <MobileNav />
      </LeftHeaderLayout>
    );
  }

  if (profileLoading || !childProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-20 w-20 bg-primary bg-opacity-20 rounded-full mb-4"></div>
          <div className="h-6 w-40 bg-primary bg-opacity-20 rounded mb-2"></div>
          <div className="h-4 w-24 bg-primary bg-opacity-10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <LeftHeaderLayout>
      <div className="flex-grow container mx-auto px-4 py-6">
        <div className="flex flex-start items-center mb-6 bg-white rounded-md p-4 shadow-md backdrop-blur-sm">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-heading font-bold">{childProfile.name}'s Profile</h1>
        </div>

        {/* Profile header card */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                {/* Avatar */}
                <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-md shrink-0">
                  <div className={`h-20 w-20 rounded-full bg-${childProfile.avatarColor} flex items-center justify-center text-white font-bold text-2xl`}>
                    {childProfile.name.charAt(0)}
                  </div>
                </div>

                {/* Profile info */}
                <div className="flex-grow text-center sm:text-left">
                  <div className="mb-4">
                    <div className="flex items-center justify-center sm:justify-start mb-1 gap-2">
                      <h2 className="text-xl font-bold">{childProfile.name}</h2>
                      <Badge variant="outline" className="ml-2">Level {childProfile.level}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Age: {childProfile.age} • Coins: {childProfile.coins} • Items: {inventoryItems.length}</p>

                    {/* XP Progress bar */}
                    <div className="max-w-md">
                      <div className="flex justify-between text-xs mb-1">
                        <span>XP: {childProfile.xp} / {xpForNextLevel}</span>
                        <span>{Math.round(xpProgress)}% to Level {childProfile.level + 1}</span>
                      </div>
                      <Progress value={xpProgress} className="h-2" />
                    </div>
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-primary bg-opacity-5 rounded-lg p-3 text-center">
                      <Book className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="text-sm font-medium">Lessons</div>
                      <div className="text-xl font-bold">{completedLessons}</div>
                    </div>

                    <div className="bg-secondary bg-opacity-5 rounded-lg p-3 text-center">
                      <Puzzle className="h-5 w-5 mx-auto mb-1 text-secondary" />
                      <div className="text-sm font-medium">Accuracy</div>
                      <div className="text-xl font-bold">{accuracy}%</div>
                    </div>

                    <div className="bg-accent bg-opacity-5 rounded-lg p-3 text-center">
                      <Brain className="h-5 w-5 mx-auto mb-1 text-accent" />
                      <div className="text-sm font-medium">Magic Power</div>
                      <div className="text-xl font-bold">{childProfile.stats.magicPower}</div>
                    </div>

                    <div className="bg-purple-100 rounded-lg p-3 text-center">
                      <Medal className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                      <div className="text-sm font-medium">Achievements</div>
                      <div className="text-xl font-bold">{achievements.filter(a => a.earned).length}/{achievements.length}</div>
                    </div>
                  </div>
                </div>

                {/* Edit button */}
                <div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different profile sections */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lessonCompletions.length === 0 && answerHistory.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No recent activity yet.</p>
                      <p className="text-sm mt-2">Start a learning adventure to see activity here!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Display last 5 activities chronologically */}
                      {lessonCompletions.slice(0, 3).map((completion) => (
                        <div key={completion.id} className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Book className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Completed a lesson</p>
                            <p className="text-sm text-muted-foreground">Score: {completion.score}%</p>
                            <p className="text-xs text-muted-foreground">{new Date(completion.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}

                      {answerHistory.slice(0, 3).map((answer) => (
                        <div key={answer.id} className="flex items-start">
                          <div className={`h-8 w-8 rounded-full ${answer.isCorrect ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center mr-3`}>
                            {answer.isCorrect ?
                              <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                              <div className="h-1 w-4 bg-red-600 rounded-full"></div>
                            }
                          </div>
                          <div>
                            <p className="font-medium">{answer.isCorrect ? 'Correct answer' : 'Incorrect answer'}</p>
                            <p className="text-xs text-muted-foreground">{new Date(answer.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Achievements preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Medal className="h-5 w-5 mr-2" />
                    Achievements
                  </CardTitle>
                  <CardDescription>
                    {achievements.filter(a => a.earned).length} of {achievements.length} achievements earned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {achievements.filter(a => a.earned).slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center p-3 bg-primary/5 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          {achievement.icon}
                        </div>
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <Badge className="ml-auto" variant="default">Earned</Badge>
                      </div>
                    ))}

                    {achievements.filter(a => a.earned).length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No achievements earned yet.</p>
                        <p className="text-sm mt-2">Complete lessons and activities to earn achievements!</p>
                      </div>
                    )}

                    {achievements.filter(a => a.earned).length > 0 && (
                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => setActiveTab("achievements")}
                      >
                        View All Achievements
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Learning stats */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2" />
                    Learning Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Total Questions</span>
                      <span className="text-3xl font-bold">{totalAnswers}</span>
                      <div className="mt-2 text-sm text-muted-foreground flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span>{correctAnswers} correct</span>
                        <div className="w-3 h-3 bg-red-500 rounded-full ml-3 mr-1"></div>
                        <span>{totalAnswers - correctAnswers} incorrect</span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Lessons Completed</span>
                      <span className="text-3xl font-bold">{completedLessons}</span>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Average score: {lessonCompletions.length > 0
                          ? Math.round(lessonCompletions.reduce((acc, curr) => acc + curr.score, 0) / lessonCompletions.length)
                          : 0}%
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Magic Power</span>
                      <span className="text-3xl font-bold">{childProfile.stats.magicPower}</span>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Wisdom: {childProfile.stats.wisdom} • Agility: {childProfile.stats.agility}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Total Play Time</span>
                      <span className="text-3xl font-bold">-</span>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Tracking coming soon
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Track progress and earn rewards by completing special challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`flex items-center p-4 rounded-lg ${achievement.earned
                          ? 'bg-primary/5 border border-primary/20'
                          : 'bg-gray-100 border border-gray-200'
                        }`}
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 ${achievement.earned
                          ? 'bg-primary/10'
                          : 'bg-gray-200'
                        }`}>
                        {achievement.earned
                          ? achievement.icon
                          : <LockIcon className="h-5 w-5 text-gray-500" />
                        }
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge
                        variant={achievement.earned ? "default" : "outline"}
                        className={!achievement.earned ? "text-gray-500" : ""}
                      >
                        {achievement.earned ? "Earned" : "Locked"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Magical Items</CardTitle>
                <CardDescription>
                  Items collected during adventures with magical properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="mb-4">
                      <Wand2 className="h-12 w-12 mx-auto text-gray-300" />
                    </div>
                    <p>No magical items in inventory yet.</p>
                    <p className="text-sm mt-2">Complete quests and mini-games to earn magical items!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {inventoryItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${item.details?.rarity === 'Legendary' ? 'bg-yellow-100 text-yellow-600' :
                              item.details?.rarity === 'Epic' ? 'bg-purple-100 text-purple-600' :
                                item.details?.rarity === 'Rare' ? 'bg-blue-100 text-blue-600' :
                                  item.details?.rarity === 'Uncommon' ? 'bg-green-100 text-green-600' :
                                    'bg-gray-100 text-gray-600'
                            }`}>
                            <Wand2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{item.details?.name || "Magical Item"}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.details?.rarity || "Common"} • {item.equipped ? "Equipped" : "Not Equipped"}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {item.details?.description || "A magical item with special properties."}
                        </p>

                        {item.details?.statBoosts && (
                          <div className="text-xs space-y-1">
                            {item.details.statBoosts.magicPower > 0 && (
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-primary rounded-full mr-1"></div>
                                <span>+{item.details.statBoosts.magicPower} Magic Power</span>
                              </div>
                            )}
                            {item.details.statBoosts.wisdom > 0 && (
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                                <span>+{item.details.statBoosts.wisdom} Wisdom</span>
                              </div>
                            )}
                            {item.details.statBoosts.agility > 0 && (
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                <span>+{item.details.statBoosts.agility} Agility</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lesson History</CardTitle>
                </CardHeader>
                <CardContent>
                  {lessonCompletions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Book className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p>No lessons completed yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lessonCompletions.map((completion) => (
                        <div key={completion.id} className="flex items-start p-3 border rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Book className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium">Lesson #{completion.lessonId}</p>
                            <div className="flex items-center mt-1">
                              <div className="flex-grow mr-4">
                                <div className="h-2 bg-gray-200 rounded-full">
                                  <div
                                    className="h-2 bg-green-500 rounded-full"
                                    style={{ width: `${completion.score}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-sm font-medium">{completion.score}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Completed on {new Date(completion.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quiz Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {answerHistory.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Puzzle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p>No quiz answers recorded yet.</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Accuracy</span>
                          <span className="text-sm font-medium">{accuracy}%</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full">
                          <div
                            className="h-4 bg-primary rounded-full"
                            style={{ width: `${accuracy}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {answerHistory.slice(0, 10).map((answer) => (
                          <div
                            key={answer.id}
                            className={`p-2 rounded-lg text-sm ${answer.isCorrect
                                ? 'bg-green-100 border border-green-200'
                                : 'bg-red-100 border border-red-200'
                              }`}
                          >
                            <div className="flex items-center">
                              {answer.isCorrect
                                ? <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                : <div className="h-4 w-4 rounded-full bg-red-200 flex items-center justify-center mr-2">
                                  <div className="h-0.5 w-2 bg-red-600 rounded-full"></div>
                                </div>
                              }
                              <span className="text-gray-800">
                                Question #{answer.questionId}
                              </span>
                              <span className="ml-auto text-xs text-gray-500">
                                {new Date(answer.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Learning Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Favorite Subjects</h3>
                      <div className="space-y-2">
                        {childProfile.preferences.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary" className="mr-2">
                            {subject}
                          </Badge>
                        ))}

                        {childProfile.preferences.subjects.length === 0 && (
                          <p className="text-sm text-muted-foreground">No preferred subjects set.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-3">Difficulty Level</h3>
                      <Badge>
                        {childProfile.preferences.difficulty.charAt(0).toUpperCase() +
                          childProfile.preferences.difficulty.slice(1)}
                      </Badge>

                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-1">Reading Level</h3>
                        <div className="flex items-center">
                          <span className="text-sm mr-3">1</span>
                          <div className="flex-grow h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${(childProfile.preferences.readingLevel / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm ml-3">10</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-1">Math Level</h3>
                        <div className="flex items-center">
                          <span className="text-sm mr-3">1</span>
                          <div className="flex-grow h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${(childProfile.preferences.mathLevel / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm ml-3">10</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-3">Learning Settings</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">
                            {childProfile.preferences.skipKnownLessons
                              ? "Skip known lessons: Enabled"
                              : "Skip known lessons: Disabled"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit Preferences
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <MobileNav />
    </LeftHeaderLayout>
  );
}
