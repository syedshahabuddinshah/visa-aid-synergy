import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, initializeSession } from "@/lib/supabase";
import { RecommendationsProvider } from "@/contexts/RecommendationsContext";
import Header from "@/components/layout/Header";
import Questionnaire from "@/components/Questionnaire";
import RecommendationsList from "@/components/recommendations/RecommendationsList";
import type { UserProfile } from "@/components/Questionnaire";
import { useRecommendations } from "@/contexts/RecommendationsContext";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();
  const { recommendations } = useRecommendations();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        // Initialize session and get current user
        await initializeSession();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          throw error || new Error('No user found');
        }

        setIsAuthenticated(true);
        setUserEmail(user.email);
      } catch (error: any) {
        console.error("Auth error:", error.message);
        setIsAuthenticated(false);
        setUserEmail(null);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserEmail(null);
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserEmail(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container py-8">
        <Header 
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          onSignOut={handleSignOut}
        />
        {recommendations.length === 0 ? (
          <Questionnaire onComplete={() => {}} />
        ) : (
          <RecommendationsList />
        )}
      </div>
    </div>
  );
};

export default Index;