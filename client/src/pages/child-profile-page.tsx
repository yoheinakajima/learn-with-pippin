import { Header } from "@/components/layout/Header";
import { ChildProfileForm } from "@/components/dashboard/ChildProfileForm";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function ChildProfilePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if not logged in or not a parent
  if (user && user.role !== "parent") {
    navigate("/");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-heading font-bold mb-6">Create Child Profile</h2>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <ChildProfileForm />
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
