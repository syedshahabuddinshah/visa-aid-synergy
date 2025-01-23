import { UserProfile } from "../Questionnaire";
import { supabase } from "@/lib/supabase";

export class QuestionnaireLogic {
  async generateRecommendations(profile: UserProfile) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { profile }
      });

      if (error) throw error;
      return data.recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to basic recommendations if AI fails
      return profile.preferredCountries.map(country => ({
        name: country,
        score: 0.5,
        requirements: ["Basic eligibility requirements"],
        processingTime: "3-6 months",
        visaTypes: ["Student Visa", "Work Visa"],
        fundsRequired: 10000,
        eligibilityReason: "Basic eligibility check required",
        isEligible: true,
      }));
    }
  }
}