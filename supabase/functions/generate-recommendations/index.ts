import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile } = await req.json();
    console.log('Processing profile:', profile);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an immigration expert assistant. Based on the user's profile, analyze and recommend suitable immigration options from developed countries worldwide, not limited to any specific list. For each country, determine eligibility for various visa types (student, work, permanent residence, etc.) based on the profile data. Format your response as a valid JSON array of recommendations, where each recommendation includes:
    {
      "name": "country name",
      "score": match score between 0-1,
      "requirements": ["detailed requirement 1", "detailed requirement 2"],
      "processingTime": "estimated processing time",
      "visaTypes": ["eligible visa type 1", "eligible visa type 2"],
      "fundsRequired": minimum funds required in USD,
      "eligibilityReason": "detailed explanation of eligibility",
      "isEligible": boolean based on profile match
    }
    Focus on providing accurate, detailed recommendations for countries where the profile matches immigration criteria.`;

    const userPrompt = `Generate detailed immigration recommendations for this profile:
    Age: ${profile.age}
    Education Level: ${profile.education}
    Work Experience: ${profile.workExperience} years
    Language Proficiency: ${profile.languageScore}
    Available Funds: $${profile.availableFunds}
    Immigration Purpose: ${profile.purpose}
    
    Consider all developed nations, not just specific countries. Analyze eligibility for various visa types based on the profile's qualifications.`;

    console.log('Sending request to OpenAI');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    let recommendations;
    try {
      recommendations = JSON.parse(data.choices[0].message.content);
      if (!Array.isArray(recommendations)) {
        throw new Error('Recommendations must be an array');
      }
      console.log('Parsed recommendations:', recommendations);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw content:', data.choices[0].message.content);
      // Provide fallback recommendations
      recommendations = [{
        name: "General Recommendation",
        score: 0.5,
        requirements: ["Please try again, there was an error processing your profile"],
        processingTime: "Varies",
        visaTypes: ["Various visa types available"],
        fundsRequired: 10000,
        eligibilityReason: "Error in processing recommendations",
        isEligible: true,
      }];
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recommendations function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        recommendations: [{
          name: "Error",
          score: 0,
          requirements: ["An error occurred while generating recommendations"],
          processingTime: "N/A",
          visaTypes: [],
          fundsRequired: 0,
          eligibilityReason: "Error: " + error.message,
          isEligible: false,
        }]
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});