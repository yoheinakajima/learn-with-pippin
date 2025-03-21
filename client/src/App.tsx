import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
// Import the authentication provider
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import AdventurePage from "@/pages/adventure-page";
import MasterMapPage from "@/pages/master-map-page";
import MiniGamePage from "@/pages/mini-game-page";
import LessonPage from "@/pages/lesson-page";
import InventoryPage from "@/pages/inventory-page";
import ChildProfilePage from "@/pages/child-profile-page";
import AICreatorPage from "@/pages/ai-creator-page";
import ProfilePage from "@/pages/profile-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/adventure/:zoneId?" component={AdventurePage} />
      <ProtectedRoute path="/master-map/:mapId?" component={MasterMapPage} />
      <ProtectedRoute path="/mini-game/:gameId" component={MiniGamePage} />
      <ProtectedRoute path="/lesson/:lessonId" component={LessonPage} />
      <ProtectedRoute path="/inventory/:childId" component={InventoryPage} />
      <ProtectedRoute path="/child-profile/new" component={ChildProfilePage} />
      <ProtectedRoute path="/child-profile/:childId" component={ChildProfilePage} />
      <ProtectedRoute path="/ai-creator" component={AICreatorPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
