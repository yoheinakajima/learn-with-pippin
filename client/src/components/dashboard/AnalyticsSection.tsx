import { ChildProfile } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { SectionContainer } from "@/components/ui/sectionContainer";
import { CheckCircle2, Zap, BookOpen } from "lucide-react";

interface AnalyticsSectionProps {
  profiles: ChildProfile[];
}

export function AnalyticsSection({ profiles }: AnalyticsSectionProps) {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Adjust for Mon=0 format
  
  const engagementData = weekdays.map((day, index) => ({
    day,
    value: index === todayIndex ? Math.floor(Math.random() * 70) + 30 : 0,
    color: 'hsl(var(--primary))'
  }));
  // Generate subject progress data
  const subjects = [
    { name: 'Math', progress: 0, color: '#6C63FF' },
    { name: 'Reading', progress: 0, color: '#4CAF50' },
    { name: 'Science', progress: 0, color: '#FF9800' },
    { name: 'History', progress: 0, color: '#9C27B0' }
  ];

  // Generate recent achievements
  const achievements = [
    {
      title: 'Perfect Score!',
      childName: profiles[0]?.name || 'Child',
      type: 'Math Challenge',
      icon: <CheckCircle2 className="h-6 w-6 text-white" />,
      bgColor: 'bg-accent'
    },
    {
      title: 'Speed Wizard',
      childName: profiles.length > 1 ? profiles[1].name : profiles[0]?.name || 'Child',
      type: 'Quick Response',
      icon: <Zap className="h-6 w-6 text-white" />,
      bgColor: 'bg-primary'
    },
    {
      title: 'Book Worm',
      childName: profiles.length > 1 ? profiles[1].name : profiles[0]?.name || 'Child',
      type: '5 Stories Completed',
      icon: <BookOpen className="h-6 w-6 text-white" />,
      bgColor: 'bg-secondary'
    }
  ];

  return (
    <div className="mt-8">
        {/* <h3 className="text-xl font-heading font-bold mb-4">Learning Analytics</h3> */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Engagement Card */}
          <SectionContainer title="Weekly Engagement">
            <div className="h-40 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionContainer>

          {/* Subject Progress */}
          <SectionContainer title="Subject Progress">
            <div className="space-y-4">
              {subjects.map((subject, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{subject.name}</span>
                    <span className="text-sm text-gray-500">{subject.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            </SectionContainer>

          {/* Achievements */}
          <SectionContainer title="Recent Achievements">
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Start playing to unlock achievements!</p>
              {/* {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center">
                  <div className={`h-10 w-10 rounded-full ${achievement.bgColor} flex items-center justify-center mr-3`}>
                    {achievement.icon}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">{achievement.title}</h5>
                    <p className="text-xs text-gray-500">{achievement.childName} - {achievement.type}</p>
                  </div>
                </div>
              ))} */}
            </div>
            </SectionContainer>
        </div>
    </div>
  );
}
