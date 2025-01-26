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
    
    // Use only the countries selected by the user
    const selectedCountries = profile.preferredCountries;

    // Enhanced destination options with detailed criteria per visa type
    const countryData = {
      "Australia": {
        visaTypes: {
          study: {
            name: "Student Visa (Subclass 500)",
            description: "For international students to study in Australia",
            baseScore: 0.85,
            minFunds: 21000,
            points: [
              { category: "Language", available: 20, details: "English proficiency" },
              { category: "Education", available: 15, details: "Previous education level" },
              { category: "Financial", available: 15, details: "Proof of funds" }
            ]
          },
          work: {
            name: "Temporary Skill Shortage Visa",
            description: "For skilled workers with sponsoring employers",
            baseScore: 0.8,
            minFunds: 25000,
            points: [
              { category: "Work Experience", available: 25, details: "Years of experience" },
              { category: "Language", available: 20, details: "English proficiency" },
              { category: "Skills Assessment", available: 15, details: "Skills assessment" }
            ]
          },
          permanent: {
            name: "Skilled Independent Visa",
            description: "Permanent residence for skilled workers",
            baseScore: 0.75,
            minFunds: 30000,
            points: [
              { category: "Age", available: 30, details: "Age factor" },
              { category: "Education", available: 20, details: "Qualification level" },
              { category: "Experience", available: 20, details: "Work experience" },
              { category: "Language", available: 20, details: "English proficiency" }
            ]
          }
        },
        processingTime: {
          study: "2-4 months",
          work: "3-6 months",
          permanent: "12-16 months"
        }
      },
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
      "United Kingdom": {
        visaTypes: {
          study: {
            name: "Student Visa",
            description: "UK study visa for international students",
            baseScore: 0.85,
            minFunds: 22000,
            points: [
              { category: "Language", available: 20, details: "English proficiency" },
              { category: "Education", available: 15, details: "Previous education" },
              { category: "Financial", available: 15, details: "Maintenance funds" }
            ]
          },
          work: {
            name: "Skilled Worker Visa",
            description: "For skilled workers with job offers",
            baseScore: 0.8,
            minFunds: 18000,
            points: [
              { category: "Job Offer", available: 20, details: "Valid job offer" },
              { category: "Language", available: 20, details: "English proficiency" },
              { category: "Experience", available: 20, details: "Work experience" }
            ]
          },
          permanent: {
            name: "Indefinite Leave to Remain",
            description: "Permanent residence in the UK",
            baseScore: 0.75,
            minFunds: 28000,
            points: [
              { category: "Residency", available: 25, details: "Time in UK" },
              { category: "Language", available: 20, details: "English proficiency" },
              { category: "Life in UK", available: 15, details: "Life in UK test" }
            ]
          }
        },
        processingTime: {
          study: "3-4 weeks",
          work: "3-8 weeks",
          permanent: "6 months"
        }
      }
    };

    selectedCountries.forEach(countryName => {
      const country = countryData[countryName];
      if (!country) return; // Skip if country data not available

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