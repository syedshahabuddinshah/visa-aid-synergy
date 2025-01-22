import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Questionnaire, { UserProfile } from "@/components/Questionnaire";
import CountryCard, { CountryRecommendation } from "@/components/CountryCard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [recommendations, setRecommendations] = useState<CountryRecommendation[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleSignIn = () => {
    navigate("/login", { state: { mode: 'signin' } });
  };

  const handleSignUp = () => {
    navigate("/login", { state: { mode: 'signup' } });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserEmail(null);
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateVisaRecommendations = (country: string, purpose: string) => {
    const visaTypes = {
      study: [
        {
          type: "Student Visa",
          requirements: [
            "Valid passport",
            "Acceptance letter from institution",
            "Proof of funds",
            "Language proficiency",
          ],
          processingTime: "4-8 weeks",
        },
        {
          type: "Exchange Student Visa",
          requirements: [
            "Exchange program acceptance",
            "Valid passport",
            "Sponsorship letter",
          ],
          processingTime: "3-6 weeks",
        },
      ],
      work: [
        {
          type: "Skilled Worker Visa",
          requirements: [
            "Job offer",
            "Work experience",
            "Language proficiency",
            "Educational credentials",
          ],
          processingTime: "8-12 weeks",
        },
        {
          type: "Working Holiday Visa",
          requirements: [
            "Age 18-30",
            "Valid passport",
            "Proof of funds",
          ],
          processingTime: "4-6 weeks",
        },
      ],
      permanent: [
        {
          type: "Permanent Residency",
          requirements: [
            "Points qualification",
            "Language proficiency",
            "Work experience",
            "Educational assessment",
          ],
          processingTime: "6-12 months",
        },
        {
          type: "Family Sponsorship",
          requirements: [
            "Family relation proof",
            "Sponsor eligibility",
            "Financial capability",
          ],
          processingTime: "12-24 months",
        },
      ],
    };

    return visaTypes[purpose as keyof typeof visaTypes].map(visa => ({
      name: country,
      score: Math.random() * 0.5 + 0.5,
      requirements: visa.requirements,
      processingTime: visa.processingTime,
      visaType: visa.type,
    }));
  };

  const generateRecommendations = (profile: UserProfile) => {
    const allRecommendations: CountryRecommendation[] = [];
    
    profile.preferredCountries.forEach(country => {
      const countryVisas = generateVisaRecommendations(country, profile.purpose);
      allRecommendations.push(...countryVisas);
    });

    allRecommendations.sort((a, b) => b.score - a.score);
    setRecommendations(allRecommendations);

    toast({
      title: "Recommendations Generated!",
      description: "Based on your profile, we've found the best visa options for you.",
    });
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-4">Immigration Assistant</h1>
            <p className="text-lg text-gray-600">
              Find your perfect immigration path with our AI-powered recommendation system
            </p>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{userEmail}</span>
                <Button onClick={handleSignOut} variant="destructive">
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button onClick={handleSignIn} variant="outline">
                  Sign In
                </Button>
                <Button onClick={handleSignUp}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>

        {recommendations.length === 0 ? (
          <Questionnaire onComplete={generateRecommendations} />
        ) : (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary text-center">Recommended Visa Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((recommendation, index) => (
                <CountryCard key={index} recommendation={recommendation} />
              ))}
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={() => setRecommendations([])} 
                variant="outline"
                className="mt-4"
              >
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;