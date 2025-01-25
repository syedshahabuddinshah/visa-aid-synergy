import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserProfile {
  age: string;
  education: string;
  workExperience: string;
  languageScore: string;
  preferredCountries: string[];
  purpose: string;
  availableFunds: string;
  fieldOfStudy: string;
  maritalStatus: string;
  numberOfDependents: string;
  spouseIncluded: boolean;
}

function generateRecommendations(profile: UserProfile) {
  const recommendations = [];
  
  const countries = [
    {
      name: "Canada",
      visaTypes: [
        {
          name: "Express Entry",
          description: "Federal Skilled Worker Program for skilled professionals",
          baseScore: 0.85,
          minFunds: 13000,
          spouseFunds: 4000,
          dependentFunds: 3000,
          points: [
            { category: "Age", available: 12, details: "Maximum points for age 25-35" },
            { category: "Education", available: 25, details: "Degree level and field of study" },
            { category: "Work Experience", available: 15, details: "Years of skilled work" },
            { category: "Language", available: 28, details: "English/French proficiency" },
          ],
          processingTime: "6-8 months"
        },
        {
          name: "Provincial Nominee Program",
          description: "Provincial nomination for specific skills and experience",
          baseScore: 0.8,
          minFunds: 15000,
          spouseFunds: 4500,
          dependentFunds: 3500,
          points: [
            { category: "Work Experience", available: 30, details: "Relevant provincial experience" },
            { category: "Job Offer", available: 20, details: "Valid job offer from employer" },
            { category: "Education", available: 25, details: "Education level and field" },
            { category: "Language", available: 25, details: "Language proficiency" },
          ],
          processingTime: "15-19 months"
        }
      ],
      baseScore: 0.85,
    },
    {
      name: "Australia",
      visaTypes: [
        {
          name: "Skilled Independent Visa",
          description: "Points-based visa for skilled workers",
          baseScore: 0.8,
          minFunds: 20000,
          spouseFunds: 5000,
          dependentFunds: 3500,
          points: [
            { category: "Age", available: 30, details: "Maximum points for age 25-32" },
            { category: "English Level", available: 20, details: "Proficient English" },
            { category: "Education", available: 20, details: "Qualification level" },
            { category: "Experience", available: 20, details: "Years of skilled employment" },
          ],
          processingTime: "4-8 months"
        }
      ],
      baseScore: 0.8,
    }
  ];

  countries.forEach(country => {
    let eligibilityScore = country.baseScore;
    let eligibilityReason = [];
    let applicableVisas = [];
    let requirements = [
      `Valid passport`,
      `Clean criminal record`,
      `Medical examination clearance`
    ];

    // Add dependent-related requirements
    if (profile.spouseIncluded) {
      requirements.push("Spouse's passport and documentation");
    }
    if (parseInt(profile.numberOfDependents) > 0) {
      requirements.push(`Documentation for ${profile.numberOfDependents} dependent(s)`);
    }

    // Age assessment
    const age = parseInt(profile.age);
    if (age >= 25 && age <= 35) {
      eligibilityScore += 0.1;
      eligibilityReason.push("Age is within optimal range (25-35)");
    }

    // Education and Field of Study assessment
    if (profile.education.toLowerCase().includes("phd")) {
      eligibilityScore += 0.15;
      eligibilityReason.push("PhD qualification provides additional points");
    } else if (profile.education.toLowerCase().includes("masters")) {
      eligibilityScore += 0.1;
      eligibilityReason.push("Master's degree is highly valued");
    }

    // Field of Study bonus
    const inDemandFields = ["engineering", "healthcare", "information technology", "science"];
    if (inDemandFields.some(field => profile.fieldOfStudy.toLowerCase().includes(field))) {
      eligibilityScore += 0.05;
      eligibilityReason.push("In-demand field of study");
    }

    // Work experience assessment
    const workExp = parseInt(profile.workExperience);
    if (workExp >= 5) {
      eligibilityScore += 0.15;
      eligibilityReason.push("Extensive work experience (5+ years)");
    } else if (workExp >= 3) {
      eligibilityScore += 0.1;
      eligibilityReason.push("Good work experience (3+ years)");
    }

    // Language proficiency assessment
    const languageScore = profile.languageScore.toLowerCase();
    if (languageScore.includes("advanced") || languageScore.includes("proficient")) {
      eligibilityScore += 0.15;
      eligibilityReason.push("Strong language proficiency");
    }

    // Process each visa type
    country.visaTypes.forEach(visa => {
      const scoredPoints = visa.points.map(point => {
        let scored = 0;
        
        // Calculate points based on profile
        switch (point.category.toLowerCase()) {
          case "age":
            scored = age >= 25 && age <= 35 ? point.available : Math.floor(point.available / 2);
            break;
          case "education":
            scored = profile.education.includes("phd") ? point.available :
                    profile.education.includes("masters") ? Math.floor(point.available * 0.8) :
                    profile.education.includes("bachelors") ? Math.floor(point.available * 0.6) :
                    Math.floor(point.available * 0.3);
            break;
          case "work experience":
          case "experience":
            scored = workExp >= 5 ? point.available :
                    workExp >= 3 ? Math.floor(point.available * 0.7) :
                    Math.floor(point.available * 0.4);
            break;
          case "language":
          case "english level":
            scored = languageScore.includes("advanced") ? point.available :
                    languageScore.includes("intermediate") ? Math.floor(point.available * 0.7) :
                    Math.floor(point.available * 0.4);
            break;
        }
        
        return {
          ...point,
          scored
        };
      });

      applicableVisas.push({
        name: visa.name,
        description: visa.description,
        points: scoredPoints,
        requiredFunds: {
          base: visa.minFunds,
          spouse: profile.spouseIncluded ? visa.spouseFunds : 0,
          perDependent: parseInt(profile.numberOfDependents) > 0 ? visa.dependentFunds : 0
        }
      });
    });

    // Financial assessment
    const funds = parseInt(profile.availableFunds);
    const baseMinFunds = Math.min(...country.visaTypes.map(v => v.minFunds));
    const spouseFunds = profile.spouseIncluded ? Math.min(...country.visaTypes.map(v => v.spouseFunds)) : 0;
    const dependentFunds = parseInt(profile.numberOfDependents) * Math.min(...country.visaTypes.map(v => v.dependentFunds));
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

    // Normalize score to maximum of 1
    eligibilityScore = Math.min(Math.max(eligibilityScore, 0), 1);

    // Generate final recommendation
    recommendations.push({
      name: country.name,
      score: Number(eligibilityScore.toFixed(2)),
      requirements,
      processingTime: country.visaTypes[0].processingTime,
      visaTypes: applicableVisas,
      fundsRequired: baseMinFunds,
      dependentFunds: {
        spouse: spouseFunds,
        perDependent: Math.min(...country.visaTypes.map(v => v.dependentFunds))
      },
      eligibilityReason: eligibilityReason.join(". "),
      isEligible: eligibilityScore >= 0.6
    });
  });

  // Sort by score descending
  return recommendations.sort((a, b) => b.score - a.score);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile } = await req.json();
    console.log('Processing profile:', profile);

    const recommendations = generateRecommendations(profile);
    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recommendations function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});