
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts";

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type } = await req.json();

    if (type === 'text') {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides insightful summaries of Bible passages. Provide a concise, thoughtful analysis focusing on the main themes and lessons."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return new Response(
        JSON.stringify({ text: response.choices[0].message.content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (type === 'image') {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a respectful, artistic visualization of this Bible passage: ${prompt}. Style: classical art, biblical, respectful, inspirational.`,
        n: 1,
        size: "1024x1024",
      });

      return new Response(
        JSON.stringify({ imageUrl: response.data[0].url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid type specified');
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
