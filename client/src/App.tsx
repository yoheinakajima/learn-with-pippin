import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
// Import the authentication provider
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import AdventurePage from "@/pages/adventure-page";
import MiniGamePage from "@/pages/mini-game-page";
import InventoryPage from "@/pages/inventory-page";
import ChildProfilePage from "@/pages/child-profile-page";
import AICreatorPage from "@/pages/ai-creator-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/adventure/:zoneId?" component={AdventurePage} />
      <Route path="/mini-game/:gameId" component={MiniGamePage} />
      <Route path="/inventory/:childId" component={InventoryPage} />
      <Route path="/child-profile/new" component={ChildProfilePage} />
      <Route path="/child-profile/:childId" component={ChildProfilePage} />
      <Route path="/ai-creator" component={AICreatorPage} />
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
