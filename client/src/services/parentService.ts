// Parent service for managing parent-specific operations
import { apiRequest } from "@/lib/queryClient";
import { ChildProfile, User, ActiveChildSession } from "@/lib/types";

// Local storage keys
const ACTIVE_CHILD_SESSION_KEY = "activeChildSession";

// Parent services
export const parentService = {
  // Get children profiles for a parent
  getChildProfiles: async (parentId: number): Promise<ChildProfile[]> => {
    const res = await apiRequest("GET", `/api/parents/${parentId}/children`);
    return await res.json();
  },
  
  // Start a child session (for parent-supervised child login)
  startChildSession: (child: ChildProfile): ActiveChildSession => {
    const session: ActiveChildSession = {
      childId: child.id,
      childName: child.name,
      parentId: child.parentId
    };
    
    // Store session in localStorage
    localStorage.setItem(ACTIVE_CHILD_SESSION_KEY, JSON.stringify(session));
    return session;
  },
  
  // End the current child session
  endChildSession: (): void => {
    localStorage.removeItem(ACTIVE_CHILD_SESSION_KEY);
  },
  
  // Get the current active child session, if any
  getActiveChildSession: (): ActiveChildSession | null => {
    const sessionJson = localStorage.getItem(ACTIVE_CHILD_SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  },
  
  // Add a new child profile
  createChildProfile: async (parentId: number, childData: {
    name: string;
    age: number;
    preferences: {
      subjects: string[];
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      readingLevel: number;
      mathLevel: number;
      skipKnownLessons: boolean;
    },
    avatarColor: 'primary' | 'accent' | 'secondary' | 'purple-500'
  }): Promise<ChildProfile> => {
    const res = await apiRequest("POST", "/api/child-profiles", {
      parentId,
      ...childData,
      // Initialize defaults for new profile
      level: 1,
      xp: 0,
      coins: 100,
      stats: {
        magicPower: 5,
        wisdom: 5,
        agility: 5
      },
      equipmentSlots: {}
    });
    
    return await res.json();
  },
  
  // Update an existing child profile
  updateChildProfile: async (childId: number, updates: Partial<ChildProfile>): Promise<ChildProfile> => {
    const res = await apiRequest("PUT", `/api/child-profiles/${childId}`, updates);
    return await res.json();
  },
  
  // Get analytics data for all children of a parent
  getChildrenAnalytics: async (parentId: number): Promise<{
    childId: number;
    childName: string;
    lessonsCompleted: number;
    correctAnswers: number;
    totalAnswers: number;
    subjectPerformance: { [subject: string]: number };
  }[]> => {
    const res = await apiRequest("GET", `/api/parents/${parentId}/children-analytics`);
    return await res.json();
  }
};