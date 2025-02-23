
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables')
    }

    const { prompt, type } = await req.json()

    if (!prompt) {
      throw new Error('Prompt is required')
    }

    if (!type || !['text', 'image'].includes(type)) {
      throw new Error('Valid type (text or image) is required')
    }

    const endpoint = type === 'text' 
      ? "https://api.openai.com/v1/chat/completions"
      : "https://api.openai.com/v1/images/generations"

    const body = type === 'text' 
      ? {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant that provides insightful analysis of Bible passages." },
            { role: "user", content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }
      : {
          model: "dall-e-3",
          prompt: `Create a respectful, artistic visualization of this Bible passage: ${prompt}. Style: classical art, biblical, inspirational.`,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url"
        }

    console.log(`Making request to OpenAI ${type} endpoint...`)
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error(`OpenAI API error:`, error)
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log('Successfully received OpenAI response')

    return new Response(
      JSON.stringify(type === 'text' 
        ? { text: data.choices[0].message.content }
        : { imageUrl: data.data[0].url }
      ),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in openai-proxy function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
