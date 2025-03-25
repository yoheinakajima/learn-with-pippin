import React from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

interface LeftHeaderLayoutProps {
  children: React.ReactNode;
}

export function LeftHeaderLayout({ children }: LeftHeaderLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Single Header component that handles its own responsiveness */}
        <Header />
        
        <div className="flex-1 lg:ml-64">
          <main className="flex-grow p-4">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
} 