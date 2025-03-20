// Learning service for managing lessons, questions, and educational content
import { apiRequest } from "@/lib/queryClient";
import { 
  Lesson, 
  Question, 
  LessonCompletion, 
  AnswerHistory,
  Choice
} from "@/lib/types";

// Learning content services
export const learningService = {
  // Get all available lessons
  getAllLessons: async (): Promise<Lesson[]> => {
    const res = await apiRequest("GET", "/api/lessons");
    return await res.json();
  },
  
  // Get a specific lesson by ID
  getLesson: async (id: number): Promise<Lesson> => {
    const res = await apiRequest("GET", `/api/lessons/${id}`);
    return await res.json();
  },
  
  // Get lessons by topic/subject
  getLessonsByTopic: async (topic: string): Promise<Lesson[]> => {
    const res = await apiRequest("GET", `/api/lessons/topic/${encodeURIComponent(topic)}`);
    return await res.json();
  },
  
  // Get lesson prerequisites
  getLessonPrerequisites: async (lessonId: number): Promise<Lesson[]> => {
    const res = await apiRequest("GET", `/api/lessons/${lessonId}/prerequisites`);
    return await res.json();
  },
  
  // Record a lesson completion
  recordLessonCompletion: async (data: {
    childId: number;
    lessonId: number;
    score: number;
  }): Promise<LessonCompletion> => {
    const res = await apiRequest("POST", "/api/lesson-completions", {
      ...data,
      timestamp: new Date().toISOString()
    });
    return await res.json();
  },
  
  // Get a single question by ID
  getQuestion: async (id: number): Promise<Question> => {
    const res = await apiRequest("GET", `/api/questions/${id}`);
    return await res.json();
  },
  
  // Get questions by topic
  getQuestionsByTopic: async (topic: string): Promise<Question[]> => {
    const res = await apiRequest("GET", `/api/questions/topic/${encodeURIComponent(topic)}`);
    return await res.json();
  },
  
  // Get questions by difficulty level
  getQuestionsByDifficulty: async (difficulty: number): Promise<Question[]> => {
    const res = await apiRequest("GET", `/api/questions/difficulty/${difficulty}`);
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
  
  // Get a child's answer history
  getAnswerHistory: async (childId: number): Promise<AnswerHistory[]> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/answer-history`);
    return await res.json();
  },
  
  // Get a child's lesson completion history
  getLessonCompletions: async (childId: number): Promise<LessonCompletion[]> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/lesson-completions`);
    return await res.json();
  },
  
  // Get recommended lessons for a child based on their profile and progress
  getRecommendedLessons: async (childId: number): Promise<Lesson[]> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/recommended-lessons`);
    return await res.json();
  },
  
  // Check if an answer is correct
  checkAnswer: (question: Question, selectedChoiceId: string): boolean => {
    return question.correctAnswerId === selectedChoiceId;
  },
  
  // Calculate the difficulty level appropriate for a child based on their performance
  calculateAppropriateDifficulty: async (childId: number): Promise<number> => {
    const res = await apiRequest("GET", `/api/child-profiles/${childId}/appropriate-difficulty`);
    const data = await res.json();
    return data.difficulty;
  }
};