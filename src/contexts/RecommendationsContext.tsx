import { createContext, useContext, useState } from "react";
import { UserProfile } from "@/components/Questionnaire";
import { CountryRecommendation } from "@/components/CountryCard";

interface RecommendationsContextType {
  recommendations: CountryRecommendation[];
  setRecommendations: (recommendations: CountryRecommendation[]) => void;
  resetRecommendations: () => void;
}

const RecommendationsContext = createContext<RecommendationsContextType | undefined>(undefined);

export const RecommendationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [recommendations, setRecommendations] = useState<CountryRecommendation[]>([]);

  const resetRecommendations = () => setRecommendations([]);

  return (
    <RecommendationsContext.Provider value={{ recommendations, setRecommendations, resetRecommendations }}>
      {children}
    </RecommendationsContext.Provider>
  );
};

export const useRecommendations = () => {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error("useRecommendations must be used within a RecommendationsProvider");
  }
  return context;
};