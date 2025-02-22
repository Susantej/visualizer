
import FirecrawlApp from '@mendable/firecrawl-js';

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

      const result = await this.firecrawlApp.crawlUrl(
        'https://www.bible.com/reading-plans/10819-the-one-year-chronological-bible',
        {
          scrapeOptions: {
            title: { selector: ".day-title", type: "text" },
            readings: { selector: ".readings li", type: "text[]" }
          }
        }
      );

      if (!result.success) {
        return { 
          success: false, 
          error: "Failed to extract data" 
        };
      }

      return { 
        success: true,
        data: result.data 
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
