
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 3001;

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, type } = req.body;

    if (type === 'text') {
      const completion = await openai.chat.completions.create({
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

      res.json({ text: completion.choices[0].message.content });
    } else if (type === 'image') {
      const imageResponse = await openai.images.generate({
        prompt: `Create a respectful, artistic visualization of this Bible passage: ${prompt}. Style: classical art, biblical, respectful, inspirational.`,
        n: 1,
        size: "1024x1024",
      });

      res.json({ imageUrl: imageResponse.data[0].url });
    } else {
      res.status(400).json({ error: `Invalid type specified: ${type}` });
    }
  } catch (error: any) {
    console.error('Error generating content:', error);
    res.status(500).json({
      error: error.message || 'An unexpected error occurred',
      details: error.stack
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
