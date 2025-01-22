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
      setRecommendations([]);
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

  const generateVisaRecommendations = (profile: UserProfile) => {
    const allRecommendations: CountryRecommendation[] = [];
    
    profile.preferredCountries.forEach(country => {
      // Generate recommendations based on profile data
      const score = calculateScore(profile, country);
      const visaTypes = getVisaTypes(profile.purpose, country);
      
      visaTypes.forEach(visa => {
        allRecommendations.push({
          name: country,
          score: score,
          requirements: visa.requirements,
          processingTime: visa.processingTime,
          visaType: visa.type,
        });
      });
    });

    allRecommendations.sort((a, b) => b.score - a.score);
    setRecommendations(allRecommendations);

    toast({
      title: "Recommendations Generated!",
      description: "Based on your profile, we've found the best visa options for you.",
    });
  };

  const calculateScore = (profile: UserProfile, country: string): number => {
    let score = 0.5; // Base score

    // Age factor (25-35 gets highest score)
    const age = parseInt(profile.age);
    if (age >= 25 && age <= 35) score += 0.2;
    else if (age < 25 || age > 50) score -= 0.1;

    // Education factor
    if (profile.education === "phd") score += 0.2;
    else if (profile.education === "masters") score += 0.15;
    else if (profile.education === "bachelors") score += 0.1;

    // Work experience factor
    const experience = parseInt(profile.workExperience);
    if (experience >= 5) score += 0.2;
    else if (experience >= 3) score += 0.1;

    // Language score factor
    const languageScore = parseFloat(profile.languageScore);
    if (languageScore >= 7.0) score += 0.2;
    else if (languageScore >= 6.0) score += 0.1;

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  };

  const getVisaTypes = (purpose: string, country: string) => {
    // This could be expanded with more country-specific visa types
    const visaTypes = {
      study: [
        {
          type: "Student Visa",
          requirements: [
            "Valid passport",
            "Acceptance letter from institution",
            "Proof of funds",
            "Language proficiency test results",
          ],
          processingTime: "4-8 weeks",
        },
      ],
      work: [
        {
          type: "Skilled Worker Visa",
          requirements: [
            "Job offer from approved employer",
            "Minimum salary requirement",
            "Relevant work experience",
            "Language proficiency certification",
          ],
          processingTime: "8-12 weeks",
        },
      ],
      permanent: [
        {
          type: "Permanent Residency",
          requirements: [
            "Points qualification",
            "Language proficiency",
            "Work experience verification",
            "Educational credentials assessment",
            "Medical examination",
            "Police clearance",
          ],
          processingTime: "6-12 months",
        },
      ],
    };

    return visaTypes[purpose as keyof typeof visaTypes] || [];
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
          <Questionnaire onComplete={generateVisaRecommendations} />
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