import { useState } from "react";
import Questionnaire, { UserProfile } from "@/components/Questionnaire";
import CountryCard, { CountryRecommendation } from "@/components/CountryCard";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [recommendations, setRecommendations] = useState<CountryRecommendation[]>([]);
  const { toast } = useToast();

  const generateRecommendations = (profile: UserProfile) => {
    // This is a mock recommendation generator. In a real app, this would call an AI service.
    const mockRecommendations: CountryRecommendation[] = profile.preferredCountries.map((country) => ({
      name: country,
      score: Math.random() * 0.5 + 0.5, // Score between 0.5 and 1
      requirements: [
        "Valid passport",
        `IELTS score: ${profile.languageScore}`,
        `${profile.education} degree required`,
        `${profile.workExperience} years of work experience`,
      ],
      processingTime: "3-6 months",
      visaType: profile.purpose === "study" ? "Student Visa" : profile.purpose === "work" ? "Work Visa" : "PR Visa",
    }));

    // Sort by score
    mockRecommendations.sort((a, b) => b.score - a.score);
    setRecommendations(mockRecommendations);

    toast({
      title: "Recommendations Generated!",
      description: "Based on your profile, we've found the best matches for you.",
    });
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Immigration Assistant</h1>
          <p className="text-lg text-gray-600">
            Find your perfect immigration path with our AI-powered recommendation system
          </p>
        </div>

        {recommendations.length === 0 ? (
          <Questionnaire onComplete={generateRecommendations} />
        ) : (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary text-center">Your Recommended Countries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((recommendation, index) => (
                <CountryCard key={index} recommendation={recommendation} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;