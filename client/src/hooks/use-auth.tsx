import { createContext, ReactNode, useContext, useState } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, ChildProfile, ActiveChildSession } from "@/lib/types";

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
}

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

const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
    },
  });
};

const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
    },
  });
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [activeChildSession, setActiveChildSession] = useState<ActiveChildSession | null>(
    () => {
      const saved = localStorage.getItem("activeChildSession");
      return saved ? JSON.parse(saved) : null;
    }
  );

  // User authentication state
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (res.status === 401) {
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
  });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  // Handle login/register errors with toast notifications
  if (loginMutation.error) {
    toast({
      title: "Login failed",
      description: loginMutation.error.message,
      variant: "destructive",
    });
  }

  if (registerMutation.error) {
    toast({
      title: "Registration failed",
      description: registerMutation.error.message,
      variant: "destructive",
    });
  }

  // Child profiles for parent users
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

  const endChildSession = () => {
    setActiveChildSession(null);
    localStorage.removeItem("activeChildSession");
    
    toast({
      title: "Session Ended",
      description: "Returned to parent account",
    });
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
