import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

interface LeftHeaderLayoutProps {
  children: React.ReactNode;
}

export function LeftHeaderLayout({ children }: LeftHeaderLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Single Header component that handles its own responsiveness */}
        <Header sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
        
        <div className={`flex-1 ${sidebarCollapsed ? 'lg:ml-16': 'lg:ml-64' }`}>
          <main className="flex-grow p-4 mt-20 lg:mt-0 mb-20 mb:mb-0">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
} 