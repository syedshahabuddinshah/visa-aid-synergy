import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { RecommendationsProvider } from "@/contexts/RecommendationsContext";
import Header from "@/components/layout/Header";
import Questionnaire from "@/components/Questionnaire";
import RecommendationsList from "@/components/recommendations/RecommendationsList";
import type { UserProfile } from "@/components/Questionnaire";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserEmail(user?.email || null);
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserEmail(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <RecommendationsProvider>
      <div className="min-h-screen bg-secondary">
        <div className="container py-8">
          <Header 
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            onSignOut={handleSignOut}
          />
          <Questionnaire onComplete={() => {}} />
          <RecommendationsList />
        </div>
      </div>
    </RecommendationsProvider>
  );
};

export default Index;