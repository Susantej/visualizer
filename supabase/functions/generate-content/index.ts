
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

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
    console.log('Starting request processing:', { type, promptLength: prompt?.length });

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    if (type === 'text') {
      console.log('Generating text summary...');
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
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
        temperature: 0.7,
        max_tokens: 500,
      });

      console.log('Text generation successful');
      return new Response(
        JSON.stringify({ text: completion.data.choices[0].message.content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (type === 'image') {
      console.log('Generating image...');
      const imageResponse = await openai.createImage({
        prompt: `Create a respectful, artistic visualization of this Bible passage: ${prompt}. Style: classical art, biblical, respectful, inspirational.`,
        n: 1,
        size: "1024x1024",
      });

      console.log('Image generation successful');
      return new Response(
        JSON.stringify({ imageUrl: imageResponse.data.data[0].url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Invalid type specified: ${type}`);

  } catch (error) {
    console.error('Error in generate-content function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'No stack trace available'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
