import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI(process.env.OPENAI_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  const { chapter } = req.query; // e.g. "genesis-1"

  // Check cache first
  const { data: cached } = await supabase
    .from('chapter_images')
    .select('url')
    .eq('chapter', chapter);

  if (cached?.length > 0) return res.json({ url: cached[0].url });

  // Generate new image
  const prompt = `Historical biblical scene of ${chapter}, realistic style`;
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1024x1024"
  });

  // Store in Supabase
  await supabase
    .from('chapter_images')
    .insert([{ chapter, url: response.data[0].url }]);

  res.json({ url: response.data[0].url });
}
