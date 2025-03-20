// Mini-Game service for managing mini-games and questions
import { apiRequest } from "@/lib/queryClient";
import { 
  MiniGame, 
  Question, 
  AnswerHistory,
  ChildProfile,
  Choice
} from "@/lib/types";

// Mini-game services
export const miniGameService = {
  // Get all mini-games
  getAllMiniGames: async (): Promise<MiniGame[]> => {
    const res = await apiRequest("GET", "/api/mini-games");
    return await res.json();
  },
  
  // Get a specific mini-game with its questions
  getMiniGame: async (id: number): Promise<MiniGame & { questions: Question[] }> => {
    const res = await apiRequest("GET", `/api/mini-games/${id}`);
    return await res.json();
  },
  
  // Get mini-games by difficulty
  getMiniGamesByDifficulty: async (difficulty: number): Promise<MiniGame[]> => {
    const res = await apiRequest("GET", `/api/mini-games/difficulty/${difficulty}`);
    return await res.json();
  },
  
  // Get mini-games by topic/subject
  getMiniGamesByTopic: async (topic: string): Promise<MiniGame[]> => {
    const res = await apiRequest("GET", `/api/mini-games/topic/${encodeURIComponent(topic)}`);
    return await res.json();
  },
  
  // Record a student's answer
  recordAnswer: async (data: {
    childId: number;
    questionId: number;
    selectedChoiceId: string;
    isCorrect: boolean;
  }): Promise<AnswerHistory> => {
    const res = await apiRequest("POST", "/api/answers", {
      ...data,
      timestamp: new Date().toISOString()
    });
    return await res.json();
  },
  
  // Record mini-game completion and award rewards
  completeMiniGame: async (childId: number, miniGameId: number, score: number): Promise<{
    childProfile: ChildProfile;
    xpAwarded: number;
    coinsAwarded: number;
    levelUp: boolean;
  }> => {
    const res = await apiRequest("POST", "/api/mini-game-completions", {
      childId,
      miniGameId,
      score,
      timestamp: new Date().toISOString()
    });
    return await res.json();
  },
  
  // Get a child's answer history for mini-games
  getAnswerHistory: async (childId: number): Promise<AnswerHistory[]> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/answer-history`);
    return await res.json();
  },
  
  // Get question details
  getQuestion: async (id: number): Promise<Question> => {
    const res = await apiRequest("GET", `/api/questions/${id}`);
    return await res.json();
  },
  
  // Get questions by topic
  getQuestionsByTopic: async (topic: string): Promise<Question[]> => {
    const res = await apiRequest("GET", `/api/questions/topic/${encodeURIComponent(topic)}`);
    return await res.json();
  },
  
  // Get questions by difficulty
  getQuestionsByDifficulty: async (difficulty: number): Promise<Question[]> => {
    const res = await apiRequest("GET", `/api/questions/difficulty/${difficulty}`);
    return await res.json();
  },
  
  // Get recommended mini-games for a child based on their profile and progress
  getRecommendedMiniGames: async (childId: number): Promise<MiniGame[]> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/recommended-mini-games`);
    return await res.json();
  },
  
  // Check if an answer is correct
  checkAnswer: (question: Question, selectedChoiceId: string): boolean => {
    return question.correctAnswerId === selectedChoiceId;
  },
  
  // Find the correct choice from question 
  getCorrectChoice: (question: Question): Choice | undefined => {
    return question.choices.find(choice => choice.id === question.correctAnswerId);
  },
  
  // Calculate mini-game rewards based on performance
  calculateRewards: (miniGame: MiniGame, score: number): {
    xp: number;
    coins: number;
  } => {
    // Apply a score multiplier (0.5 to 1.5)
    const multiplier = 0.5 + (score / 100);
    
    return {
      xp: Math.round(miniGame.xpReward * multiplier),
      coins: Math.round(miniGame.coinReward * multiplier)
    };
  }
};