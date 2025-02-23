
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

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
  
  // Add detailed logging for API key validation
  console.log("Checking OpenAI API key...")
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key is not set in environment variables")
    return new Response(
      JSON.stringify({ error: 'OpenAI API key is not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  if (!OPENAI_API_KEY.startsWith('sk-') || OPENAI_API_KEY.length <= 40) {
    console.error("Invalid OpenAI API key format")
    return new Response(
      JSON.stringify({ error: 'Invalid OpenAI API key format' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  try {
    const { prompt, type } = await req.json()

    if (!prompt) {
      throw new Error('Prompt is required')
    }

    if (!type || !['text', 'image'].includes(type)) {
      throw new Error('Valid type (text or image) is required')
    }

    console.log(`Processing ${type} generation request...`)

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
      throw new Error(error.error?.message || `Failed to generate ${type}`)
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
