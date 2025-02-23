
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type } = await req.json();
    console.log('Received request:', { type, promptLength: prompt?.length });

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    if (type === 'text') {
      console.log('Generating text with OpenAI...');
      const completion = await openai.createChatCompletion({
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
        ],
      });

      console.log('Text generation successful');
      return new Response(JSON.stringify({ text: completion.data.choices[0].message?.content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (type === 'image') {
      console.log('Generating image with OpenAI...');
      const response = await openai.createImage({
        prompt: `Create a respectful, artistic visualization of this Bible passage: ${prompt}. Style: classical art, biblical, respectful, inspirational.`,
        n: 1,
        size: "1024x1024",
      });

      console.log('Image generation successful');
      return new Response(JSON.stringify({ imageUrl: response.data.data[0].url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error(`Invalid type specified: ${type}`);
    }
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.response?.data || error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
