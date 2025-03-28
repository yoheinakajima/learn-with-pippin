import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import { ChildProfile } from "@/components/dashboard/ChildProfile";
import { SectionContainer } from "@/components/ui/sectionContainer";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { ChildProfile as ChildProfileType } from "@/lib/types";
import { Loader2 } from "lucide-react";

export function ParentDashboard() {
  const { user, childProfiles, childProfilesLoading } = useAuth();
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6 bg-white rounded-md p-4 shadow-md">
        <h2 className="text-2xl font-heading font-bold">Parent Dashboard</h2>
        <Link href="/child-profile/new">
          <div>
            <Button className="flex-1 bg-secondary text-white hover:bg-opacity-90 w-full sm:w-auto lg:w-full 2xl:w-auto">
              <Plus className="h-8 w-8" />
              Add Child Profile
            </Button>
          </div>
        </Link>
      </div>
      
      {/* Child Profiles */}
      <SectionContainer title="Child Profiles">
      {childProfilesLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : childProfiles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {childProfiles.map((profile: ChildProfileType) => (
            <ChildProfile key={profile.id} profile={profile} />
          ))}
          
          {/* Add New Child Card */}
          <Link href="/child-profile/new">
            <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors cursor-pointer group">
              <div className="h-16 w-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary">
                <Plus className="h-8 w-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-medium text-center mb-2 group-hover:text-white">Add New Child</h3>
              <p className="text-gray-500 text-center text-sm group-hover:text-white">Create a new profile for another child</p>
            </div>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="h-16 w-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Child Profiles Yet</h3>
          <p className="text-gray-500 mb-6">Create your first child profile to begin the magical learning adventure!</p>
          <Link href="/child-profile/new">
            <div>
              <Button className="bg-primary">Create Child Profile</Button>
            </div>
          </Link>
        </div>
      )}
      </SectionContainer>
      
      {/* Analytics Overview - Only show if there are child profiles */}
      {childProfiles.length > 0 && (
        <AnalyticsSection profiles={childProfiles} />
      )}
    </div>
  );
}
