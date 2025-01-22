import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecommendationsProvider } from "@/contexts/RecommendationsContext";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RecommendationsProvider>
        <Toaster />
        <Sonner />
        <Index />
      </RecommendationsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;