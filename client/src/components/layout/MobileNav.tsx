import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  MapIcon, 
  BookOpenText, 
  Briefcase,
  UserCircle,
  Wand2
} from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();
  const { activeChildSession } = useAuth();
  
  // Don't show mobile nav on auth page
  if (location === "/auth") {
    return null;
  }
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center shadow-lg z-10">
      {activeChildSession ? (
        // Child navigation
        <>
          <NavLink 
            href="/adventure" 
            icon={<MapIcon className="h-6 w-6" />}
            label="Map"
            isActive={location.startsWith("/adventure")}
          />
          <NavLink 
            href={`/inventory/${activeChildSession.childId}`}
            icon={<Briefcase className="h-6 w-6" />} 
            label="Inventory"
            isActive={location.startsWith("/inventory")}
          />
          <NavLink 
            href="/profile" 
            icon={<UserCircle className="h-6 w-6" />}
            label="Profile"
            isActive={location === "/profile"}
          />
        </>
      ) : (
        // Parent navigation
        <>
          <NavLink 
            href="/" 
            icon={<MapIcon className="h-6 w-6" />}
            label="Dashboard"
            isActive={location === "/"}
          />
          <NavLink 
            href="/child-profile/new"
            icon={<BookOpenText className="h-6 w-6" />} 
            label="Add Child"
            isActive={location === "/child-profile/new"}
          />
          <NavLink 
            href="/ai-creator"
            icon={<Wand2 className="h-6 w-6" />} 
            label="AI Creator"
            isActive={location === "/ai-creator"}
          />
          <NavLink 
            href="/profile" 
            icon={<UserCircle className="h-6 w-6" />}
            label="Profile"
            isActive={location === "/profile"}
          />
        </>
      )}
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavLink({ href, icon, label, isActive }: NavLinkProps) {
  return (
    <Link href={href}>
      <div className={`flex flex-col items-center py-2 px-3 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </div>
    </Link>
  );
}
