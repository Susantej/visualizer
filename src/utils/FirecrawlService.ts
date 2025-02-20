
import FirecrawlApp from '@mendable/firecrawl-js';

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async crawlBiblePlan(): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const crawlResponse = await this.firecrawlApp.crawlUrl(
        'https://www.bible.com/reading-plans/10819-the-one-year-chronological-bible',
        {
          limit: 100,
          scrapeOptions: {
            formats: ['markdown', 'html'],
          }
        }
      ) as CrawlResponse;

      if (!crawlResponse.success) {
        console.error('Crawl failed:', (crawlResponse as ErrorResponse).error);
        return {
          success: false,
          error: (crawlResponse as ErrorResponse).error || 'Failed to crawl Bible plan'
        };
      }

      console.log('Crawl successful:', crawlResponse);
      return {
        success: true,
        data: crawlResponse
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
