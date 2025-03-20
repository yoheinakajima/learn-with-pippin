import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemGenerator } from "@/components/ai/ItemGenerator";
import { QuestionGenerator } from "@/components/ai/QuestionGenerator";
import { Wand2, Brain, Map, BookOpen, MessageSquare } from "lucide-react";

export default function AICreatorPage() {
  const [activeTab, setActiveTab] = useState("items");
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">AI Content Creator</h1>
          <p className="text-muted-foreground mt-1">
            Generate magical items, educational questions, and adventure content with AI
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              <span className="hidden md:inline">Magical Items</span>
              <span className="md:hidden">Items</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden md:inline">Questions</span>
              <span className="md:hidden">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="maps" className="flex items-center gap-2" disabled>
              <Map className="h-4 w-4" />
              <span className="hidden md:inline">Map Zones</span>
              <span className="md:hidden">Maps</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-2" disabled>
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:inline">Lessons</span>
              <span className="md:hidden">Learn</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2" disabled>
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Feedback</span>
              <span className="md:hidden">Feedback</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="pt-4">
            <ItemGenerator />
          </TabsContent>
          
          <TabsContent value="questions" className="pt-4">
            <QuestionGenerator />
          </TabsContent>
          
          <TabsContent value="maps" className="pt-4">
            <div className="text-center p-12 border-2 border-dashed rounded-lg">
              <Map className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold mt-4">Map Zone Generator Coming Soon</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Create immersive educational map zones with unique themes, landmarks, and learning nodes.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="lessons" className="pt-4">
            <div className="text-center p-12 border-2 border-dashed rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold mt-4">Lesson Generator Coming Soon</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Generate personalized lessons with engaging activities based on a child's interests and learning level.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="feedback" className="pt-4">
            <div className="text-center p-12 border-2 border-dashed rounded-lg">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold mt-4">Feedback Generator Coming Soon</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Create encouraging, educational feedback tailored to each child's performance and learning journey.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileNav />
    </div>
  );
}