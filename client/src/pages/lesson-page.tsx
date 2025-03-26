import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { LeftHeaderLayout } from "@/components/layout/LeftHeaderLayout";
import { MobileNav } from "@/components/layout/MobileNav";
import { Lesson, MapZone } from "@/lib/types";
import { Loader2, Book, ArrowLeft, Star, Award, Check, BarChart, Clock, Coins, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { learningService, progressService, mapService } from "@/services";
import { PippinHint, FloatingPippinHint } from '@/components/ui/pippin-hint';

export default function LessonPage() {
  const { activeChildSession } = useAuth();
  const params = useParams<{ lessonId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const lessonId = parseInt(params.lessonId);

  // Start timer for lesson engagement tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isCompleted) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCompleted]);

  // Redirect if no active child session
  useEffect(() => {
    if (!activeChildSession) {
      navigate("/");
    }
  }, [activeChildSession, navigate]);

  // Fetch lesson data using the service
  const { data: lesson, isLoading } = useQuery<Lesson>({
    queryKey: ["/api/lessons", lessonId],
    queryFn: () => learningService.getLesson(lessonId),
    enabled: !!activeChildSession && !isNaN(lessonId),
  });

  // Calculate the score based on engagement metrics
  const calculateScore = () => {
    // Base perfect score
    let score = 100;

    // If they spent too little time (less than 30 seconds), reduce score
    if (timeSpent < 30) {
      score = Math.max(70, score - (30 - timeSpent));
    }

    return score;
  };

  // Fetch map zones to find the current lesson node
  const { data: mapZones } = useQuery<MapZone[]>({
    queryKey: ["/api/map-zones"],
    queryFn: () => mapService.getAllMapZones(),
    enabled: !!activeChildSession
  });

  // Find the active node for this lesson (assumed to be of type 'lesson')
  const [activeNode, setActiveNode] = useState<{ zoneId: number, nodeId: string } | null>(null);

  // Find the map node that represents this lesson
  useEffect(() => {
    if (mapZones && lessonId) {
      // Find a zone with a lesson node that's current or available
      for (const zone of mapZones) {
        // Find a 'lesson' type node that's either 'current' or 'available'
        const lessonNode = zone.config.nodes.find(node =>
          (node.type === 'lesson' && (node.status === 'current' || node.status === 'available'))
        );

        if (lessonNode) {
          setActiveNode({ zoneId: zone.id, nodeId: lessonNode.id });
          break;
        }
      }
    }
  }, [mapZones, lessonId]);

  // Record lesson completion mutation using the service
  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      const score = calculateScore();

      // First record the lesson completion
      const completion = await learningService.recordLessonCompletion({
        childId: activeChildSession?.childId || 0,
        lessonId: lessonId,
        score: score,
      });

      // If we have an active node, update the map progress
      if (activeNode && activeChildSession) {
        try {
          // Mark the node as completed and update the map
          await progressService.completeQuest(
            activeNode.zoneId,
            activeNode.nodeId,
            activeChildSession.childId,
            'lesson',
            lessonId
          );
        } catch (err) {
          console.error("Error updating map progress:", err);
        }
      }

      return completion;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles", activeChildSession?.childId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/child-profiles", activeChildSession?.childId, "lesson-completions"]
      });
      queryClient.invalidateQueries({ queryKey: ["/api/map-zones"] });

      setIsCompleted(true);
      toast({
        title: "Lesson Completed!",
        description: `You've earned ${lesson?.xpReward} XP and ${lesson?.coinReward} coins.`,
      });
    },
  });

  const handleComplete = () => {
    if (!isCompleted) {
      completeLessonMutation.mutate();
    } else {
      navigate("/adventure");
    }
  };

  // Progress to next section
  const handleNextSection = () => {
    // If we're on the last section, complete the lesson
    if (currentSection >= 3) {
      handleComplete();
    } else {
      setCurrentSection(prev => prev + 1);
    }
  };

  // Generate dummy content sections if no lesson is loaded
  const generateDummyContent = () => {
    const sections = [
      {
        title: "Introduction to Magical Numbers",
        content: "Numbers are all around us in the magical world! In this lesson, we'll learn how to identify patterns and understand basic arithmetic in magical contexts."
      },
      {
        title: "Magical Addition",
        content: "When combining magical energies, we use addition. For example, if you have 3 crystal shards and find 4 more, you now have 7 crystal shards in total!"
      },
      {
        title: "Magical Subtraction",
        content: "Sometimes we need to use some of our magical items. If you have 10 potions and use 4 during your adventure, how many do you have left? That's right, 6 potions!"
      },
      {
        title: "Practice Time",
        content: "Now let's practice what we've learned. Try solving these magical math problems on your own adventure!"
      }
    ];

    return sections[currentSection];
  };

  const content = generateDummyContent();

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

  // If no lesson is found, display error
  if (!lesson && !isNaN(lessonId)) {
    return (
      <LeftHeaderLayout>
        <div className="flex-grow container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
          <p className="text-gray-600 mb-8">The lesson you're looking for doesn't exist yet.</p>
          <Button
            className="bg-primary text-white px-6 py-2 rounded-lg"
            onClick={() => navigate("/adventure")}
          >
            Return to Map
          </Button>
        </div>
        <MobileNav />
      </LeftHeaderLayout>
    );
  }

  return (
    <LeftHeaderLayout>
      <div className="flex-grow container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Lesson Header */}
          <div className="bg-gradient-to-r from-primary to-purple-600 p-4 text-white">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-heading font-bold">{lesson?.title || "Magical Math Lesson"}</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Book className="h-5 w-5 mr-1" />
                  <span>{currentSection + 1}/4</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-1" />
                  <span>{lesson?.xpReward || 30} XP</span>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="w-full bg-white bg-opacity-30 h-2 rounded-full overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentSection + 1) * 25}%` }}
              ></div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className={`p-6 ${isCompleted ? 'hidden' : ''} relative`}>
            <div className="absolute top-3 right-3">
              <FloatingPippinHint
                hint={currentSection === 0 ? "Welcome to your magical lesson! I'll guide you through this adventure." :
                  currentSection === 1 ? "Great progress! Let's learn about magical addition." :
                    currentSection === 2 ? "You're doing wonderfully! Now for magical subtraction." :
                      "You're almost finished! Let's practice what you've learned."}
              />
            </div>
            <h3 className="text-xl font-medium mb-4">{content.title}</h3>

            <div className="prose max-w-none mb-8">
              <p>{content.content}</p>

              {/* Add a nice illustration */}
              {currentSection === 1 && (
               <div className="flex justify-center my-6">
               <div className="relative w-full max-w-md h-48">
                 <svg viewBox="0 0 240 120" className="w-full h-full">
                   {/* First group - 3 crystals */}
                   <g transform="translate(40, 50)">
                     {/* Crystal 1 */}
                     <path d="M0,0 L-8,-25 L8,-25 Z" fill="url(#crystal1)" />
                     <path d="M0,0 L-8,-25 L-12,-10 Z" fill="#7E57C2" opacity="0.7" />
                     <path d="M0,0 L8,-25 L12,-10 Z" fill="#5E35B1" opacity="0.6" />
                     
                     {/* Crystal 2 */}
                     <path d="M-15,0 L-23,-20 L-7,-20 Z" fill="url(#crystal2)" />
                     <path d="M-15,0 L-23,-20 L-25,-8 Z" fill="#9C27B0" opacity="0.7" />
                     
                     {/* Crystal 3 */}
                     <path d="M15,0 L7,-22 L23,-22 Z" fill="url(#crystal3)" />
                     <path d="M15,0 L23,-22 L22,-8 Z" fill="#4527A0" opacity="0.7" />
                     
                     {/* Sparkles */}
                     <circle cx="-5" cy="-15" r="1" fill="white" />
                     <circle cx="10" cy="-12" r="0.8" fill="white" />
                     <circle cx="-12" cy="-10" r="0.5" fill="white" />
                   </g>
                   
                   {/* Plus sign in decorative circle */}
                   <g transform="translate(80, 50)">
                     <circle cx="0" cy="0" r="10" fill="url(#plusGradient)" />
                     <path d="M-5,0 L5,0 M0,-5 L0,5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                   </g>
                   
                   {/* Second group - 4 crystals */}
                   <g transform="translate(120, 50)">
                     {/* Crystal 1 */}
                     <path d="M0,0 L-8,-25 L8,-25 Z" fill="url(#crystal1)" />
                     <path d="M0,0 L-8,-25 L-12,-10 Z" fill="#7E57C2" opacity="0.7" />
                     
                     {/* Crystal 2 */}
                     <path d="M-15,0 L-23,-20 L-7,-20 Z" fill="url(#crystal2)" />
                     <path d="M-15,0 L-23,-20 L-25,-8 Z" fill="#9C27B0" opacity="0.7" />
                     
                     {/* Crystal 3 */}
                     <path d="M15,0 L7,-22 L23,-22 Z" fill="url(#crystal3)" />
                     <path d="M15,0 L23,-22 L22,-8 Z" fill="#4527A0" opacity="0.7" />
                     
                     {/* Crystal 4 (extra) */}
                     <path d="M25,0 L17,-18 L33,-18 Z" fill="url(#crystal4)" />
                     <path d="M25,0 L33,-18 L32,-6 Z" fill="#311B92" opacity="0.6" />
                     
                     {/* Sparkles */}
                     <circle cx="-5" cy="-15" r="1" fill="white" />
                     <circle cx="10" cy="-12" r="0.8" fill="white" />
                     <circle cx="20" cy="-10" r="0.5" fill="white" />
                   </g>
                   
                   {/* Equals sign in decorative rectangle */}
                   <g transform="translate(160, 50)">
                     <rect x="-10" y="-10" width="20" height="20" rx="5" fill="url(#equalsGradient)" />
                     <path d="M-5,-3 L5,-3 M-5,3 L5,3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                   </g>
                   
                   {/* Third group - 7 crystals (result) */}
                   <g transform="translate(200, 50)">
                     {/* Just showing a dense cluster - would be too crowded to show all 7 in detail */}
                     <path d="M0,0 L-8,-25 L8,-25 Z" fill="url(#crystal1)" />
                     <path d="M-15,0 L-23,-20 L-7,-20 Z" fill="url(#crystal2)" />
                     <path d="M15,0 L7,-22 L23,-22 Z" fill="url(#crystal3)" />
                     <path d="M25,0 L17,-18 L33,-18 Z" fill="url(#crystal4)" />
                     <path d="M-25,0 L-33,-15 L-17,-15 Z" fill="url(#crystal5)" />
                     <path d="M-5,-5 L-13,-28 L3,-28 Z" fill="url(#crystal1)" transform="scale(0.8)" />
                     <path d="M10,-7 L2,-26 L18,-26 Z" fill="url(#crystal3)" transform="scale(0.75)" />
                     
                     {/* Extra decorative elements for the result cluster */}
                     <path d="M0,0 L-8,-25 L-12,-10 Z" fill="#7E57C2" opacity="0.4" />
                     <path d="M-15,0 L-23,-20 L-25,-8 Z" fill="#9C27B0" opacity="0.4" />
                     <path d="M15,0 L23,-22 L22,-8 Z" fill="#4527A0" opacity="0.4" />
                     
                     {/* More sparkles for the result */}
                     <circle cx="-5" cy="-15" r="1" fill="white" />
                     <circle cx="10" cy="-12" r="0.8" fill="white" />
                     <circle cx="-12" cy="-10" r="0.5" fill="white" />
                     <circle cx="20" cy="-18" r="0.7" fill="white" />
                     <circle cx="-18" cy="-15" r="0.6" fill="white" />
                   </g>
                   
                   {/* Labels with better styling */}
                   <text x="40" y="75" fontSize="12" fill="#5E35B1" fontWeight="bold" textAnchor="middle">3 crystals</text>
                   <text x="120" y="75" fontSize="12" fill="#5E35B1" fontWeight="bold" textAnchor="middle">4 crystals</text>
                   <text x="200" y="75" fontSize="12" fill="#5E35B1" fontWeight="bold" textAnchor="middle">7 crystals</text>
                   
                   {/* Gradient definitions */}
                   <defs>
                     <linearGradient id="crystal1" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#9C27B0" />
                       <stop offset="100%" stopColor="#5E35B1" />
                     </linearGradient>
                     <linearGradient id="crystal2" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#7E57C2" />
                       <stop offset="100%" stopColor="#4527A0" />
                     </linearGradient>
                     <linearGradient id="crystal3" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#673AB7" />
                       <stop offset="100%" stopColor="#311B92" />
                     </linearGradient>
                     <linearGradient id="crystal4" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#5E35B1" />
                       <stop offset="100%" stopColor="#3949AB" />
                     </linearGradient>
                     <linearGradient id="crystal5" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#8E24AA" />
                       <stop offset="100%" stopColor="#6A1B9A" />
                     </linearGradient>
                     <radialGradient id="plusGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                       <stop offset="0%" stopColor="#9C27B0" />
                       <stop offset="100%" stopColor="#6A1B9A" />
                     </radialGradient>
                     <linearGradient id="equalsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#7E57C2" />
                       <stop offset="100%" stopColor="#4527A0" />
                     </linearGradient>
                   </defs>
                 </svg>
               </div>
             </div>
              )}

              {currentSection === 2 && (
                <div className="flex justify-center my-6">
                  <div className="flex flex-col items-center space-y-8 w-full max-w-md">
                    {/* Top row - 10 Potions */}
                    <div className="flex flex-col items-center">
                      <div className="flex flex-wrap justify-center mb-2 gap-0.5 max-w-xs">
                        {Array(10).fill(0).map((_, i) => (
                          <div key={i} className="mx-0.5">
                            <svg width="24" height="32" viewBox="0 0 24 32">
                              {/* Potion bottle neck */}
                              <rect x="8" y="0" width="8" height="6" rx="2" fill="#7C3AED" />
                              {/* Potion bottle body */}
                              <path d="M8,6 C8,6 6,10 6,12 L6,26 C6,30 18,30 18,26 L18,12 C18,10 16,6 16,6 Z" 
                                fill="#EEF2FF" stroke="#6D28D9" strokeWidth="1" />
                              {/* Purple liquid inside */}
                              <path d="M7,14 L17,14 L17,25 C17,28 7,28 7,25 Z" fill="#8B5CF6" />
                            </svg>
                          </div>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-purple-700">10 Potions</span>
                    </div>
                    
                    {/* Minus sign */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600">
                      <div className="w-6 h-1.5 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Middle row - 4 Used Potions */}
                    <div className="flex flex-col items-center">
                      <div className="flex flex-wrap justify-center mb-2 gap-0.5 max-w-xs">
                        {Array(4).fill(0).map((_, i) => (
                          <div key={i} className="mx-0.5 relative">
                            <svg width="24" height="32" viewBox="0 0 24 32">
                              {/* Potion bottle neck */}
                              <rect x="8" y="0" width="8" height="6" rx="2" fill="#7C3AED" opacity="0.7" />
                              {/* Potion bottle body */}
                              <path d="M8,6 C8,6 6,10 6,12 L6,26 C6,30 18,30 18,26 L18,12 C18,10 16,6 16,6 Z" 
                                fill="#EEF2FF" stroke="#6D28D9" strokeWidth="1" opacity="0.7" />
                              {/* Less liquid (used) */}
                              <path d="M7,22 L17,22 L17,25 C17,28 7,28 7,25 Z" fill="#8B5CF6" opacity="0.5" />
                              {/* Red X mark */}
                              <path d="M6,11 L18,21 M6,21 L18,11" stroke="#FF5252" strokeWidth="1.8" />
                            </svg>
                          </div>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-purple-700">4 Used</span>
                    </div>
                    
                    {/* Equals sign */}
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-purple-600">
                      <div className="w-6 h-1.5 bg-white rounded-full mb-1.5"></div>
                      <div className="w-6 h-1.5 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Bottom row - 6 Potions Left */}
                    <div className="flex flex-col items-center">
                      <div className="flex flex-wrap justify-center mb-2 gap-0.5 max-w-xs">
                        {Array(6).fill(0).map((_, i) => (
                          <div key={i} className="mx-0.5">
                            <svg width="24" height="32" viewBox="0 0 24 32">
                              {/* Potion bottle neck */}
                              <rect x="8" y="0" width="8" height="6" rx="2" fill="#7C3AED" />
                              {/* Potion bottle body */}
                              <path d="M8,6 C8,6 6,10 6,12 L6,26 C6,30 18,30 18,26 L18,12 C18,10 16,6 16,6 Z" 
                                fill="#EEF2FF" stroke="#6D28D9" strokeWidth="1" />
                              {/* Purple liquid inside */}
                              <path d="M7,14 L17,14 L17,25 C17,28 7,28 7,25 Z" fill="#8B5CF6" />
                            </svg>
                          </div>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-purple-700">6 Potions Left</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full bg-primary text-white hover:bg-opacity-90 mt-6"
              onClick={handleNextSection}
            >
              {currentSection >= 3 ? "Complete Lesson" : "Continue to Next Section"}
            </Button>
          </div>

          {/* Completion Screen */}
          {isCompleted && (
            <div className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="h-14 w-14 text-primary" />
                  </div>
                  <div className="absolute -right-5 -bottom-2">
                    <PippinHint
                      hint="You're a brilliant learner! I'm so proud of your magical progress!"
                      size="md"
                      isModal={true}
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Lesson Completed!</h3>
              <p className="text-gray-600 mb-6">
                Great job finishing this magical lesson. You've earned rewards and unlocked new adventures!
              </p>

              <div className="flex justify-center space-x-4 mb-6">
                <div className="bg-primary bg-opacity-10 rounded-lg p-4 flex flex-col items-center">
                  <Star className="h-6 w-6 text-primary mb-1 text-white" />
                  <span className="text-lg text-white font-bold">{lesson?.xpReward || 30} XP</span>
                </div>
                <div className="bg-yellow-100 rounded-lg p-4 flex flex-col items-center">
                  <Coins className="h-6 w-6 text-yellow-500 mb-1" />
                  <span className="text-lg font-bold text-yellow-600">{lesson?.coinReward || 15} Coins</span>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center justify-center">
                  <BarChart className="h-5 w-5 mr-2 text-primary" />
                  Learning Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Time Spent</div>
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1 text-primary" />
                      <span className="font-medium">
                        {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Completion</div>
                    <div className="font-medium text-primary">100%</div>
                  </div>
                </div>
              </div>

              <ul className="mb-8 max-w-sm mx-auto text-left">
                <li className="flex items-center mb-2">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Unlocked new map area</span>
                </li>
                <li className="flex items-center mb-2">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>New magical equipment available in the shop</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Learned essential magical math skills</span>
                </li>
              </ul>

              <div className="flex justify-center space-x-3">
                <Button
                  className="bg-primary text-white hover:bg-opacity-90 px-8 py-2"
                  onClick={() => navigate("/adventure")}
                >
                  Return to Adventure Map
                </Button>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:bg-opacity-10"
                  onClick={() => navigate("/mini-game/1")}
                >
                  Practice in Mini-Game
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {!isCompleted && (
            <div className="bg-gray-50 px-6 py-4 flex justify-between">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-primary flex items-center"
                onClick={() => navigate("/adventure")}
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Map
              </Button>
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </LeftHeaderLayout>
  );
}