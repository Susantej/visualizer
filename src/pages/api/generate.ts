
import { supabase } from '@/integrations/supabase/client';

interface RequestBody {
  prompt: string;
  type: 'text' | 'image';
}

export async function generateContent(requestBody: RequestBody) {
  const { prompt, type } = requestBody;

  try {
    console.log('Starting content generation:', { type, promptLength: prompt?.length });
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt, type }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate content');
    }

    const data = await response.json();
    return type === 'text' ? { text: data.text } : { imageUrl: data.imageUrl };
  } catch (error: any) {
    console.error('Error in generateContent:', error);
    throw error;
  }
}
