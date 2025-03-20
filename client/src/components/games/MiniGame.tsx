import { useState, useEffect } from "react";
import { MiniGame as MiniGameType, Question, Choice } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Star, Info, CheckCircle2, XCircle, Trophy, Zap } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { miniGameService } from "@/services";

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
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];

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
      
      // Use the mini-game service to complete the mini-game and award rewards
      miniGameService.completeMiniGame(childId, miniGame.id, finalScore)
        .then(result => {
          toast({
            title: "Mini-Game Completed!",
            description: `You've earned ${result.xpAwarded} XP and ${result.coinsAwarded} coins.`,
          });
          
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
          
          onGameComplete();
        })
        .catch(() => {
          // Calculate rewards using the utility function from miniGameService
          const rewards = miniGameService.calculateRewards(miniGame, finalScore);
          
          // Fallback to simple notification if service call fails
          toast({
            title: "Mini-Game Completed!",
            description: `You've earned ${rewards.xp} XP and ${rewards.coins} coins.`,
          });
          onGameComplete();
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
      <div className="p-6">
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
                  {currentQuestion.hint}
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
    </div>
  );
}
