import { useState, useEffect } from "react";
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
import { ChevronDown, Menu, MapPin, Package, Home, Settings, LogOut, User, UserPlus } from "lucide-react";
import { Link } from "wouter";

export function Header({sidebarCollapsed, setSidebarCollapsed}: {sidebarCollapsed: boolean, setSidebarCollapsed: (collapsed: boolean) => void}) {
  const { user, activeChildSession, endChildSession, logout } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  // Update current path for active link highlighting
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  // Go back to parent dashboard
  const handleEndSession = () => {
    endChildSession();
    navigate("/");
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle sidebar collapse on desktop
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      {/* Top Navigation Bar - Only visible on small and medium screens */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 block lg:hidden">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <div className="flex items-center ml-2">
                <img
                  src="/images/pippin.svg"
                  alt="Pippin the unicorn"
                  className="h-14 w-14 mr-2"
                />
                <h1 className="text-xl font-heading font-bold text-special">Learn with Pippin</h1>
              </div>
            </div>

            <div className="flex items-center">
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
              <button
                onClick={toggleSidebar}
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 ml-2"
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 ${sidebarCollapsed ? 'w-16' : 'w-64'} h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-gray-200 lg:translate-x-0 transition-all duration-300`}
        aria-label="Sidebar"
      >
        {/* Logo in sidebar - visible on large screens */}
        <div className={`hidden lg:flex items-center ${sidebarCollapsed ? 'justify-center py-4' : 'p-5 pt-6 justify-between'}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <img
              src="/images/pippin.svg"
              alt="Pippin the unicorn"
              className={`${sidebarCollapsed ? 'h-10 w-10' : 'h-14 w-14'}`}
            />
            {!sidebarCollapsed && <h1 className="text-lg font-heading font-bold text-special ml-2">Learn with Pippin</h1>}
          </div>
          {!sidebarCollapsed && (
            <button 
              onClick={toggleSidebarCollapse} 
              className="text-gray-500 hover:text-primary"
            >
              <ChevronDown className="h-5 w-5 transform rotate-90" />
            </button>
          )}
        </div>

        {/* Collapse/Expand button when sidebar is collapsed */}
        {sidebarCollapsed && (
          <button 
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex items-center justify-center w-full mt-2 text-gray-500 hover:text-primary"
          >
            <ChevronDown className="h-5 w-5 transform -rotate-90" />
          </button>
        )}

        <div className="h-full px-3 pb-4 overflow-y-auto bg-white pt-5 lg:pt-3">
          <ul className="space-y-2 font-medium">
            {activeChildSession ? (
              <>
                <li>
                  <Link href="/adventure">
                    <a className={`flex items-center p-2 text-gray-900 rounded-lg ${currentPath === "/adventure" ? "bg-primary text-white" : "hover:bg-gray-100"} group`}>
                      <MapPin className={`w-5 h-5 transition ${currentPath === "/adventure" ? "text-white" : "text-gray-500 group-hover:text-primary"}`} />
                      {!sidebarCollapsed && <span className="flex-1 ms-3 whitespace-nowrap">Map</span>}
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href={`/inventory/${activeChildSession.childId}`}>
                    <a className={`flex items-center p-2 text-gray-900 rounded-lg ${currentPath.startsWith("/inventory") ? "bg-primary text-white" : "hover:bg-gray-100"} group`}>
                      <Package className={`w-5 h-5 transition ${currentPath.startsWith("/inventory") ? "text-white" : "text-gray-500 group-hover:text-primary"}`} />
                      {!sidebarCollapsed && <span className="flex-1 ms-3 whitespace-nowrap">Inventory</span>}
                    </a>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleEndSession}
                    className="flex w-full items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                  >
                    <Home className="w-5 h-5 text-gray-500 transition group-hover:text-primary" />
                    {!sidebarCollapsed && <span className="flex-1 ms-3 whitespace-nowrap text-left">Parent Dashboard</span>}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/">
                    <a className={`flex items-center p-2 text-gray-900 rounded-lg ${currentPath === "/" ? "bg-primary text-white" : "hover:bg-gray-100"} group`}>
                      <Home className={`w-5 h-5 transition ${currentPath === "/" ? "text-white" : "text-gray-500 group-hover:text-primary"}`} />
                      {!sidebarCollapsed && <span className="flex-1 ms-3 whitespace-nowrap">Parent Dashboard</span>}
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/child-profile/new">
                    <a className={`flex items-center p-2 text-gray-900 rounded-lg ${currentPath === "/child-profile/new" ? "bg-primary text-white" : "hover:bg-gray-100"} group`}>
                      <UserPlus className={`w-5 h-5 transition ${currentPath === "/child-profile/new" ? "text-white" : "text-gray-500 group-hover:text-primary"}`} />
                      {!sidebarCollapsed && <span className="flex-1 ms-3 whitespace-nowrap">Add Child Profile</span>}
                    </a>
                  </Link>
                </li>
                <li>
                  <a className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                    <Settings className="w-5 h-5 text-gray-500 transition group-hover:text-primary" />
                    {!sidebarCollapsed && <span className="flex-1 ms-3 whitespace-nowrap">Settings</span>}
                  </a>
                </li>
                <li>
                  <a 
                    onClick={() => logout()} 
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group cursor-pointer"
                  >
                    <LogOut className="w-5 h-5 text-gray-500 transition group-hover:text-primary" />
                    {!sidebarCollapsed && <span className="flex-1 ms-3 whitespace-nowrap">Log Out</span>}
                  </a>
                </li>
              </>
            )}
          </ul>
          <ul className="absolute bottom-10 left-0 right-0 pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
            <li>
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'ml-8'} mt-4`}>
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-medium mr-2">
                  {activeChildSession
                    ? activeChildSession.childName.charAt(0)
                    : user?.name.charAt(0) || "U"}
                </div>
                {!sidebarCollapsed && <span>{activeChildSession ? activeChildSession.childName : user?.name || "User"}</span>}
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}
