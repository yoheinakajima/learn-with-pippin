import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  const { user, activeChildSession, endChildSession } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Go back to parent dashboard
  const handleEndSession = () => {
    endChildSession();
    navigate("/");
  };
  
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/images/pippin.svg" 
            alt="Pippin the unicorn" 
            className="h-11 w-11 mr-2"
          />
          <h1 className="text-xl font-heading font-bold text-primary">Learn with Pippin</h1>
        </div>
        
        {/* Navigation Tabs - desktop only */}
        {activeChildSession ? (
          <nav className="hidden md:flex space-x-6">
            <Link href="/adventure">
              <span className="font-medium hover:text-primary transition cursor-pointer">Map</span>
            </Link>
            <Link href={`/inventory/${activeChildSession.childId}`}>
              <span className="font-medium hover:text-primary transition cursor-pointer">Inventory</span>
            </Link>
          </nav>
        ) : null}
        
        {/* User Menu */}
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-medium mr-1">
                  {activeChildSession 
                    ? activeChildSession.childName.charAt(0)
                    : user?.name.charAt(0) || "U"}
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {activeChildSession ? (
                <>
                  <DropdownMenuLabel>Playing as {activeChildSession.childName}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleEndSession}>
                    Return to Parent Dashboard
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>{user?.name || "User"}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate("/")}>
                    Parent Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/child-profile/new")}>
                    Add Child Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Log Out</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2 px-4">
          {activeChildSession ? (
            <div className="space-y-2">
              <Link href="/adventure">
                <span className="block py-2 hover:text-primary cursor-pointer">Map</span>
              </Link>
              <Link href={`/inventory/${activeChildSession.childId}`}>
                <span className="block py-2 hover:text-primary cursor-pointer">Inventory</span>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start pl-0 hover:text-primary" 
                onClick={handleEndSession}
              >
                Return to Parent Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/">
                <span className="block py-2 hover:text-primary cursor-pointer">Parent Dashboard</span>
              </Link>
              <Link href="/child-profile/new">
                <span className="block py-2 hover:text-primary cursor-pointer">Add Child Profile</span>
              </Link>
              <a className="block py-2 hover:text-primary">Settings</a>
              <a className="block py-2 hover:text-primary">Log Out</a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
