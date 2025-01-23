import { UserProfile } from "../Questionnaire";

export class QuestionnaireLogic {
  generateRecommendations(profile: UserProfile) {
    return profile.preferredCountries.map(country => {
      const eligibilityData = this.calculateEligibility(country, profile);
      return {
        name: country,
        score: eligibilityData.score,
        requirements: eligibilityData.requirements,
        processingTime: eligibilityData.processingTime,
        visaTypes: eligibilityData.visaTypes,
        fundsRequired: eligibilityData.fundsRequired,
        eligibilityReason: eligibilityData.reason,
        isEligible: eligibilityData.isEligible,
      };
    });
  }

  private calculateEligibility(country: string, profile: UserProfile) {
    const availableFunds = parseInt(profile.availableFunds) || 0;
    const age = parseInt(profile.age) || 0;
    const workExp = parseInt(profile.workExperience) || 0;
    
    let score = 0;
    let requirements: string[] = [];
    let visaTypes: string[] = [];
    let fundsRequired = 0;
    let reason = "";
    let isEligible = true;

    switch(country) {
      case "Canada":
        fundsRequired = 13000;
        if (age >= 18 && age <= 35) score += 0.3;
        if (workExp >= 3) score += 0.3;
        if (profile.languageScore === "high") score += 0.4;
        
        visaTypes = ["Study Permit", "Work Permit", "Express Entry"];
        requirements = [
          `Minimum funds required: $${fundsRequired}`,
          "Valid passport",
          "Language proficiency test",
          "Educational credentials assessment",
        ];
        
        if (availableFunds < fundsRequired) {
          isEligible = false;
          reason = `Insufficient funds. You need minimum $${fundsRequired}`;
        } else {
          reason = "Eligible for multiple visa pathways based on profile";
        }
        break;

      default:
        fundsRequired = 10000;
        score = 0.5;
        visaTypes = ["Student Visa", "Work Visa"];
        requirements = ["Basic requirements"];
        reason = "Basic eligibility criteria met";
    }

    return {
      score: Math.min(score, 1),
      requirements,
      processingTime: "3-6 months",
      visaTypes,
      fundsRequired,
      reason,
      isEligible,
    };
  }
}