import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = 8080;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Validate API key format
function isValidOpenAIKey(key) {
  return key && key.startsWith('sk-') && key.length > 40;
}

// Test the API key on startup
async function testOpenAIKey() {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error("❌ OpenAI API Key validation failed:", error.error?.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("❌ Error validating OpenAI API Key:", error.message);
    return false;
  }
}

// Initial setup validation
async function validateSetup() {
  if (!OPENAI_API_KEY) {
    console.error("❌ Missing OpenAI API key. Please set it in your .env file.");
    return false;
  }

  if (!isValidOpenAIKey(OPENAI_API_KEY)) {
    console.error("❌ Invalid OpenAI API key format. Key should start with 'sk-' and be longer than 40 characters.");
    return false;
  }

  const isKeyValid = await testOpenAIKey();
  if (!isKeyValid) {
    console.error("❌ OpenAI API key validation failed. Please check your key.");
    return false;
  }

  console.log("✅ OpenAI API key validated successfully");
  return true;
}

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, type } = req.body;
    
    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required and cannot be empty." });
    }
    
    if (!type || !['text', 'image'].includes(type)) {
      return res.status(400).json({ error: "Valid type (text or image) is required." });
    }

    const endpoint = type === 'text' 
      ? "https://api.openai.com/v1/chat/completions"
      : "https://api.openai.com/v1/images/generations";

    const body = type === 'text' 
      ? {
          model: "gpt-4",
          messages: [
            { role: "system", content: "Provide a concise, insightful analysis of Bible passages." },
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
        };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Authentication Error:", data.error);
        return res.status(401).json({
          error: "API key authentication failed",
          message: "Please check your OpenAI API key configuration.",
          details: data.error
        });
      }
      
      return res.status(response.status).json({
        error: data.error?.message || `Failed to generate ${type}`,
        details: data.error
      });
    }

    if (type === 'text') {
      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Invalid response format from OpenAI");
      }
      return res.json({ success: true, text: data.choices[0].message.content });
    } else {
      if (!data.data?.[0]?.url) {
        throw new Error("No image URL in response");
      }
      return res.json({ success: true, imageUrl: data.data[0].url });
    }
    
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start server only if setup is valid
validateSetup().then(isValid => {
  if (!isValid) {
    console.error("❌ Server startup aborted due to configuration issues.");
    process.exit(1);
  }

  app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('  POST /api/generate - Generate content');
  });
});
