import { UserProfile } from "../Questionnaire";
import { supabase } from "@/lib/supabase";

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

  private generateFallbackRecommendations(profile: UserProfile) {
    const recommendations = [];
    
    // Filter for selected countries only
    const selectedCountries = profile.preferredCountries.length > 0 
      ? profile.preferredCountries 
      : ["Canada", "Australia", "United Kingdom", "New Zealand"];

    // Enhanced destination options with detailed criteria per visa type
    const countryData = {
      "Canada": {
        visaTypes: {
          study: {
            name: "Study Permit",
            description: "Canadian study permit for international students",
            baseScore: 0.85,
            minFunds: 20000,
            points: [
              { category: "Language", available: 20, details: "English/French proficiency" },
              { category: "Education", available: 15, details: "Previous education level" },
              { category: "Financial", available: 15, details: "Proof of funds" }
            ]
          },
          work: {
            name: "Work Permit",
            description: "Temporary work permit for skilled workers",
            baseScore: 0.8,
            minFunds: 15000,
            points: [
              { category: "Work Experience", available: 25, details: "Years of experience" },
              { category: "Language", available: 20, details: "Language proficiency" },
              { category: "Job Offer", available: 15, details: "Valid job offer" }
            ]
          },
          permanent: {
            name: "Express Entry",
            description: "Permanent residence through Express Entry system",
            baseScore: 0.75,
            minFunds: 25000,
            points: [
              { category: "Age", available: 12, details: "Age factor" },
              { category: "Education", available: 25, details: "Education level" },
              { category: "Experience", available: 15, details: "Work experience" },
              { category: "Language", available: 28, details: "Language skills" }
            ]
          }
        },
        processingTime: {
          study: "2-3 months",
          work: "2-4 months",
          permanent: "6-8 months"
        }
      },
      // ... Similar structure for other countries
    };

    selectedCountries.forEach(countryName => {
      const country = countryData[countryName] || countryData["Canada"]; // Fallback to Canada if country not found
      let eligibilityScore = 0.7; // Base score
      let eligibilityReason = [];
      let applicableVisas = [];
      
      // Basic requirements for all visa types
      let requirements = [
        "Valid passport",
        "Clean criminal record",
        "Medical examination clearance"
      ];

      // Add dependent-related requirements
      if (profile.spouseIncluded) {
        requirements.push("Spouse's documentation required");
      }
      if (parseInt(profile.numberOfDependents) > 0) {
        requirements.push(`Documentation for ${profile.numberOfDependents} dependent(s)`);
      }

      // Get visa type based on purpose
      const visaType = country.visaTypes[profile.purpose];
      if (visaType) {
        const scoredPoints = visaType.points.map(point => {
          let scored = 0;
          
          switch (point.category.toLowerCase()) {
            case "age":
              const age = parseInt(profile.age);
              scored = age >= 25 && age <= 35 ? point.available : Math.floor(point.available * 0.6);
              break;
            case "education":
              scored = profile.education.includes("phd") ? point.available :
                      profile.education.includes("masters") ? Math.floor(point.available * 0.8) :
                      Math.floor(point.available * 0.6);
              break;
            case "language":
              scored = profile.languageScore.includes("advanced") ? point.available :
                      profile.languageScore.includes("intermediate") ? Math.floor(point.available * 0.7) :
                      Math.floor(point.available * 0.4);
              break;
            default:
              scored = Math.floor(point.available * 0.6); // Default scoring
          }
          
          return { ...point, scored };
        });

        applicableVisas.push({
          name: visaType.name,
          description: visaType.description,
          points: scoredPoints,
          requiredFunds: {
            base: visaType.minFunds,
            spouse: profile.spouseIncluded ? Math.floor(visaType.minFunds * 0.3) : 0,
            perDependent: parseInt(profile.numberOfDependents) > 0 ? Math.floor(visaType.minFunds * 0.2) : 0
          }
        });

        // Calculate eligibility score based on points
        const totalPoints = scoredPoints.reduce((sum, point) => sum + point.scored, 0);
        const maxPoints = scoredPoints.reduce((sum, point) => sum + point.available, 0);
        eligibilityScore = totalPoints / maxPoints;
      }

      // Financial assessment
      const funds = parseInt(profile.availableFunds);
      const baseMinFunds = visaType?.minFunds || 15000;
      const spouseFunds = profile.spouseIncluded ? Math.floor(baseMinFunds * 0.3) : 0;
      const dependentFunds = parseInt(profile.numberOfDependents) * Math.floor(baseMinFunds * 0.2);
      const totalRequiredFunds = baseMinFunds + spouseFunds + dependentFunds;

      if (funds >= totalRequiredFunds * 1.5) {
        eligibilityScore += 0.15;
        eligibilityReason.push("Strong financial position");
      } else if (funds >= totalRequiredFunds) {
        eligibilityScore += 0.05;
        eligibilityReason.push("Meets minimum financial requirements");
      } else {
        eligibilityScore -= 0.1;
        eligibilityReason.push("Additional funds may be required");
      }

      // Normalize score
      eligibilityScore = Math.min(Math.max(eligibilityScore, 0), 1);

      // Generate recommendation
      recommendations.push({
        name: countryName,
        score: Number(eligibilityScore.toFixed(2)),
        requirements,
        processingTime: country.processingTime[profile.purpose] || "3-6 months",
        visaTypes: applicableVisas,
        fundsRequired: baseMinFunds,
        dependentFunds: {
          spouse: spouseFunds,
          perDependent: Math.floor(baseMinFunds * 0.2)
        },
        eligibilityReason: eligibilityReason.join(". "),
        isEligible: eligibilityScore >= 0.6
      });
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }
}