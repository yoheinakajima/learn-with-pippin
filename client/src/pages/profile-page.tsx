import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { ProfileScreen } from "@/components/profile/ProfileScreen";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { activeChildSession } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if no active child session
  useEffect(() => {
    if (!activeChildSession) {
      navigate("/");
    }
  }, [activeChildSession, navigate]);
  
  if (!activeChildSession) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-grow">
        <ProfileScreen childId={activeChildSession.childId} />
      </div>
      <MobileNav />
    </div>
  );
}