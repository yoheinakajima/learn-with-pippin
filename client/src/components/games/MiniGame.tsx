import { useState, useEffect } from "react";
import { MiniGame as MiniGameType, Question, Choice, ChildProfile, MapZone, MapNode } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  Zap,
  BarChart3 as BarChart,
  Map
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { miniGameService, progressService, mapService } from "@/services";
import { PippinHint, FloatingPippinHint } from "@/components/ui/pippin-hint";

interface MiniGameProps {
  miniGame: MiniGameType;
  questions: Question[];
  childId: number;
  onGameComplete: () => void;
}

export function MiniGame({ miniGame, questions, childId, onGameComplete }: MiniGameProps) {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [feedbackState, setFeedbackState] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [score, setScore] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState<{
    xpAwarded: number;
    coinsAwarded: number;
    levelUp: boolean;
    level?: number;
    correctAnswers: number;
    totalQuestions: number;
    timeBonus: number;
  } | null>(null);
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];

  // Fetch map zones to find the current mini-game node
  const { data: mapZones } = useQuery<MapZone[]>({
    queryKey: ["/api/map-zones"],
    queryFn: () => mapService.getAllMapZones(),
  });

  // Find the active node for this mini-game (assumed to be of type 'mini-game' or 'mini-task')
  const [activeNode, setActiveNode] = useState<{ zoneId: number, nodeId: string } | null>(null);

  // Find the map node that represents this mini-game
  useEffect(() => {
    if (mapZones && miniGame) {
      // Find a zone with a mini-game node that's current or available
      for (const zone of mapZones) {
        // Find a 'mini-game', 'mini-task', or 'boss' type node that's either 'current' or 'available'
        const gameNode = zone.config.nodes.find(node => 
          ((node.type === 'mini-game' || node.type === 'mini-task' || node.type === 'boss') && 
           (node.status === 'current' || node.status === 'available'))
        );
        
        if (gameNode) {
          setActiveNode({ zoneId: zone.id, nodeId: gameNode.id });
          break;
        }
      }
    }
  }, [mapZones, miniGame]);

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Auto-submit if time runs out
          if (selectedChoice) {
            handleSubmitAnswer();
          } else {
            // If no choice selected, just move to next question
            moveToNextQuestion();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerActive, selectedChoice]);

  const moveToNextQuestion = () => {
    // Go to next question or finish game
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedChoice(null);
      setShowHint(false);
      setFeedbackState('none');
      setTimeLeft(120); // Reset timer for next question
      setIsTimerActive(true);
    } else {
      // Game is complete - award bonus for any remaining time
      const timeBonus = Math.floor(timeLeft / 10);
      const finalScore = score + timeBonus;
      
      // Count correct answers - since we're not tracking all answers,
      // we'll estimate based on the score (each correct answer is worth at least 10 points)
      const estimatedCorrectAnswers = Math.min(
        Math.floor(score / 10),
        questions.length
      );
      
      // Use the mini-game service to complete the mini-game and award rewards
      miniGameService.completeMiniGame(childId, miniGame.id, finalScore)
        .then((result: {
          childProfile: ChildProfile;
          xpAwarded: number;
          coinsAwarded: number;
          levelUp: boolean;
        }) => {
          // Set the game results for the completion screen
          setGameResults({
            xpAwarded: result.xpAwarded,
            coinsAwarded: result.coinsAwarded,
            levelUp: result.levelUp,
            level: result.childProfile.level,
            correctAnswers: estimatedCorrectAnswers,
            totalQuestions: questions.length,
            timeBonus: timeBonus
          });
          
          // Show completion notification
          toast({
            title: "Mini-Game Completed!",
            description: `You've earned ${result.xpAwarded} XP and ${result.coinsAwarded} coins.`,
          });
          
          // Show level up notification if applicable
          if (result.levelUp) {
            toast({
              title: "Level Up!",
              description: (
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>Congratulations! You've reached level {result.childProfile.level}!</span>
                </div>
              ),
              variant: "default",
            });
          }
          
          // Update map progress if we found an active node for this mini-game
          if (activeNode) {
            // Determine quest type based on node type
            const nodeType = mapZones?.find(z => z.id === activeNode.zoneId)?.config.nodes
              .find(n => n.id === activeNode.nodeId)?.type || 'mini-game';
            
            // Mark the node as completed and update the map with the correct quest type
            progressService.completeQuest(
              activeNode.zoneId,
              activeNode.nodeId,
              childId,
              nodeType === 'boss' ? 'boss' : 'mini-game',
              miniGame.id
            )
            .then(() => {
              // Invalidate map zones data to refresh the map
              queryClient.invalidateQueries({ queryKey: ["/api/map-zones"] });
              
              toast({
                title: "Map Progress Updated!",
                description: "You've unlocked new adventures on the map!",
                variant: "default",
              });
            })
            .catch(err => {
              console.error("Error updating map progress:", err);
            });
          }
          
          // Set the game to completed state
          setGameCompleted(true);
          setIsTimerActive(false);
        })
        .catch(() => {
          // Calculate rewards using the utility function from miniGameService
          const rewards = miniGameService.calculateRewards(miniGame, finalScore);
          
          // Set the game results for the completion screen
          setGameResults({
            xpAwarded: rewards.xp,
            coinsAwarded: rewards.coins,
            levelUp: false,
            correctAnswers: estimatedCorrectAnswers,
            totalQuestions: questions.length,
            timeBonus: timeBonus
          });
          
          // Show completion notification
          toast({
            title: "Mini-Game Completed!",
            description: `You've earned ${rewards.xp} XP and ${rewards.coins} coins.`,
          });
          
          // Update map progress if we found an active node for this mini-game (fallback method)
          if (activeNode) {
            // Determine quest type based on node type
            const nodeType = mapZones?.find(z => z.id === activeNode.zoneId)?.config.nodes
              .find(n => n.id === activeNode.nodeId)?.type || 'mini-game';
            
            // Mark the node as completed and update the map with the correct quest type
            progressService.completeQuest(
              activeNode.zoneId,
              activeNode.nodeId,
              childId,
              nodeType === 'boss' ? 'boss' : 'mini-game',
              miniGame.id
            )
            .then(() => {
              // Invalidate map zones data to refresh the map
              queryClient.invalidateQueries({ queryKey: ["/api/map-zones"] });
            })
            .catch(err => {
              console.error("Error updating map progress:", err);
            });
          }
          
          // Set the game to completed state
          setGameCompleted(true);
          setIsTimerActive(false);
        });
    }
  };
  
  // Submit answer mutation using the miniGameService
  const submitAnswerMutation = useMutation({
    mutationFn: (data: { childId: number, questionId: number, selectedChoiceId: string, isCorrect: boolean }) => {
      return miniGameService.recordAnswer(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles", childId] });
      
      // Update feedback state and score
      setFeedbackState(variables.isCorrect ? 'correct' : 'incorrect');
      if (variables.isCorrect) {
        // Award more points for faster answers
        const speedBonus = Math.floor(timeLeft / 5);
        const questionScore = 10 + speedBonus;
        setScore(prev => prev + questionScore);
      }
      
      // Pause the timer while showing feedback
      setIsTimerActive(false);
      
      // Show feedback for 1.5 seconds before moving to next question
      setTimeout(() => {
        moveToNextQuestion();
      }, 1500);
    },
  });
  
  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedChoice) return;
    
    // Check if answer is correct
    const isCorrect = selectedChoice === currentQuestion.correctAnswerId;
    
    submitAnswerMutation.mutate({
      childId,
      questionId: currentQuestion.id,
      selectedChoiceId: selectedChoice,
      isCorrect
    });
  };
  
  const handleToggleHint = () => {
    setShowHint(!showHint);
  };
  
  // Render question image (for the potion question)
  const renderQuestionImage = () => {
    if (currentQuestion.text.includes("potion")) {
      return (
        <div className="flex justify-center mb-6">
          <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-36 h-36">
              <defs>
                <linearGradient id="potionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              
              {/* Potion Bottle */}
              <path d="M40,20 L40,35 C30,40 25,50 25,65 C25,80 35,90 50,90 C65,90 75,80 75,65 C75,50 70,40 60,35 L60,20 Z" fill="none" stroke="#6C63FF" strokeWidth="2" />
              
              {/* Potion Liquid (1/3 used, 2/3 full) */}
              <path d="M40,48 C32,50 30,55 30,65 C30,77 38,85 50,85 C62,85 70,77 70,65 C70,55 68,50 60,48 L60,35 L40,35 Z" fill="url(#potionGradient)" />
              
              {/* Bottle Cap */}
              <rect x="40" y="15" width="20" height="5" rx="2" fill="#6C63FF" />
            </svg>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Get feedback message based on current state
  const getFeedbackMessage = () => {
    switch (feedbackState) {
      case 'correct':
        return (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-4 flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">Correct! Great job!</span>
          </div>
        );
      case 'incorrect':
        return (
          <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4 flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">Incorrect. The correct answer was: {
              currentQuestion.choices.find(c => c.id === currentQuestion.correctAnswerId)?.text
            }</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = (currentQuestionIndex / questions.length) * 100;
  
  // Handle returning to map
  const handleReturnToMap = () => {
    onGameComplete();
  };

  // Render completion screen
  if (gameCompleted && gameResults) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Completion Header */}
        <div className="bg-gradient-to-r from-primary to-purple-600 p-4 text-white">
          <div className="text-center">
            <h2 className="text-xl font-heading font-bold mb-1">Quest Complete!</h2>
            <p className="text-sm opacity-90">Congratulations on completing {miniGame.name}</p>
          </div>
        </div>
        
        {/* Game Results */}
        <div className="p-6">
          {/* Achievement Banner with Pippin */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="h-14 w-14 text-yellow-500" />
              </div>
              <div className="absolute -right-10 -bottom-2">
                <PippinHint 
                  hint="You did amazing! Your magical knowledge is growing stronger!"
                  size="lg"
                  isModal={true}
                />
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-center mb-2">You Did It!</h3>
          <p className="text-gray-600 text-center mb-6">
            Well done on completing this magical challenge.
          </p>
          
          {/* Rewards Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary bg-opacity-10 rounded-lg p-4 flex flex-col items-center">
              <Star className="h-6 w-6 text-primary mb-1" />
              <span className="text-lg font-bold text-primary">{gameResults.xpAwarded} XP</span>
              <span className="text-xs text-gray-500">Experience Points</span>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4 flex flex-col items-center">
              <Coins className="h-6 w-6 text-yellow-500 mb-1" />
              <span className="text-lg font-bold text-yellow-600">{gameResults.coinsAwarded} Coins</span>
              <span className="text-xs text-gray-500">Magical Currency</span>
            </div>
          </div>
          
          {/* Performance Stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center justify-center">
              <BarChart className="h-5 w-5 mr-2 text-primary" />
              Your Performance
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Correct Answers</div>
                <div className="font-medium">
                  {gameResults.correctAnswers}/{gameResults.totalQuestions}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Time Bonus</div>
                <div className="font-medium flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-1 text-primary" />
                  <span>+{gameResults.timeBonus} pts</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Level Up Alert (if applicable) */}
          {gameResults.levelUp && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-4 mb-6 text-white flex items-center justify-center">
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Zap className="h-5 w-5 mr-1" />
                  <span className="font-bold">LEVEL UP!</span>
                </div>
                <div className="text-sm opacity-90">
                  You're now a level {gameResults.level} wizard!
                </div>
              </div>
            </div>
          )}
          
          {/* Continue Button */}
          <Button 
            className="w-full bg-primary text-white py-2 rounded-lg mt-4"
            onClick={handleReturnToMap}
          >
            Continue to Adventure Map
          </Button>
        </div>
      </div>
    );
  }
  
  // Regular game screen
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Mini-Game Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 p-4 text-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-heading font-bold">{miniGame.name}</h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-1" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-1" />
              <span>{miniGame.xpReward} XP</span>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="flex items-center text-sm">
          <span className="mr-2">Question {currentQuestionIndex + 1}/{questions.length}</span>
          <div className="flex-grow">
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <span className="ml-2">Score: {score}</span>
        </div>
      </div>
      
      {/* Question Content */}
      <div className="p-6 relative">
        {/* Pippin Hint */}
        <div className="absolute top-3 right-3">
          <FloatingPippinHint 
            hint={showHint && currentQuestion.hint ? currentQuestion.hint : "Need help? Click the hint button below!"}
          />
        </div>
      
        {/* Feedback Message */}
        {getFeedbackMessage()}
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
          
          {/* Question Image (if applicable) */}
          {renderQuestionImage()}
          
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.choices.map((choice: Choice) => {
              // Determine if this choice should show correct/incorrect styling
              let choiceStyle = '';
              if (feedbackState !== 'none') {
                if (choice.id === currentQuestion.correctAnswerId) {
                  choiceStyle = 'border-green-500 bg-green-50';
                } else if (selectedChoice === choice.id && choice.id !== currentQuestion.correctAnswerId) {
                  choiceStyle = 'border-red-500 bg-red-50';
                }
              } else if (selectedChoice === choice.id) {
                choiceStyle = 'border-primary bg-primary bg-opacity-5';
              } else {
                choiceStyle = 'border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5';
              }
              
              return (
                <button 
                  key={choice.id}
                  className={`w-full text-left px-4 py-3 border-2 ${choiceStyle} rounded-lg transition-colors flex items-center`}
                  onClick={() => feedbackState === 'none' && handleChoiceSelect(choice.id)}
                  disabled={feedbackState !== 'none'}
                >
                  <div className={`h-6 w-6 rounded-full ${
                    selectedChoice === choice.id 
                      ? 'border-2 border-primary bg-primary flex items-center justify-center' 
                      : 'border-2 border-gray-300'
                  } mr-3 flex-shrink-0`}>
                    {selectedChoice === choice.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span>{choice.text}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Hint Section */}
        <div className="mt-4 text-center">
          {currentQuestion.hint && feedbackState === 'none' && (
            <div>
              <Button 
                variant="link" 
                className="text-primary hover:underline flex items-center mx-auto"
                onClick={handleToggleHint}
              >
                <Info className="h-5 w-5 mr-1" />
                {showHint ? "Hide hint" : "Need a hint?"}
              </Button>
              
              {showHint && (
                <div className="mt-2 p-3 bg-primary bg-opacity-10 rounded-lg text-sm">
                  <div className="flex items-start gap-3">
                    <PippinHint 
                      hint="Pippin is here to help! Consider this magical hint."
                      size="md"
                      isModal={true}
                    />
                    <div>{currentQuestion.hint}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Time and score indicator */}
        {timeLeft < 30 && timeLeft > 0 && feedbackState === 'none' && (
          <div className={`mt-4 text-center text-sm ${timeLeft < 10 ? 'text-red-500 font-bold' : 'text-amber-600'}`}>
            Time is running out! {timeLeft} seconds left
          </div>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between">
        <Link href="/adventure">
          <Button variant="ghost" className="text-gray-600 hover:text-primary flex items-center">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Return to Map
          </Button>
        </Link>
        <Button 
          className="bg-primary text-white hover:bg-opacity-90"
          onClick={handleSubmitAnswer}
          disabled={!selectedChoice || submitAnswerMutation.isPending || feedbackState !== 'none'}
        >
          {submitAnswerMutation.isPending ? "Submitting..." : "Submit Answer"}
        </Button>
      </div>
      
      {/* Floating Pippin Guide */}
      <FloatingPippinHint 
        hint={
          selectedChoice 
            ? "Great choice! Click 'Submit Answer' when you're ready to continue."
            : "Read the question carefully and select the best answer. Click the hint button if you need help!"
        } 
      />
    </div>
  );
}
