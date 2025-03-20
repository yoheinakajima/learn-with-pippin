import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  BarChart2, 
  Play,
  CheckCircle2
} from "lucide-react";
import { ChildProfile as ChildProfileType } from "@/lib/types";

interface ChildProfileProps {
  profile: ChildProfileType;
}

export function ChildProfile({ profile }: ChildProfileProps) {
  const { startChildSession } = useAuth();
  
  // Calculate XP percentage for progress bar
  const xpNeeded = profile.level * 500; // Example calculation
  const xpPercentage = Math.min((profile.xp / xpNeeded) * 100, 100);
  
  // Generate gradient based on avatar color
  const getGradient = () => {
    switch(profile.avatarColor) {
      case 'accent':
        return 'from-accent to-yellow-500';
      case 'secondary':
        return 'from-secondary to-green-500';
      case 'purple-500':
        return 'from-purple-500 to-indigo-500';
      default:
        return 'from-primary to-purple-500';
    }
  };
  
  // Generate recent activity (based on real data now that we have lessons)
  const recentActivities = [
    { type: 'lesson', text: 'Available: "Magical Math Adventure"' },
    { type: 'mini-game', text: 'Available: "Forest Fraction Challenge"' }
  ];
  
  // Tooltip text
  const startSessionTooltip = "Start an adventure session for this child";
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className={`bg-gradient-to-r ${getGradient()} p-4`}>
        <div className="flex items-center">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mr-4">
            <div className={`h-14 w-14 rounded-full bg-${profile.avatarColor} flex items-center justify-center text-white font-bold text-xl`}>
              {profile.name.charAt(0)}
            </div>
          </div>
          <div>
            <h3 className="text-xl text-white font-medium">{profile.name}</h3>
            <p className="text-white text-opacity-80">Age: {profile.age}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Level {profile.level}</span>
            <span className="text-sm text-gray-500">XP: {profile.xp}/{xpNeeded}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className={`h-2 bg-${profile.avatarColor} rounded-full`}
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Available Content</h4>
          <div className="space-y-2 text-sm">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                <span>{activity.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link href={`/child-profile/${profile.id}`}>
            <Button 
              variant="outline" 
              className="flex-1 bg-primary bg-opacity-10 text-primary border-0 hover:bg-opacity-20"
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              View Progress
            </Button>
          </Link>
          <Button 
            className="flex-1 bg-secondary text-white hover:bg-opacity-90"
            onClick={() => startChildSession(profile)}
            title={startSessionTooltip}
          >
            <Play className="h-4 w-4 mr-1" />
            Start Adventure
          </Button>
        </div>
      </div>
    </div>
  );
}
