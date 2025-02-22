
import { supabase } from '@/integrations/supabase/client';

interface RequestBody {
  prompt: string;
  type: 'text' | 'image';
}

export async function generateContent(requestBody: RequestBody) {
  const { prompt, type } = requestBody;

  try {
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: { prompt, type }
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error:', error);
    throw error;
  }
}
