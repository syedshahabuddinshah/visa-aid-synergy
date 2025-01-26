import { CountryDataMap } from "../types/RecommendationTypes";

export const countryData: CountryDataMap = {
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