
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log('Processing request:', { type, promptLength: prompt?.length });

    if (type === 'text') {
      const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4', // Fixed model name
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that provides insightful summaries of Bible passages. Provide a concise, thoughtful analysis focusing on the main themes and lessons.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const responseText = await apiResponse.text();
      console.log('Raw OpenAI response:', responseText);

      if (!apiResponse.ok) {
        console.error('OpenAI API error:', responseText);
        throw new Error('Failed to generate text summary');
      }

      const data = JSON.parse(responseText);
      console.log('Parsed OpenAI response:', data);

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
      }

      return new Response(
        JSON.stringify({ text: data.choices[0].message.content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (type === 'image') {
      const apiResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `Create a respectful, artistic visualization of this Bible passage: ${prompt}. Style: classical art, biblical, respectful, inspirational.`,
          n: 1,
          size: '1024x1024'
        }),
      });

      const responseText = await apiResponse.text();
      console.log('Raw OpenAI image response:', responseText);

      if (!apiResponse.ok) {
        console.error('OpenAI API error:', responseText);
        throw new Error('Failed to generate image');
      }

      const data = JSON.parse(responseText);
      console.log('Parsed OpenAI image response:', data);

      if (!data.data?.[0]?.url) {
        throw new Error('Invalid image response format from OpenAI');
      }

      return new Response(
        JSON.stringify({ imageUrl: data.data[0].url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Invalid type specified: ${type}`);
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
