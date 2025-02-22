
import FirecrawlApp from "@mendable/firecrawl-js";

const BIBLE_PLAN_URL =
  "https://www.bible.com/users/TejuoshoSusan142/reading-plans/10819-the-one-year-chronological-bible/subscription/1143073754/";

const firecrawl = new FirecrawlApp({
  apiKey: import.meta.env.VITE_FIRECRAWL_API_KEY || process.env.VITE_FIRECRAWL_API_KEY,
});

interface DayPlan {
  day: number;
  date: string;
  readings: string[];
}

// Function to extract daily readings correctly
export async function loadBiblePlan(): Promise<DayPlan[] | null> {
  try {
    if (!firecrawl.apiKey) {
      throw new Error(
        "Firecrawl API key is missing. Please set VITE_FIRECRAWL_API_KEY in your environment variables."
      );
    }

    console.log("Starting to load Bible plan...");

    const result = await firecrawl.crawlUrl(BIBLE_PLAN_URL, {
      limit: 366,
      scrapeOptions: {
        formats: ['html']
      }
    });

    console.log("Crawl result:", result);

    if (!result.success) {
      throw new Error("Failed to load daily readings.");
    }

    // Process and structure data
    const structuredPlan = result.data.map((day: any, index: number) => ({
      day: index + 1,
      date: `Day ${index + 1}`,
      readings: Array.isArray(day.links) ? day.links : [],
    }));

    return structuredPlan;
  } catch (error) {
    console.error("Error loading Bible plan:", error instanceof Error ? error.message : String(error));
    return null;
  }
}
