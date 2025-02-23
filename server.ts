import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ Missing OpenAI API key. Please set it in your .env file.");
  process.exit(1);
}

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, type } = req.body;
    if (!prompt || !type) {
      return res.status(400).json({ error: "Missing prompt or type." });
    }

    console.log(`Processing request: ${type} | Prompt length: ${prompt.length}`);

    if (type === "text") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "Provide a concise, insightful analysis of Bible passages." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to generate text summary");
      }

      return res.json({ text: data.choices[0]?.message?.content });
    } else if (type === "image") {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `Create a respectful, artistic visualization of this Bible passage: ${prompt}. Style: classical art, biblical, inspirational.`,
          n: 1,
          size: "1024x1024",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to generate image");
      }

      return res.json({ imageUrl: data.data[0]?.url });
    }

    return res.status(400).json({ error: "Invalid type specified." });
  } catch (error: any) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message || "Unexpected error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
