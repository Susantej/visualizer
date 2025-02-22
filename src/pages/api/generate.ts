
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

interface RequestBody {
  prompt: string;
  type: 'text' | 'image';
}

export async function generateContent(requestBody: RequestBody) {
  const { prompt, type } = requestBody;

  try {
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

      return { text: response.choices[0].message.content };
    } else if (type === 'image') {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a respectful, artistic visualization of this Bible passage: ${prompt}. Style: classical art, biblical, respectful, inspirational.`,
        n: 1,
        size: "1024x1024",
      });

      return { imageUrl: response.data[0].url };
    } else {
      throw new Error('Invalid type specified');
    }
  } catch (error: any) {
    console.error('Error:', error);
    throw error;
  }
}
