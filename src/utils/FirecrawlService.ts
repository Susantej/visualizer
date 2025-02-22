
import FirecrawlApp from '@mendable/firecrawl-js';

interface CrawlResult {
  data: {
    days: Array<{
      date?: string;
      readings?: {
        passage?: string[];
      };
    }>;
  };
}

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static async crawlBiblePlan(): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = import.meta.env.VITE_FIRECRAWL_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const response = await this.firecrawlApp.crawlUrl(
        'https://www.bible.com/reading-plans/10819-the-one-year-chronological-bible',
        {
          extractors: {
            days: {
              selector: ".day",
              extract: {
                date: ".day-title",
                readings: {
                  selector: ".readings",
                  extract: {
                    passage: "li"
                  }
                }
              }
            }
          },
          waitForSelector: ".day"
        }
      ) as CrawlResult;

      return { 
        success: true,
        data: response 
      };
    } catch (error) {
      console.error('Error during crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}
