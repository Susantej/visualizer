
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log("OpenAI API Key:", OPENAI_API_KEY ? "Loaded" : "Not Loaded");

if (!OPENAI_API_KEY) {
  console.error("❌ Missing OpenAI API key. Please set it in your .env file.");
  process.exit(1);
}

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, type } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    console.log("Generating:", { type, prompt });

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
            { role: "user", content: prompt }
          ],
        }),
      });

      const data = await response.json();
      console.log("OpenAI Response:", data);

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
      console.log("OpenAI Image Response:", data);

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to generate image");
      }

      return res.json({ imageUrl: data.data[0]?.url });
    }

    return res.status(400).json({ error: "Invalid type specified." });
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    
    return res.status(500).json({ 
      error: error.response?.data || error.message || "Unexpected error",
      details: error.stack
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
