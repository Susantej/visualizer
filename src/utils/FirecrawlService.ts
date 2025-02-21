
import FirecrawlApp from '@mendable/firecrawl-js';

interface ErrorResponse {
  success: false;
  error: string;
}

interface ReadingPlanDay {
  day: number;
  references: string[];
  title?: string;
  description?: string;
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
  private static API_KEY_STORAGE_KEY = 'fc-961da62d0c67498c8149fbdfda580cf5';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async crawlBiblePlan(): Promise<{ success: boolean; error?: string; data?: ReadingPlanDay[] }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      console.log('Starting Bible.com reading plan crawl');
      const crawlResponse = await this.firecrawlApp.crawlUrl(
        'https://www.bible.com/reading-plans/10819-the-one-year-chronological-bible',
        {
          limit: 366, // Account for potential extra day
          scrapeOptions: {
            formats: ['html']
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

      // Process the raw HTML to extract reading plan data
      const data = crawlResponse.data;
      const readingPlan = data.map((item: any, index: number) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(item.html || '', 'text/html');
        
        const dayElement = doc.querySelector('.reading-plan-day');
        return {
          day: index + 1,
          title: dayElement?.querySelector('.day-title')?.textContent?.trim() || '',
          description: dayElement?.querySelector('.day-description')?.textContent?.trim() || '',
          references: Array.from(dayElement?.querySelectorAll('.reference') || [])
            .map(ref => ref.textContent?.trim() || '')
        };
      });

      console.log('Crawl successful, processed reading plan:', readingPlan);
      return {
        success: true,
        data: readingPlan
      };
    } catch (error) {
      console.error('Error during crawl:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API'
      };
    }
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key with Firecrawl API');
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      const testResponse = await this.firecrawlApp.crawlUrl('https://example.com', {
        limit: 1
      });
      return testResponse.success;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }
}
