import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AutoScheduler from "@/pages/AutoScheduler";
import MindMirror from "@/pages/MindMirror";
import FinanceFlow from "@/pages/FinanceFlow";
import LifeGraph from "@/pages/LifeGraph";
import SmartAgent from "@/pages/SmartAgent";
import AppLayout from "@/components/layout/AppLayout";
import { useEffect } from "react";
import { useAppContext, AppProvider } from "./context/AppContext";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/auto-scheduler" component={AutoScheduler} />
        <Route path="/mind-mirror" component={MindMirror} />
        <Route path="/finance-flow" component={FinanceFlow} />
        <Route path="/life-graph" component={LifeGraph} />
        <Route path="/smart-agent" component={SmartAgent} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function AppWithContext() {
  const { fetchCurrentUser } = useAppContext();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppProvider>
          <AppWithContext />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
