import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    console.log('Received profile:', profile);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

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
            content: `You are an immigration expert assistant. Generate visa recommendations based on the following profile. 
            Format your response as a valid JSON array of recommendations, where each recommendation includes:
            {
              "name": "country name",
              "score": number between 0-1,
              "requirements": ["requirement1", "requirement2"],
              "processingTime": "estimated time",
              "visaTypes": ["visa type 1", "visa type 2"],
              "fundsRequired": number in USD,
              "eligibilityReason": "brief explanation",
              "isEligible": boolean
            }`
          },
          {
            role: 'user',
            content: `Generate detailed visa recommendations for this profile:
            Age: ${profile.age}
            Education: ${profile.education}
            Work Experience: ${profile.workExperience} years
            Language Score: ${profile.languageScore}
            Available Funds: $${profile.availableFunds}
            Purpose: ${profile.purpose}
            Preferred Countries: ${profile.preferredCountries.join(', ')}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response format:', data);
      throw new Error('Invalid response format from OpenAI');
    }

    let recommendations;
    try {
      recommendations = JSON.parse(data.choices[0].message.content);
      if (!Array.isArray(recommendations)) {
        throw new Error('Recommendations must be an array');
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw content:', data.choices[0].message.content);
      // Fallback to basic recommendations
      recommendations = profile.preferredCountries.map(country => ({
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

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recommendations function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        recommendations: [] // Return empty array instead of throwing
      }),
      {
        status: 200, // Return 200 even for errors to handle them gracefully
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});