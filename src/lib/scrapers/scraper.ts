
import { FirecrawlService } from '@/utils/FirecrawlService';

export async function scrapeReadingPlan(planId: number) {
  return await FirecrawlService.crawlBiblePlan();
}
