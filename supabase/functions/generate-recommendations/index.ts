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
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an immigration expert assistant. Analyze the provided profile and generate detailed visa recommendations.
            Format your response as a JSON array of recommendations, where each recommendation includes:
            - name: country name
            - score: match score between 0-1
            - requirements: array of key requirements
            - processingTime: estimated processing time
            - visaTypes: array of available visa types
            - fundsRequired: minimum funds required in USD
            - eligibilityReason: brief explanation of eligibility
            - isEligible: boolean indicating if basic requirements are met`
          },
          {
            role: 'user',
            content: `Generate visa recommendations for this profile: ${JSON.stringify(profile)}`
          }
        ],
      }),
    });

    const data = await response.json();
    const recommendations = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});