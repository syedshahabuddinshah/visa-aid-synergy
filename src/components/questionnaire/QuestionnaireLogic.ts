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
    
    // Enhanced destination options with detailed criteria
    const countries = [
      {
        name: "Canada",
        visaTypes: ["Express Entry", "Study Permit", "Work Permit", "Provincial Nominee Program"],
        baseScore: 0.85,
        minFunds: 13000,
        languageRequirement: "IELTS 6.0 or equivalent",
        processingTime: "6-8 months"
      },
      {
        name: "Australia",
        visaTypes: ["Skilled Migration", "Student Visa", "Temporary Skill Shortage Visa", "Graduate Visa"],
        baseScore: 0.8,
        minFunds: 20000,
        languageRequirement: "IELTS 6.0 or equivalent",
        processingTime: "4-8 months"
      },
      {
        name: "United Kingdom",
        visaTypes: ["Skilled Worker Visa", "Student Visa", "Graduate Route", "High Potential Individual Visa"],
        baseScore: 0.75,
        minFunds: 16000,
        languageRequirement: "IELTS 6.5 or equivalent",
        processingTime: "3-6 months"
      },
      {
        name: "New Zealand",
        visaTypes: ["Skilled Migrant", "Student Visa", "Work Visa", "Accredited Employer Work Visa"],
        baseScore: 0.7,
        minFunds: 15000,
        languageRequirement: "IELTS 6.5 or equivalent",
        processingTime: "3-5 months"
      }
    ];

    countries.forEach(country => {
      let eligibilityScore = country.baseScore;
      let eligibilityReason = [];
      let applicableVisas = [];
      let requirements = [
        `Valid passport`,
        `Minimum funds: $${country.minFunds}`,
        country.languageRequirement,
        "Clean criminal record",
        "Medical examination clearance"
      ];

      // Age assessment
      const age = parseInt(profile.age);
      if (age >= 25 && age <= 35) {
        eligibilityScore += 0.1;
        eligibilityReason.push("Age is within optimal range (25-35)");
      } else if (age < 25) {
        eligibilityReason.push("Younger candidates may have more study visa options");
        applicableVisas.push(...country.visaTypes.filter(v => v.includes("Student")));
      }

      // Education assessment
      if (profile.education.includes("phd")) {
        eligibilityScore += 0.15;
        eligibilityReason.push("PhD qualification provides additional points");
        applicableVisas.push(...country.visaTypes.filter(v => v.includes("Skilled")));
      } else if (profile.education.includes("masters")) {
        eligibilityScore += 0.1;
        eligibilityReason.push("Master's degree is highly valued");
        applicableVisas.push(...country.visaTypes.filter(v => v.includes("Skilled")));
      } else if (profile.education.includes("bachelors")) {
        eligibilityScore += 0.05;
        eligibilityReason.push("Bachelor's degree meets minimum requirements");
      }

      // Work experience assessment
      const workExp = parseInt(profile.workExperience);
      if (workExp >= 5) {
        eligibilityScore += 0.15;
        eligibilityReason.push("Extensive work experience (5+ years)");
        applicableVisas.push(...country.visaTypes.filter(v => v.includes("Work") || v.includes("Skilled")));
      } else if (workExp >= 3) {
        eligibilityScore += 0.1;
        eligibilityReason.push("Good work experience (3+ years)");
        applicableVisas.push(...country.visaTypes.filter(v => v.includes("Work")));
      }

      // Language proficiency assessment
      const languageScore = profile.languageScore.toLowerCase();
      if (languageScore.includes("advanced") || languageScore.includes("proficient")) {
        eligibilityScore += 0.15;
        eligibilityReason.push("Strong language proficiency");
      } else if (languageScore.includes("intermediate")) {
        eligibilityScore += 0.05;
        eligibilityReason.push("Adequate language skills, may need improvement");
      }

      // Financial assessment
      const funds = parseInt(profile.availableFunds);
      if (funds >= country.minFunds * 1.5) {
        eligibilityScore += 0.15;
        eligibilityReason.push("Strong financial position");
      } else if (funds >= country.minFunds) {
        eligibilityScore += 0.05;
        eligibilityReason.push("Meets minimum financial requirements");
      } else {
        eligibilityScore -= 0.1;
        eligibilityReason.push("Additional funds may be required");
      }

      // Purpose-specific adjustments
      if (profile.purpose === "study" && funds >= country.minFunds) {
        applicableVisas.push(...country.visaTypes.filter(v => v.includes("Student")));
        eligibilityReason.push("Eligible for student visa pathways");
      }

      // Normalize score to maximum of 1
      eligibilityScore = Math.min(Math.max(eligibilityScore, 0), 1);

      // Generate final recommendation
      recommendations.push({
        name: country.name,
        score: Number(eligibilityScore.toFixed(2)),
        requirements,
        processingTime: country.processingTime,
        visaTypes: [...new Set(applicableVisas)],
        fundsRequired: country.minFunds,
        eligibilityReason: eligibilityReason.join(". "),
        isEligible: eligibilityScore >= 0.6
      });
    });

    // Sort by score descending
    return recommendations.sort((a, b) => b.score - a.score);
  }
}