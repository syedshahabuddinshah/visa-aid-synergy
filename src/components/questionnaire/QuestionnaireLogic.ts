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
      // Enhanced fallback recommendations based on user profile
      return this.generateFallbackRecommendations(profile);
    }
  }

  private generateFallbackRecommendations(profile: UserProfile) {
    const recommendations = [];
    
    // Common destinations with different visa pathways
    const countries = [
      {
        name: "Canada",
        visaTypes: ["Express Entry", "Study Permit", "Work Permit"],
        baseScore: 0.85
      },
      {
        name: "Australia",
        visaTypes: ["Skilled Migration", "Student Visa", "Temporary Work Visa"],
        baseScore: 0.8
      },
      {
        name: "United Kingdom",
        visaTypes: ["Skilled Worker Visa", "Student Visa", "Graduate Route"],
        baseScore: 0.75
      }
    ];

    countries.forEach(country => {
      let eligibilityScore = country.baseScore;
      let eligibilityReason = [];
      let applicableVisas = [];

      // Adjust score based on age
      const age = parseInt(profile.age);
      if (age >= 25 && age <= 35) {
        eligibilityScore += 0.1;
        eligibilityReason.push("Age is within optimal range");
      }

      // Adjust for education
      if (profile.education.includes("Master") || profile.education.includes("PhD")) {
        eligibilityScore += 0.1;
        eligibilityReason.push("Higher education qualification");
        applicableVisas.push(...country.visaTypes.filter(v => v.includes("Skilled")));
      }

      // Adjust for work experience
      const workExp = parseInt(profile.workExperience);
      if (workExp >= 3) {
        eligibilityScore += 0.1;
        eligibilityReason.push("Sufficient work experience");
        applicableVisas.push(...country.visaTypes.filter(v => v.includes("Work")));
      }

      // Consider language proficiency
      if (profile.languageScore.toLowerCase().includes("advanced") || 
          profile.languageScore.toLowerCase().includes("proficient")) {
        eligibilityScore += 0.1;
        eligibilityReason.push("Strong language proficiency");
      }

      // Consider available funds
      const funds = parseInt(profile.availableFunds);
      if (funds >= 20000) {
        eligibilityScore += 0.1;
        eligibilityReason.push("Adequate financial resources");
      }

      // If no specific visas were added based on profile, include study options
      if (applicableVisas.length === 0) {
        applicableVisas.push(...country.visaTypes.filter(v => v.includes("Student")));
      }

      // Normalize score to maximum of 1
      eligibilityScore = Math.min(eligibilityScore, 1);

      recommendations.push({
        name: country.name,
        score: eligibilityScore,
        requirements: [
          "Valid passport",
          "Meet health requirements",
          "Pass character requirements",
          ...eligibilityReason
        ],
        processingTime: "3-6 months",
        visaTypes: [...new Set(applicableVisas)],
        fundsRequired: country.name === "Canada" ? 15000 : 
                      country.name === "Australia" ? 20000 : 18000,
        eligibilityReason: eligibilityReason.join(". "),
        isEligible: eligibilityScore >= 0.6
      });
    });

    // Sort by score descending
    return recommendations.sort((a, b) => b.score - a.score);
  }
}