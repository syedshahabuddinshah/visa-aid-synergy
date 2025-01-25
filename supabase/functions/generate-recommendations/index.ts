import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { QuestionnaireLogic } from "../../../src/components/questionnaire/QuestionnaireLogic.ts";

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
      console.log('OpenAI API key not configured, using fallback recommendations');
      const questionnaireLogic = new QuestionnaireLogic();
      const fallbackRecommendations = questionnaireLogic.generateFallbackRecommendations(profile);
      return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      console.error('OpenAI API error, using fallback recommendations');
      const questionnaireLogic = new QuestionnaireLogic();
      const fallbackRecommendations = questionnaireLogic.generateFallbackRecommendations(profile);
      return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ recommendations: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-recommendations function:', error);
    // Always fall back to the local recommendation system on any error
    const questionnaireLogic = new QuestionnaireLogic();
    const fallbackRecommendations = questionnaireLogic.generateFallbackRecommendations(profile);
    return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});