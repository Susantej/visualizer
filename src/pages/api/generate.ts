
import { supabase } from '@/integrations/supabase/client';

interface RequestBody {
  prompt: string;
  type: 'text' | 'image';
}

export async function generateContent(requestBody: RequestBody) {
  const { prompt, type } = requestBody;

  try {
    console.log('Calling generate-content function with:', { type, promptLength: prompt?.length });
    
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: { prompt, type }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data received from the function');
    }

    console.log('Generation successful:', data);
    return data;
  } catch (error: any) {
    console.error('Error in generateContent:', error);
    throw error;
  }
}
