
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = 8080;

// Configure CORS
app.use(cors());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log("Starting server...");
console.log("OpenAI API Key:", OPENAI_API_KEY ? "Loaded" : "Not Loaded");

if (!OPENAI_API_KEY) {
  console.error("❌ Missing OpenAI API key. Please set it in your .env file.");
  process.exit(1);
}

// Test route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/generate', (req, res) => {
  res.json({ message: 'POST endpoint is available' });
});

app.post('/api/generate', async (req, res) => {
  console.log('Received POST request to /api/generate');
  console.log('Request body:', req.body);
  
  try {
    const { prompt, type } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    console.log("Processing request:", { type, prompt });

    if (type === "text") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
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
    console.error("Error processing request:", error);
    return res.status(500).json({ 
      error: error.message || "Internal server error"
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Catch-all route
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url} not found`);
  res.status(404).json({ error: "Route not found" });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('  GET  / - Health check');
  console.log('  GET  /api/generate - API info');
  console.log('  POST /api/generate - Generate content');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try stopping other servers or using a different port.`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});
