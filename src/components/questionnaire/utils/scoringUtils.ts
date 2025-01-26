import { VisaPointCategory, VisaType } from "../types/RecommendationTypes";
import { UserProfile } from "../../Questionnaire";

export const calculatePoints = (
  point: VisaPointCategory,
  profile: UserProfile
): number => {
  switch (point.category.toLowerCase()) {
    case "age":
      const age = parseInt(profile.age);
      return age >= 25 && age <= 35 ? point.available : Math.floor(point.available * 0.6);
    
    case "education":
      return profile.education.includes("phd") ? point.available :
             profile.education.includes("masters") ? Math.floor(point.available * 0.8) :
             profile.education.includes("bachelors") ? Math.floor(point.available * 0.6) :
             Math.floor(point.available * 0.3);
    
    case "work experience":
    case "experience":
      const workExp = parseInt(profile.workExperience);
      return workExp >= 5 ? point.available :
             workExp >= 3 ? Math.floor(point.available * 0.7) :
             Math.floor(point.available * 0.4);
    
    case "language":
    case "english level":
      const languageScore = profile.languageScore.toLowerCase();
      return languageScore.includes("advanced") ? point.available :
             languageScore.includes("intermediate") ? Math.floor(point.available * 0.7) :
             Math.floor(point.available * 0.4);
    
    default:
      return Math.floor(point.available * 0.6);
  }
};

export const calculateVisaScore = (
  visa: VisaType,
  profile: UserProfile
): { score: number; scoredPoints: VisaPointCategory[] } => {
  const scoredPoints = visa.points.map(point => ({
    ...point,
    scored: calculatePoints(point, profile)
  }));

  const totalPoints = scoredPoints.reduce((sum, point) => sum + (point.scored || 0), 0);
  const maxPoints = scoredPoints.reduce((sum, point) => sum + point.available, 0);
  const score = totalPoints / maxPoints;

  return { score, scoredPoints };
};

export const calculateFinancialScore = (
  funds: number,
  requiredFunds: number
): { score: number; reason: string } => {
  if (funds >= requiredFunds * 1.5) {
    return { score: 0.15, reason: "Strong financial position" };
  } else if (funds >= requiredFunds) {
    return { score: 0.05, reason: "Meets minimum financial requirements" };
  }
  return { score: -0.1, reason: "Additional funds may be required" };
};