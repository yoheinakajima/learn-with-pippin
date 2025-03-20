import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Lesson } from "@/lib/types";
import { Loader2, Book, ArrowLeft, Star, Award, Check, BarChart, Clock, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { learningService } from "@/services";

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
  
  // Record lesson completion mutation using the service
  const completeLessonMutation = useMutation({
    mutationFn: () => {
      const score = calculateScore();
      
      return learningService.recordLessonCompletion({
        childId: activeChildSession?.childId || 0,
        lessonId: lessonId,
        score: score,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles", activeChildSession?.childId] });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/child-profiles", activeChildSession?.childId, "lesson-completions"] 
      });
      
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
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
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
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
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
          <div className={`p-6 ${isCompleted ? 'hidden' : ''}`}>
            <h3 className="text-xl font-medium mb-4">{content.title}</h3>
            
            <div className="prose max-w-none mb-8">
              <p>{content.content}</p>
              
              {/* Add a nice illustration */}
              {currentSection === 1 && (
                <div className="flex justify-center my-6">
                  <div className="relative w-64 h-32">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      {/* Crystal shards */}
                      <g transform="translate(30, 50)">
                        <path d="M0,0 L-10,-20 L10,-20 Z" fill="#9C27B0" />
                        <path d="M5,0 L0,-15 L15,-15 Z" fill="#7E57C2" />
                        <path d="M10,0 L5,-25 L15,-25 Z" fill="#5E35B1" />
                      </g>
                      <text x="40" y="70" fontSize="12" fill="#333">+</text>
                      <g transform="translate(60, 50)">
                        <path d="M0,0 L-10,-20 L10,-20 Z" fill="#9C27B0" />
                        <path d="M5,0 L0,-15 L15,-15 Z" fill="#7E57C2" />
                        <path d="M10,0 L5,-25 L15,-25 Z" fill="#5E35B1" />
                        <path d="M15,0 L10,-18 L20,-18 Z" fill="#673AB7" />
                      </g>
                      <text x="90" y="70" fontSize="12" fill="#333">=</text>
                      <g transform="translate(120, 50)">
                        <path d="M0,0 L-10,-20 L10,-20 Z" fill="#9C27B0" />
                        <path d="M5,0 L0,-15 L15,-15 Z" fill="#7E57C2" />
                        <path d="M10,0 L5,-25 L15,-25 Z" fill="#5E35B1" />
                        <path d="M15,0 L10,-18 L20,-18 Z" fill="#673AB7" />
                        <path d="M20,0 L15,-22 L25,-22 Z" fill="#512DA8" />
                        <path d="M25,0 L20,-15 L30,-15 Z" fill="#4527A0" />
                        <path d="M30,0 L25,-25 L35,-25 Z" fill="#311B92" />
                      </g>
                      <text x="30" y="90" fontSize="10" fill="#666">3 crystals</text>
                      <text x="60" y="90" fontSize="10" fill="#666">4 crystals</text>
                      <text x="120" y="90" fontSize="10" fill="#666">7 crystals</text>
                    </svg>
                  </div>
                </div>
              )}
              
              {currentSection === 2 && (
                <div className="flex justify-center my-6">
                  <div className="relative w-64 h-32">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      {/* Potions */}
                      <g transform="translate(30, 50)">
                        {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135].map((x, i) => (
                          <g key={i} transform={`translate(${x}, 0) ${i >= 6 ? 'opacity: 0.3' : ''}`}>
                            <rect x="-5" y="-25" width="10" height="5" rx="2" fill="#6C63FF" />
                            <path d="M-5,-20 L5,-20 L7,0 L-7,0 Z" fill="none" stroke="#6C63FF" strokeWidth="1" />
                            <path d="M-4,-18 L4,-18 L5,-5 L-5,-5 Z" fill="#6C63FF" fillOpacity="0.5" />
                          </g>
                        ))}
                      </g>
                      <text x="83" y="70" fontSize="14" fill="#333">-</text>
                      <text x="83" y="90" fontSize="14" fill="#333">=</text>
                      <text x="30" y="90" fontSize="10" fill="#666">10 potions</text>
                      <text x="130" y="90" fontSize="10" fill="#666">4 used</text>
                      <text x="100" y="110" fontSize="10" fill="#666">6 potions left</text>
                    </svg>
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
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="h-14 w-14 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Lesson Completed!</h3>
              <p className="text-gray-600 mb-6">
                Great job finishing this magical lesson. You've earned rewards and unlocked new adventures!
              </p>
              
              <div className="flex justify-center space-x-4 mb-6">
                <div className="bg-primary bg-opacity-10 rounded-lg p-4 flex flex-col items-center">
                  <Star className="h-6 w-6 text-primary mb-1" />
                  <span className="text-lg font-bold text-primary">{lesson?.xpReward || 30} XP</span>
                </div>
                <div className="bg-yellow-100 rounded-lg p-4 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mb-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
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
    </div>
  );
}