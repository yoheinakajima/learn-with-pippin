import { useState } from "react";
import { MiniGame as MiniGameType, Question, Choice } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Star, Info } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

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
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { childId: number, questionId: number, selectedChoiceId: string, isCorrect: boolean }) => {
      const res = await apiRequest("POST", "/api/answers", {
        ...data,
        timestamp: new Date().toISOString()
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles", childId] });
      
      // Go to next question or finish game
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedChoice(null);
        setShowHint(false);
      } else {
        // Game is complete
        toast({
          title: "Mini-Game Completed!",
          description: `You've earned ${miniGame.xpReward} XP and ${miniGame.coinReward} coins.`,
        });
        onGameComplete();
      }
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
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Mini-Game Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 p-4 text-white">
        <div className="flex justify-between items-center">
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
      </div>
      
      {/* Question Content */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
          
          {/* Question Image (if applicable) */}
          {renderQuestionImage()}
          
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.choices.map((choice: Choice) => (
              <button 
                key={choice.id}
                className={`w-full text-left px-4 py-3 border-2 ${
                  selectedChoice === choice.id 
                    ? 'border-primary bg-primary bg-opacity-5' 
                    : 'border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5'
                } rounded-lg transition-colors flex items-center`}
                onClick={() => handleChoiceSelect(choice.id)}
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
            ))}
          </div>
        </div>
        
        {/* Hint Section */}
        <div className="mt-4 text-center">
          {currentQuestion.hint && (
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
          disabled={!selectedChoice || submitAnswerMutation.isPending}
        >
          {submitAnswerMutation.isPending ? "Submitting..." : "Submit Answer"}
        </Button>
      </div>
    </div>
  );
}
