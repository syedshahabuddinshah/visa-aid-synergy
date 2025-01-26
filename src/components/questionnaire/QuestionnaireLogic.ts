import { UserProfile } from "../Questionnaire";
import { supabase } from "@/lib/supabase";
import { countryData } from "./data/countryData";
import { calculateVisaScore, calculateFinancialScore } from "./utils/scoringUtils";
import { RecommendationResult } from "./types/RecommendationTypes";

export class QuestionnaireLogic {
  async generateRecommendations(profile: UserProfile) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { profile }
      });

      if (error) {
        console.error('Error from generate-recommendations:', error);
        throw error;
      }
      return data.recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.generateFallbackRecommendations(profile);
    }
  }

  private generateFallbackRecommendations(profile: UserProfile): RecommendationResult[] {
    const recommendations: RecommendationResult[] = [];
    
    // Only process selected countries
    profile.preferredCountries.forEach(countryName => {
      const country = countryData[countryName];
      if (!country) {
        console.warn(`Country data not found for ${countryName}`);
        return;
      }

      const baseRequirements = [
        "Valid passport",
        "Clean criminal record",
        "Medical examination clearance"
      ];

      if (profile.spouseIncluded) {
        baseRequirements.push("Spouse's documentation required");
      }
      if (parseInt(profile.numberOfDependents) > 0) {
        baseRequirements.push(`Documentation for ${profile.numberOfDependents} dependent(s)`);
      }

      // Get visa type based on selected purpose
      const visa = country.visaTypes[profile.purpose];
      if (!visa) {
        console.warn(`Visa type ${profile.purpose} not found for ${countryName}`);
        return;
      }

      const { score: visaScore, scoredPoints } = calculateVisaScore(visa, profile);
      const funds = parseInt(profile.availableFunds);
      const spouseFunds = profile.spouseIncluded ? Math.floor(visa.minFunds * 0.3) : 0;
      const dependentFunds = parseInt(profile.numberOfDependents) * Math.floor(visa.minFunds * 0.2);
      const totalRequiredFunds = visa.minFunds + spouseFunds + dependentFunds;

      const { score: financialScore, reason: financialReason } = calculateFinancialScore(
        funds,
        totalRequiredFunds
      );

      const eligibilityScore = Math.min(Math.max(visa.baseScore + visaScore + financialScore, 0), 1);

      recommendations.push({
        name: countryName,
        score: Number(eligibilityScore.toFixed(2)),
        requirements: baseRequirements,
        processingTime: country.processingTime[profile.purpose],
        visaTypes: [{
          name: visa.name,
          description: visa.description,
          points: scoredPoints,
          requiredFunds: {
            base: visa.minFunds,
            spouse: spouseFunds,
            perDependent: Math.floor(visa.minFunds * 0.2)
          }
        }],
        fundsRequired: visa.minFunds,
        dependentFunds: {
          spouse: spouseFunds,
          perDependent: Math.floor(visa.minFunds * 0.2)
        },
        eligibilityReason: financialReason,
        isEligible: eligibilityScore >= 0.6
      });
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }
}