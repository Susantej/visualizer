import { FirecrawlService } from '../../src/utils/FirecrawlService';

export async function scrapeReadingPlan(planId: number) {
  return await FirecrawlService.crawlBiblePlan();
}
