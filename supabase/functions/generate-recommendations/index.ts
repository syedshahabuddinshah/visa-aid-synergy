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
}

function generateRecommendations(profile: UserProfile) {
  const recommendations = [];
  
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
    if (profile.education.toLowerCase().includes("phd")) {
      eligibilityScore += 0.15;
      eligibilityReason.push("PhD qualification provides additional points");
      applicableVisas.push(...country.visaTypes.filter(v => v.includes("Skilled")));
    } else if (profile.education.toLowerCase().includes("masters")) {
      eligibilityScore += 0.1;
      eligibilityReason.push("Master's degree is highly valued");
      applicableVisas.push(...country.visaTypes.filter(v => v.includes("Skilled")));
    } else if (profile.education.toLowerCase().includes("bachelors")) {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile } = await req.json();
    console.log('Processing profile:', profile);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // If no API key is configured, use local recommendations
    if (!openAIApiKey) {
      console.log('OpenAI API key not configured, using local recommendations');
      const recommendations = generateRecommendations(profile);
      return new Response(JSON.stringify({ recommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an immigration expert assistant. Generate detailed recommendations for immigration options.'
            },
            {
              role: 'user',
              content: `Analyze this profile for immigration recommendations:
                Age: ${profile.age}
                Education: ${profile.education}
                Work Experience: ${profile.workExperience} years
                Language Score: ${profile.languageScore}
                Available Funds: $${profile.availableFunds}
                Purpose: ${profile.purpose}`
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API error, using local recommendations');
        const recommendations = generateRecommendations(profile);
        return new Response(JSON.stringify({ recommendations }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      return new Response(JSON.stringify({ recommendations: data.choices[0].message.content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      const recommendations = generateRecommendations(profile);
      return new Response(JSON.stringify({ recommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-recommendations function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});