import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, ChildProfile, ActiveChildSession } from "@/lib/types";

// Define types
type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  email: string;
  name: string;
  role: string;
};

// Define Auth Context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
  childProfiles: ChildProfile[];
  childProfilesLoading: boolean;
  activeChildSession: ActiveChildSession | null;
  startChildSession: (child: ChildProfile) => void;
  endChildSession: () => void;
  logout: () => void;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Get userId from localStorage if available
  const [userId, setUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem("userId");
    return saved ? parseInt(saved, 10) : null;
  });
  
  // Active child session state
  const [activeChildSession, setActiveChildSession] = useState<ActiveChildSession | null>(() => {
    const saved = localStorage.getItem("activeChildSession");
    return saved ? JSON.parse(saved) : null;
  });

  // User authentication query
  const {
    data: userData,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ["/api/user", userId],
    queryFn: async ({ queryKey }) => {
      try {
        // Skip the request if there's no userId
        if (!userId) {
          return null;
        }
        
        const endpoint = `${queryKey[0]}?userId=${userId}`;
        const res = await fetch(endpoint, {
          credentials: "include",
        });
        
        if (res.status === 401) {
          // If unauthorized, clear the userId from localStorage
          localStorage.removeItem("userId");
          setUserId(null);
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return await res.json();
      } catch (e) {
        console.error("Failed to fetch user:", e);
        return null;
      }
    },
    enabled: !!userId, // Only run the query if we have a userId
  });

  // Create a properly typed user variable
  const user = userData || null;

  // Define login mutation inside the component to access setUserId
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      localStorage.setItem("userId", user.id.toString());
      queryClient.setQueryData(["/api/user", user.id], user);
      setUserId(user.id);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Registration mutation hook
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: User) => {
      // Save user ID to localStorage for persistence
      localStorage.setItem("userId", user.id.toString());
      
      // Update the cache with the user data
      queryClient.setQueryData(["/api/user", user.id], user);
      setUserId(user.id);
      // Clear active child session
      setActiveChildSession(null);
      toast({
        title: "Registration Successful",
        description: `Welcome, ${user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Child profiles query for parent users
  const {
    data: childProfiles = [],
    isLoading: childProfilesLoading,
  } = useQuery<ChildProfile[]>({
    queryKey: ["/api/parents", user?.id, "children"],
    queryFn: async () => {
      if (!user || user.role !== "parent") return [];
      
      const res = await fetch(`/api/parents/${user.id}/children`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    },
    enabled: !!user && user.role === "parent",
  });

  // Logout function
  const logout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("userId");
    setUserId(null);
    
    // Clear active child session if exists
    if (activeChildSession) {
      setActiveChildSession(null);
      localStorage.removeItem("activeChildSession");
    }
    
    // Clear from query cache
    if (userId) {
      queryClient.setQueryData(["/api/user", userId], null);
    }
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  // Start child session function
  const startChildSession = (child: ChildProfile) => {
    const session: ActiveChildSession = {
      childId: child.id,
      childName: child.name,
      parentId: child.parentId
    };
    
    setActiveChildSession(session);
    localStorage.setItem("activeChildSession", JSON.stringify(session));
    
    toast({
      title: "Session Started",
      description: `Now playing as ${child.name}`,
    });
  };

  // End child session function
  const endChildSession = () => {
    setActiveChildSession(null);
    localStorage.removeItem("activeChildSession");
    
    toast({
      title: "Session Ended",
      description: "Returned to parent account",
    });
  };

  // Return the Auth Provider with context value
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        childProfiles,
        childProfilesLoading,
        activeChildSession,
        startChildSession,
        endChildSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export all needed components and hooks
export { AuthProvider, useAuth, AuthContext };