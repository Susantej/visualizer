
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

// Disable local OpenAI API validation since we're using Supabase edge functions
app.post('/api/generate', async (req, res) => {
  return res.status(301).json({ 
    error: "This endpoint is deprecated. Please use the Supabase edge function instead.",
    message: "The application now uses Supabase edge functions for OpenAI API calls."
  });
});

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('Note: OpenAI functionality has been moved to Supabase edge functions');
});
