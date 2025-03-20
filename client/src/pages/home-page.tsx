import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";
import { MobileNav } from "@/components/layout/MobileNav";

export default function HomePage() {
  const { user, isLoading, activeChildSession } = useAuth();
  const [, navigate] = useLocation();
  
  // Use useEffect for navigation to avoid state updates during render
  useEffect(() => {
    if (!isLoading) {
      // If not logged in, redirect to auth page
      if (!user) {
        navigate("/auth");
      } 
      // If there's an active child session, redirect to adventure page
      else if (activeChildSession) {
        navigate("/adventure");
      }
    }
  }, [user, isLoading, activeChildSession, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Don't render the dashboard if we're going to redirect
  if (!user || activeChildSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-grow">
        <ParentDashboard />
      </div>
      <MobileNav />
    </div>
  );
}
