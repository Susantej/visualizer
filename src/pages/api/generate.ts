
import OpenAI from 'openai';
import { supabase } from '@/integrations/supabase/client';

interface RequestBody {
  prompt: string;
  type: 'text' | 'image';
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export async function generateContent(requestBody: RequestBody) {
  const { prompt, type } = requestBody;

  try {
    console.log('Starting content generation:', { type, promptLength: prompt?.length });
    
    if (type === 'text') {
      const completion = await openai.chat.completions.create({
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

      return { text: completion.choices[0].message.content };
    } else if (type === 'image') {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a respectful, artistic visualization of this Bible passage: ${prompt}. Style: classical art, biblical, respectful, inspirational.`,
        n: 1,
        size: "1024x1024",
      });

      return { imageUrl: response.data[0].url };
    } else {
      throw new Error(`Invalid type specified: ${type}`);
    }
  } catch (error: any) {
    console.error('Error in generateContent:', error);
    throw error;
  }
}
