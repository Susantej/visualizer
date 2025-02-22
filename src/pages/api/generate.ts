
import { OpenAI } from 'openai';
import type { Request, Response } from 'express';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: Request, res: Response) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { prompt, type } = req.body;

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

      res.status(200).json({ text: response.choices[0].message.content });
    } else if (type === 'image') {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a respectful, artistic visualization of this Bible passage: ${prompt}. Style: classical art, biblical, respectful, inspirational.`,
        n: 1,
        size: "1024x1024",
      });

      res.status(200).json({ imageUrl: response.data[0].url });
    } else {
      throw new Error('Invalid type specified');
    }
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
