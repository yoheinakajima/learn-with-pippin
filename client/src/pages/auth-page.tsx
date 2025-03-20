import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to homepage if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);
  
  // Show loading while redirect is happening
  if (!isLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-heading font-bold text-primary">Quest-Map Adventure</h1>
            <p className="text-gray-600 mt-2 font-body">Begin your magical learning journey!</p>
          </div>
          
          <AuthForm />
        </div>
        
        {/* Hero Section */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-primary to-purple-600 p-8 text-white flex flex-col justify-center">
          <h2 className="text-2xl font-heading font-bold mb-4">Magical Adventures Await!</h2>
          <p className="mb-6">
            Embark on an educational journey through enchanted realms where learning 
            becomes a magical adventure. Create parent account and set up profiles for 
            your children to start their quest!
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Customized Learning</h3>
                <p className="text-sm text-white text-opacity-80">Tailored educational content based on age and abilities</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Magical Progression</h3>
                <p className="text-sm text-white text-opacity-80">Collect magical items and level up with every lesson completed</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Parental Insights</h3>
                <p className="text-sm text-white text-opacity-80">Track progress and achievements with detailed analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
