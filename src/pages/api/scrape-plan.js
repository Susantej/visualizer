import { scrapeReadingPlan } from '../../lib/scrapers/scraper';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const planData = await scrapeReadingPlan(10819);
      res.status(200).json(planData);
    } catch (error) {
      res.status(500).json({ error: 'Scraping failed' });
    }
  }
}
