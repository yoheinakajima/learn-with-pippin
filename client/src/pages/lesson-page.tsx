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
import { learningService, progressService, mapService, gameService } from "@/services";
import { PippinHint, FloatingPippinHint } from '@/components/ui/pippin-hint';
import React from "react";
import ReactConfetti from 'react-confetti';

export default function LessonPage() {
  const { activeChildSession } = useAuth();
  const params = useParams<{ lessonId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  // State to control confetti animation
  const [showConfetti, setShowConfetti] = useState(false);

  const lessonId = parseInt(params.lessonId);

  // Move this hook to the top level of your component function
  // before any conditional statements or early returns
  const celebrationSound = React.useMemo(() => {
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      return new Audio('/sounds/win.mp3');
    }
    return null;
  }, []);

    // Show confetti for 2 seconds when completion screen appears
    useEffect(() => {
      if (isCompleted) {
        setShowConfetti(true);
        
        // Play celebration sound
        if (celebrationSound) {
          celebrationSound.currentTime = 0;
          celebrationSound.play().catch(err => {
            console.warn('Audio playback was prevented:', err);
          });
        }
        
        const timer = setTimeout(() => {
          setShowConfetti(false);
        }, 4000);
        
        return () => clearTimeout(timer);
      }
    }, [isCompleted, celebrationSound]);

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
  // const { data: mapZones } = useQuery<MapZone[]>({
  //   queryKey: ["/api/map-zones"],
  //   queryFn: () => mapService.getAllMapZones(),
  //   enabled: !!activeChildSession
  // });
  const { data: mapZones } = useQuery<MapZone[]>({
    queryKey: ["/api/child-profiles", activeChildSession?.childId, "available-map-zones"],
    queryFn: async () => {
      console.log('[ADVENTURE-PAGE] Fetching available map zones for child');
      try {
        const data = await gameService.getAvailableMapZones(activeChildSession?.childId || 1);
        return data;
      } catch (error) {
        console.error('[ADVENTURE-PAGE] Error fetching map zones:', error);
        throw new Error("Failed to fetch map zones");
      }
    },
    enabled: !!activeChildSession?.childId,
  });

  // Find the active node for this lesson (assumed to be of type 'lesson')
  const [activeNode, setActiveNode] = useState<{ zoneId: number, nodeId: string } | null>(null);

  console.log('[LESSON-PAGE] ActiveNode:', activeNode);

  // Find the map node that represents this lesson
  useEffect(() => {
    if (mapZones && lessonId) {
      // Find a zone with a lesson node that's current or available
      for (const zone of mapZones) {
        // Find a 'lesson' type node that's either 'current' or 'available'
        const lessonNode = zone.config.nodes.find(node =>
          (node.type === 'lesson' && (node.status === 'current' || node.status === 'available'))
        );
        console.log('[LESSON-PAGE] Lesson node:', lessonNode, zone);

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

  const clickSound = React.useMemo(() => {
    if (typeof Audio !== 'undefined') {
      return new Audio('/sounds/correct2.mp3');
    }
    return null;
  }, []);

  const clickSound2 = React.useMemo(() => {
    if (typeof Audio !== 'undefined') {
      return new Audio('/sounds/correct3.mp3');
    }
    return null;
  }, []);

  // Progress to next section
  const handleNextSection = () => {
    // If we're on the last section, complete the lesson
    if (currentSection >= 3) {
      if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(err => {
          console.warn('Audio playback was prevented:', err);
        });
      }
      handleComplete();
    } else {
      if (clickSound2) {
        clickSound2.currentTime = 0;
        clickSound2.play().catch(err => {
          console.warn('Audio playback was prevented:', err);
        });
      }
      setCurrentSection(prev => prev + 1);
    }
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
            <h3 className="text-xl font-medium mb-4">{lesson?.title}</h3>

            <div className="prose max-w-none mb-8">
              {lesson?.content && (() => {
                try {
                  const parsedContent = JSON.parse(lesson.content);
                  
                  switch(currentSection) {
                    case 0:
                      return <p>{parsedContent.introduction}</p>;
                    case 1:
                      return (
                        <>
                          <h4 className="font-bold text-lg mb-2">{parsedContent.key_concepts[0].heading}</h4>
                          <p>{parsedContent.key_concepts[0].content}</p>
                        </>
                      );
                    case 2:
                      return (
                        <>
                          <h4 className="font-bold text-lg mb-2">{parsedContent.key_concepts[1].heading}</h4>
                          <p>{parsedContent.key_concepts[1].content}</p>
                        </>
                      );
                    case 3:
                      return (
                        <>
                          <h4 className="font-bold text-lg mb-2">{parsedContent.activity.title}</h4>
                          <p>{parsedContent.activity.instructions}</p>
                          <h4 className="font-bold text-lg mt-4 mb-2">Summary</h4>
                          <p>{parsedContent.summary}</p>
                        </>
                      );
                    default:
                      return <p>{parsedContent.introduction}</p>;
                  }
                } catch (e) {
                  // Fallback if parsing fails
                  return <p>{lesson.content}</p>;
                }
              })()}

              {/* Ocean Science Expedition Illustrations */}
              {lessonId === 3 && currentSection === 1 && (
                <div className="flex justify-center my-6">
                  <div className="relative w-full max-w-md h-64">
                    {/* Ocean Layers SVG */}
                    <svg className="w-full h-full" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                      {/* Sky and Surface */}
                      <rect x="0" y="0" width="400" height="60" fill="#87CEEB" />
                      <path d="M0,60 Q100,40 200,60 Q300,80 400,60 L400,60 L0,60 Z" fill="#1E90FF" />
                      
                      {/* Sunlight Zone (0-200m) */}
                      <rect x="0" y="60" width="400" height="80" fill="#1E90FF" opacity="0.8" />
                      <text x="20" y="90" fill="white" fontWeight="bold">Sunlight Zone</text>
                      <circle cx="350" cy="100" r="15" fill="#FFD700" opacity="0.7" /> {/* Sun rays */}
                      <path d="M350,85 L350,60" stroke="#FFD700" strokeWidth="2" />
                      <path d="M335,90 L320,70" stroke="#FFD700" strokeWidth="2" />
                      <path d="M365,90 L380,70" stroke="#FFD700" strokeWidth="2" />
                      
                      {/* Coral Reef */}
                      <path d="M30,130 Q40,120 50,130 Q60,140 70,135 Q80,125 90,140" stroke="#FF7F50" fill="none" strokeWidth="4" />
                      <path d="M50,140 Q60,130 70,140 Q80,150 90,145" stroke="#FF69B4" fill="none" strokeWidth="4" />
                      <path d="M70,140 Q80,120 90,135 Q100,145 110,135" stroke="#FF1493" fill="none" strokeWidth="4" />
                      
                      {/* Colorful Fish in Sunlight Zone */}
                      <path d="M150,100 L170,90 L170,110 Z" fill="#FF4500" />
                      <circle cx="155" cy="100" r="2" fill="black" />
                      <path d="M180,80 L200,70 L200,90 Z" fill="#FFD700" />
                      <circle cx="185" cy="80" r="2" fill="black" />
                      
                      {/* Twilight Zone (200-1000m) */}
                      <rect x="0" y="140" width="400" height="80" fill="#000080" opacity="0.7" />
                      <text x="20" y="170" fill="white" fontWeight="bold">Twilight Zone</text>
                      
                      {/* Glowing Fish in Twilight Zone */}
                      <path d="M150,180 L170,170 L170,190 Z" fill="#4169E1" />
                      <circle cx="155" cy="180" r="2" fill="#00FFFF" />
                      <circle cx="150" cy="185" r="3" fill="#00FFFF" opacity="0.7" />
                      <path d="M180,160 L200,150 L200,170 Z" fill="#4682B4" />
                      <circle cx="185" cy="160" r="2" fill="#00FFFF" />
                      <circle cx="180" cy="165" r="3" fill="#00FFFF" opacity="0.7" />
                      
                      {/* Midnight Zone (1000m+) */}
                      <rect x="0" y="220" width="400" height="80" fill="#000000" opacity="0.9" />
                      <text x="20" y="250" fill="white" fontWeight="bold">Midnight Zone</text>
                      
                      {/* Deep Sea Creatures */}
                      <path d="M150,260 L170,250 L170,270 Z" fill="#191970" />
                      <circle cx="155" cy="260" r="2" fill="#00FFFF" />
                      <circle cx="150" cy="255" r="4" fill="#00FFFF" opacity="0.7" />
                      <circle cx="160" cy="265" r="3" fill="#00FFFF" opacity="0.7" />
                      
                      {/* Anglerfish */}
                      <path d="M250,250 C270,240 280,245 290,255 C280,265 270,270 250,260 Z" fill="#000033" />
                      <circle cx="290" cy="255" r="2" fill="#00FFFF" />
                      <line x1="250" y1="245" x2="240" y2="235" stroke="#000033" strokeWidth="2" />
                      <circle cx="240" cy="235" r="4" fill="#00FFFF" />
                      
                      {/* Pippin in diving bubble */}
                      <circle cx="100" cy="200" r="20" fill="none" stroke="white" strokeWidth="2" opacity="0.7" />
                      <path d="M95,195 L105,195" stroke="white" strokeWidth="2" /> {/* Pippin's eyes */}
                      <path d="M100,195 L100,205" stroke="white" strokeWidth="2" /> {/* Pippin's nose */}
                      <path d="M95,210 Q100,215 105,210" stroke="white" strokeWidth="2" fill="none" /> {/* Pippin's smile */}
                      <path d="M100,185 L105,175" stroke="white" strokeWidth="2" /> {/* Pippin's horn */}
                    </svg>
                  </div>
                </div>
              )}

              {lessonId === 3 && currentSection === 2 && (
                <div className="flex justify-center my-6">
                  <div className="relative w-full max-w-md h-64">
                    {/* Ocean Adaptations SVG */}
                    <svg className="w-full h-full" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                      {/* Background - Ocean */}
                      <rect x="0" y="0" width="400" height="300" fill="#1E90FF" opacity="0.8" />
                      
                      {/* Title */}
                      <text x="120" y="30" fill="white" fontWeight="bold" fontSize="16">Amazing Ocean Adaptations</text>
                      
                      {/* Streamlined Fish */}
                      <g transform="translate(60, 80)">
                        <text x="0" y="-10" fill="white" fontSize="12">Streamlined Body</text>
                        <path d="M0,0 C20,-15 60,-15 80,0 C60,15 20,15 0,0 Z" fill="#4682B4" />
                        <circle cx="10" cy="0" r="2" fill="black" />
                        <path d="M80,0 L100,10 L100,-10 Z" fill="#4682B4" /> {/* Tail fin */}
                        <path d="M60,0 L70,-10 L70,10 Z" fill="#4682B4" opacity="0.7" /> {/* Dorsal fin */}
                        <path d="M40,5 L50,15 L30,15 Z" fill="#4682B4" opacity="0.7" /> {/* Bottom fin */}
                      </g>
                      
                      {/* Camouflage Fish */}
                      <g transform="translate(60, 150)">
                        <text x="0" y="-10" fill="white" fontSize="12">Camouflage</text>
                        <path d="M0,0 C20,-10 50,-10 70,0 C50,10 20,10 0,0 Z" fill="#FFA07A" />
                        <circle cx="10" cy="0" r="2" fill="black" />
                        <path d="M70,0 L85,10 L85,-10 Z" fill="#FFA07A" /> {/* Tail fin */}
                        <circle cx="30" cy="3" r="3" fill="#8B4513" opacity="0.8" />
                        <circle cx="50" cy="-5" r="4" fill="#8B4513" opacity="0.8" />
                        <circle cx="40" cy="5" r="2" fill="#8B4513" opacity="0.8" />
                        <circle cx="20" cy="-2" r="3" fill="#8B4513" opacity="0.8" />
                        <circle cx="60" cy="2" r="2" fill="#8B4513" opacity="0.8" />
                      </g>
                      
                      {/* Bioluminescent Fish */}
                      <g transform="translate(220, 80)">
                        <text x="0" y="-10" fill="white" fontSize="12">Bioluminescence</text>
                        <path d="M0,0 C15,-10 45,-10 60,0 C45,10 15,10 0,0 Z" fill="#191970" />
                        <circle cx="10" cy="0" r="2" fill="#00FFFF" />
                        <path d="M60,0 L75,10 L75,-10 Z" fill="#191970" /> {/* Tail fin */}
                        <circle cx="20" cy="0" r="3" fill="#00FFFF" opacity="0.7" />
                        <circle cx="30" cy="5" r="4" fill="#00FFFF" opacity="0.7" />
                        <circle cx="40" cy="-5" r="3" fill="#00FFFF" opacity="0.7" />
                        <circle cx="50" cy="0" r="2" fill="#00FFFF" opacity="0.7" />
                        <circle cx="30" cy="-3" r="2" fill="#00FFFF" opacity="0.7" />
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </g>
                      
                      {/* Octopus with Color Changing */}
                      <g transform="translate(220, 150)">
                        <text x="0" y="-10" fill="white" fontSize="12">Color Changing Octopus</text>
                        <circle cx="25" cy="20" r="15" fill="#FF00FF" opacity="0.7" /> {/* Head */}
                        <circle cx="20" cy="15" r="3" fill="white" /> {/* Eye white */}
                        <circle cx="20" cy="15" r="1" fill="black" /> {/* Eye pupil */}
                        
                        {/* Tentacles */}
                        <path d="M15,30 Q5,40 0,50" stroke="#FF00FF" strokeWidth="3" fill="none" />
                        <path d="M20,35 Q15,50 10,60" stroke="#FF00FF" strokeWidth="3" fill="none" />
                        <path d="M25,35 Q35,45 40,55" stroke="#FF00FF" strokeWidth="3" fill="none" />
                        <path d="M30,30 Q40,35 50,35" stroke="#FF00FF" strokeWidth="3" fill="none" />
                        <path d="M35,25 Q45,15 55,15" stroke="#FF00FF" strokeWidth="3" fill="none" />
                        <path d="M30,15 Q35,0 45,0" stroke="#FF00FF" strokeWidth="3" fill="none" />
                        <path d="M20,10 Q15,0 5,0" stroke="#FF00FF" strokeWidth="3" fill="none" />
                        <path d="M15,20 Q0,15 -10,10" stroke="#FF00FF" strokeWidth="3" fill="none" />
                        
                        {/* Color changing effect */}
                        <circle cx="25" cy="20" r="5" fill="#00FFFF" opacity="0.3" />
                        <circle cx="30" cy="25" r="4" fill="#FF4500" opacity="0.3" />
                        <circle cx="20" cy="25" r="3" fill="#32CD32" opacity="0.3" />
                      </g>
                      
                      {/* Pippin with magnifying glass */}
                      <g transform="translate(330, 230)">
                        <circle cx="0" cy="0" r="15" fill="white" opacity="0.3" /> {/* Pippin's diving bubble */}
                        <path d="M-5,-5 L5,-5" stroke="white" strokeWidth="2" /> {/* Pippin's eyes */}
                        <path d="M0,-5 L0,5" stroke="white" strokeWidth="2" /> {/* Pippin's nose */}
                        <path d="M-5,10 Q0,15 5,10" stroke="white" strokeWidth="2" fill="none" /> {/* Pippin's smile */}
                        <path d="M0,-15 L5,-25" stroke="white" strokeWidth="2" /> {/* Pippin's horn */}
                        
                        {/* Magnifying glass */}
                        <circle cx="-25" cy="0" r="10" fill="none" stroke="white" strokeWidth="2" />
                        <line x1="-18" y1="7" x2="-10" y2="15" stroke="white" strokeWidth="2" />
                      </g>
                    </svg>
                  </div>
                </div>
              )}

              {lessonId === 4 && currentSection === 1 && (
                <div className="flex justify-center my-6">
                  <div className="relative w-full max-w-md h-64">
                    {/* Coral Communities Multiplication SVG */}
                    <svg className="w-full h-full" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                      {/* Ocean Background */}
                      <rect x="0" y="0" width="400" height="300" fill="#1E90FF" opacity="0.8" />
                      <path d="M0,280 Q100,260 200,280 Q300,260 400,280 L400,300 L0,300 Z" fill="#8B4513" /> {/* Sandy bottom */}
                      
                      {/* Title */}
                      <text x="50" y="30" fill="white" fontWeight="bold" fontSize="16">Multiplying Coral Communities</text>
                      
                      {/* 6 Coral Formations with 8 Fish each */}
                      <g transform="translate(30, 70)">
                        {/* Coral Formation 1 */}
                        <path d="M0,100 Q10,80 20,100 Q30,120 40,100" stroke="#FF7F50" fill="none" strokeWidth="4" />
                        <path d="M10,110 Q20,90 30,110" stroke="#FF69B4" fill="none" strokeWidth="4" />
                        
                        {/* Fish for Formation 1 */}
                        <path d="M5,70 L15,65 L15,75 Z" fill="#FFD700" />
                        <circle cx="7" cy="70" r="1" fill="black" />
                        <path d="M25,60 L35,55 L35,65 Z" fill="#FF4500" />
                        <circle cx="27" cy="60" r="1" fill="black" />
                        <path d="M20,80 L30,75 L30,85 Z" fill="#7FFFD4" />
                        <circle cx="22" cy="80" r="1" fill="black" />
                        <path d="M40,70 L50,65 L50,75 Z" fill="#9370DB" />
                        <circle cx="42" cy="70" r="1" fill="black" />
                        <path d="M10,95 L20,90 L20,100 Z" fill="#FF69B4" />
                        <circle cx="12" cy="95" r="1" fill="black" />
                        <path d="M30,95 L40,90 L40,100 Z" fill="#20B2AA" />
                        <circle cx="32" cy="95" r="1" fill="black" />
                        <path d="M25,50 L35,45 L35,55 Z" fill="#00CED1" />
                        <circle cx="27" cy="50" r="1" fill="black" />
                        <path d="M40,55 L50,50 L50,60 Z" fill="#87CEEB" />
                        <circle cx="42" cy="55" r="1" fill="black" />
                      </g>
                      
                      <g transform="translate(100, 70)">
                        {/* Coral Formation 2 */}
                        <path d="M0,100 Q10,80 20,100 Q30,120 40,100" stroke="#FF1493" fill="none" strokeWidth="4" />
                        <path d="M10,110 Q20,90 30,110" stroke="#FF4500" fill="none" strokeWidth="4" />
                        
                        {/* Fish for Formation 2 - 8 fish with different colors */}
                        <path d="M5,70 L15,65 L15,75 Z" fill="#FFD700" />
                        <circle cx="7" cy="70" r="1" fill="black" />
                        <path d="M25,60 L35,55 L35,65 Z" fill="#FF4500" />
                        <circle cx="27" cy="60" r="1" fill="black" />
                        <path d="M20,80 L30,75 L30,85 Z" fill="#7FFFD4" />
                        <circle cx="22" cy="80" r="1" fill="black" />
                        <path d="M40,70 L50,65 L50,75 Z" fill="#9370DB" />
                        <circle cx="42" cy="70" r="1" fill="black" />
                        <path d="M10,95 L20,90 L20,100 Z" fill="#FF69B4" />
                        <circle cx="12" cy="95" r="1" fill="black" />
                        <path d="M30,95 L40,90 L40,100 Z" fill="#20B2AA" />
                        <circle cx="32" cy="95" r="1" fill="black" />
                        <path d="M25,50 L35,45 L35,55 Z" fill="#00CED1" />
                        <circle cx="27" cy="50" r="1" fill="black" />
                        <path d="M40,55 L50,50 L50,60 Z" fill="#87CEEB" />
                        <circle cx="42" cy="55" r="1" fill="black" />
                      </g>
                      
                      <g transform="translate(170, 70)">
                        {/* Coral Formation 3 */}
                        <path d="M0,100 Q10,80 20,100 Q30,120 40,100" stroke="#FF6347" fill="none" strokeWidth="4" />
                        <path d="M10,110 Q20,90 30,110" stroke="#FFD700" fill="none" strokeWidth="4" />
                        
                        {/* Fish for Formation 3 - 8 fish with different colors */}
                        <path d="M5,70 L15,65 L15,75 Z" fill="#FFD700" />
                        <circle cx="7" cy="70" r="1" fill="black" />
                        <path d="M25,60 L35,55 L35,65 Z" fill="#FF4500" />
                        <circle cx="27" cy="60" r="1" fill="black" />
                        <path d="M20,80 L30,75 L30,85 Z" fill="#7FFFD4" />
                        <circle cx="22" cy="80" r="1" fill="black" />
                        <path d="M40,70 L50,65 L50,75 Z" fill="#9370DB" />
                        <circle cx="42" cy="70" r="1" fill="black" />
                        <path d="M10,95 L20,90 L20,100 Z" fill="#FF69B4" />
                        <circle cx="12" cy="95" r="1" fill="black" />
                        <path d="M30,95 L40,90 L40,100 Z" fill="#20B2AA" />
                        <circle cx="32" cy="95" r="1" fill="black" />
                        <path d="M25,50 L35,45 L35,55 Z" fill="#00CED1" />
                        <circle cx="27" cy="50" r="1" fill="black" />
                        <path d="M40,55 L50,50 L50,60 Z" fill="#87CEEB" />
                        <circle cx="42" cy="55" r="1" fill="black" />
                      </g>
                      
                      <g transform="translate(240, 70)">
                        {/* Coral Formation 4 */}
                        <path d="M0,100 Q10,80 20,100 Q30,120 40,100" stroke="#9400D3" fill="none" strokeWidth="4" />
                        <path d="M10,110 Q20,90 30,110" stroke="#4B0082" fill="none" strokeWidth="4" />
                        
                        {/* Fish for Formation 4 - 8 fish with different colors */}
                        <path d="M5,70 L15,65 L15,75 Z" fill="#FFD700" />
                        <circle cx="7" cy="70" r="1" fill="black" />
                        <path d="M25,60 L35,55 L35,65 Z" fill="#FF4500" />
                        <circle cx="27" cy="60" r="1" fill="black" />
                        <path d="M20,80 L30,75 L30,85 Z" fill="#7FFFD4" />
                        <circle cx="22" cy="80" r="1" fill="black" />
                        <path d="M40,70 L50,65 L50,75 Z" fill="#9370DB" />
                        <circle cx="42" cy="70" r="1" fill="black" />
                        <path d="M10,95 L20,90 L20,100 Z" fill="#FF69B4" />
                        <circle cx="12" cy="95" r="1" fill="black" />
                        <path d="M30,95 L40,90 L40,100 Z" fill="#20B2AA" />
                        <circle cx="32" cy="95" r="1" fill="black" />
                        <path d="M25,50 L35,45 L35,55 Z" fill="#00CED1" />
                        <circle cx="27" cy="50" r="1" fill="black" />
                        <path d="M40,55 L50,50 L50,60 Z" fill="#87CEEB" />
                        <circle cx="42" cy="55" r="1" fill="black" />
                      </g>
                      
                      <g transform="translate(310, 70)">
                        {/* Coral Formation 5 */}
                        <path d="M0,100 Q10,80 20,100 Q30,120 40,100" stroke="#32CD32" fill="none" strokeWidth="4" />
                        <path d="M10,110 Q20,90 30,110" stroke="#00FF00" fill="none" strokeWidth="4" />
                        
                        {/* Fish for Formation 5 - 8 fish with different colors */}
                        <path d="M5,70 L15,65 L15,75 Z" fill="#FFD700" />
                        <circle cx="7" cy="70" r="1" fill="black" />
                        <path d="M25,60 L35,55 L35,65 Z" fill="#FF4500" />
                        <circle cx="27" cy="60" r="1" fill="black" />
                        <path d="M20,80 L30,75 L30,85 Z" fill="#7FFFD4" />
                        <circle cx="22" cy="80" r="1" fill="black" />
                        <path d="M40,70 L50,65 L50,75 Z" fill="#9370DB" />
                        <circle cx="42" cy="70" r="1" fill="black" />
                        <path d="M10,95 L20,90 L20,100 Z" fill="#FF69B4" />
                        <circle cx="12" cy="95" r="1" fill="black" />
                        <path d="M30,95 L40,90 L40,100 Z" fill="#20B2AA" />
                        <circle cx="32" cy="95" r="1" fill="black" />
                        <path d="M25,50 L35,45 L35,55 Z" fill="#00CED1" />
                        <circle cx="27" cy="50" r="1" fill="black" />
                        <path d="M40,55 L50,50 L50,60 Z" fill="#87CEEB" />
                        <circle cx="42" cy="55" r="1" fill="black" />
                      </g>
                      
                      <g transform="translate(170, 180)">
                        {/* Coral Formation 6 */}
                        <path d="M0,100 Q10,80 20,100 Q30,120 40,100" stroke="#FF8C00" fill="none" strokeWidth="4" />
                        <path d="M10,110 Q20,90 30,110" stroke="#FFA500" fill="none" strokeWidth="4" />
                        
                        {/* Fish for Formation 6 - 8 fish with different colors */}
                        <path d="M5,70 L15,65 L15,75 Z" fill="#FFD700" />
                        <circle cx="7" cy="70" r="1" fill="black" />
                        <path d="M25,60 L35,55 L35,65 Z" fill="#FF4500" />
                        <circle cx="27" cy="60" r="1" fill="black" />
                        <path d="M20,80 L30,75 L30,85 Z" fill="#7FFFD4" />
                        <circle cx="22" cy="80" r="1" fill="black" />
                        <path d="M40,70 L50,65 L50,75 Z" fill="#9370DB" />
                        <circle cx="42" cy="70" r="1" fill="black" />
                        <path d="M10,95 L20,90 L20,100 Z" fill="#FF69B4" />
                        <circle cx="12" cy="95" r="1" fill="black" />
                        <path d="M30,95 L40,90 L40,100 Z" fill="#20B2AA" />
                        <circle cx="32" cy="95" r="1" fill="black" />
                        <path d="M25,50 L35,45 L35,55 Z" fill="#00CED1" />
                        <circle cx="27" cy="50" r="1" fill="black" />
                        <path d="M40,55 L50,50 L50,60 Z" fill="#87CEEB" />
                        <circle cx="42" cy="55" r="1" fill="black" />
                      </g>
                      
                      {/* Math equation display */}
                      <rect x="100" y="240" width="200" height="40" rx="10" fill="white" opacity="0.7" />
                      <text x="120" y="265" fill="#000080" fontWeight="bold" fontSize="16">6 formations × 8 species = 48 total fish species</text>
                      
                      {/* Pippin looking at coral */}
                      <g transform="translate(370, 150)">
                        <circle cx="0" cy="0" r="15" fill="white" opacity="0.7" /> {/* Pippin's diving bubble */}
                        <path d="M-5,-5 L5,-5" stroke="#000080" strokeWidth="2" /> {/* Pippin's eyes */}
                        <path d="M0,-5 L0,5" stroke="#000080" strokeWidth="2" /> {/* Pippin's nose */}
                        <path d="M-5,10 Q0,15 5,10" stroke="#000080" strokeWidth="2" fill="none" /> {/* Pippin's smile */}
                        <path d="M0,-15 L5,-25" stroke="#000080" strokeWidth="2" /> {/* Pippin's horn */}
                      </g>
                    </svg>
                  </div>
                </div>
              )}

              {lessonId === 4 && currentSection === 2 && (
                <div className="flex justify-center my-6">
                  <div className="relative w-full max-w-md h-64">
                    {/* School of Fish Calculations SVG */}
                    <svg className="w-full h-full" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                      {/* Ocean Background */}
                      <rect x="0" y="0" width="400" height="300" fill="#1E90FF" opacity="0.8" />
                      <path d="M0,280 Q100,260 200,280 Q300,260 400,280 L400,300 L0,300 Z" fill="#8B4513" /> {/* Sandy bottom */}
                      
                      {/* Title */}
                      <text x="100" y="30" fill="white" fontWeight="bold" fontSize="16" textAnchor="left">School of Fish Calculations</text>
                      
                      {/* First Scenario: Moonfish Schools */}
                      <text x="75" y="55" className="ml-8" fill="white" fontSize="14" textAnchor="right">7 schools × 15 moonfish = 105 moonfish</text>
                      
                      {/* Visual representation of 7 schools with 15 fish - spread across full width */}
                      <g transform="translate(0, 70)">
                        {/* Top row: 4 Schools of Moonfish */}
                        <circle cx="60" cy="20" r="20" fill="#C0C0C0" opacity="0.3" />
                        <text x="60" y="24" fill="white" fontSize="10" textAnchor="middle">15</text>
                        
                        <circle cx="140" cy="20" r="20" fill="#C0C0C0" opacity="0.3" />
                        <text x="140" y="24" fill="white" fontSize="10" textAnchor="middle">15</text>
                        
                        <circle cx="220" cy="20" r="20" fill="#C0C0C0" opacity="0.3" />
                        <text x="220" y="24" fill="white" fontSize="10" textAnchor="middle">15</text>
                        
                        <circle cx="300" cy="20" r="20" fill="#C0C0C0" opacity="0.3" />
                        <text x="300" y="24" fill="white" fontSize="10" textAnchor="middle">15</text>
                        
                        {/* Bottom row: 3 Schools of Moonfish */}
                        <circle cx="100" cy="70" r="20" fill="#C0C0C0" opacity="0.3" />
                        <text x="100" y="74" fill="white" fontSize="10" textAnchor="middle">15</text>
                        
                        <circle cx="200" cy="70" r="20" fill="#C0C0C0" opacity="0.3" />
                        <text x="200" y="74" fill="white" fontSize="10" textAnchor="middle">15</text>
                        
                        <circle cx="300" cy="70" r="20" fill="#C0C0C0" opacity="0.3" />
                        <text x="300" y="74" fill="white" fontSize="10" textAnchor="middle">15</text>
                        
                        {/* Detail of one school - centered at bottom */}
                        <g transform="translate(140, 125) scale(0.8)">
                          {/* Detailed silver moonfish school */}
                          <text x="0" y="-10" fill="white" fontSize="12" fontWeight="bold">Detail of one school:</text>
                          
                          {/* 15 individual fish in formation */}
                          {/* Row 1 */}
                          <path d="M0,10 L10,5 L10,15 Z" fill="#C0C0C0" />
                          <circle cx="2" cy="10" r="1" fill="black" />
                          <path d="M20,5 L30,0 L30,10 Z" fill="#C0C0C0" />
                          <circle cx="22" cy="5" r="1" fill="black" />
                          <path d="M40,10 L50,5 L50,15 Z" fill="#C0C0C0" />
                          <circle cx="42" cy="10" r="1" fill="black" />
                          <path d="M60,5 L70,0 L70,10 Z" fill="#C0C0C0" />
                          <circle cx="62" cy="5" r="1" fill="black" />
                          <path d="M80,10 L90,5 L90,15 Z" fill="#C0C0C0" />
                          <circle cx="82" cy="10" r="1" fill="black" />
                          
                          {/* Row 2 */}
                          <path d="M10,30 L20,25 L20,35 Z" fill="#C0C0C0" />
                          <circle cx="12" cy="30" r="1" fill="black" />
                          <path d="M30,25 L40,20 L40,30 Z" fill="#C0C0C0" />
                          <circle cx="32" cy="25" r="1" fill="black" />
                          <path d="M50,30 L60,25 L60,35 Z" fill="#C0C0C0" />
                          <circle cx="52" cy="30" r="1" fill="black" />
                          <path d="M70,25 L80,20 L80,30 Z" fill="#C0C0C0" />
                          <circle cx="72" cy="25" r="1" fill="black" />
                          
                          {/* Row 3 */}
                          <path d="M0,50 L10,45 L10,55 Z" fill="#C0C0C0" />
                          <circle cx="2" cy="50" r="1" fill="black" />
                          <path d="M20,45 L30,40 L30,50 Z" fill="#C0C0C0" />
                          <circle cx="22" cy="45" r="1" fill="black" />
                          <path d="M40,50 L50,45 L50,55 Z" fill="#C0C0C0" />
                          <circle cx="42" cy="50" r="1" fill="black" />
                          <path d="M60,45 L70,40 L70,50 Z" fill="#C0C0C0" />
                          <circle cx="62" cy="45" r="1" fill="black" />
                          <path d="M80,50 L90,45 L90,55 Z" fill="#C0C0C0" />
                          <circle cx="82" cy="50" r="1" fill="black" />
                        </g>
                      </g>
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
            <>
                  {showConfetti && (
                    <ReactConfetti
                      width={window.innerWidth}
                      height={window.innerHeight}
                      recycle={false}
                      numberOfPieces={500}
                      gravity={0.3}
                      colors={['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981']}
                    />
                  )}
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

              <div className="flex flex-col md:flex-row justify-center space-x-3">
                <Button
                  className="bg-primary text-white hover:bg-opacity-90 px-8 py-2 mb-2"
                  onClick={() => 
                    (params.lessonId === "1" || params.lessonId === "2") ?
                    navigate(`/adventure/1`) :  
                    navigate(`/adventure/2`)
                  }
                >
                  Return to Adventure Map
                </Button>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:bg-opacity-10  mb-2"
                  onClick={() => navigate("/mini-game/1")}
                >
                  Practice in Mini-Game
                </Button>
              </div>
            </div>
            </>
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