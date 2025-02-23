
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Debug: Print if API key is loaded
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Loaded" : "Not Loaded");

async function test() {
  try {
    console.log("Starting OpenAI test...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Summarize Genesis 1: 23" }],
    });
    console.log("OpenAI Response:");
    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI Error:", error);
    // Print full error details
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
  }
}

test();
