import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";
import { MobileNav } from "@/components/layout/MobileNav";

export default function HomePage() {
  const { user, isLoading, activeChildSession } = useAuth();
  const [, navigate] = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If not logged in, redirect to auth page
  if (!user && !isLoading) {
    navigate("/auth");
    return null;
  }
  
  // If there's an active child session, redirect to adventure page
  if (activeChildSession) {
    navigate("/adventure");
    return null;
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
