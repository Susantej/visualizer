import { scrapeReadingPlan } from '../../lib/scrapers/scraper';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  // Trigger manually via Postman first
  const planData = await scrapeReadingPlan(10819);
  
  const { error } = await supabase
    .from('reading_plans')
    .upsert([{
      id: 1,
      days: planData,
      last_updated: new Date().toISOString()
    }]);

  error ? res.status(500).json({ error }) : res.json({ success: true });
}
