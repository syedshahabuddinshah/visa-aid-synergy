import { Button } from "@/components/ui/button";
import CountryCard from "@/components/CountryCard";
import { useRecommendations } from "@/contexts/RecommendationsContext";
import { useNavigate } from "react-router-dom";

const RecommendationsList = () => {
  const { recommendations, resetRecommendations } = useRecommendations();
  const navigate = useNavigate();

  if (recommendations.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No recommendations available. Please complete the questionnaire.</p>
      </div>
    );
  }

  const handleStartOver = () => {
    resetRecommendations();
    sessionStorage.removeItem('tempProfile');
    sessionStorage.removeItem('lastStep');
    window.location.reload();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-2xl font-bold text-primary text-center">Recommended Visa Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation, index) => (
          <CountryCard key={index} recommendation={recommendation} />
        ))}
      </div>
      <div className="flex justify-center">
        <Button onClick={handleStartOver} variant="outline" className="mt-4">
          Start Over
        </Button>
      </div>
    </div>
  );
};

export default RecommendationsList;