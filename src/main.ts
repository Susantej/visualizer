
import { FirecrawlClient } from "@mendable/firecrawl-js";

const BIBLE_PLAN_URL =
  "https://www.bible.com/users/TejuoshoSusan142/reading-plans/10819-the-one-year-chronological-bible/subscription/1143073754/";

const firecrawl = new FirecrawlClient({
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

    const result = await firecrawl.crawl({
      url: BIBLE_PLAN_URL,
      elements: {
        days: {
          _root: ".day",
          date: ".day-title",
          readings: {
            _root: ".readings",
            passage: "li"
          },
        },
      },
      waitForSelector: ".day",
    });

    console.log("Crawl result:", result);

    if (!result || !result.days) {
      throw new Error("Failed to load daily readings.");
    }

    // Process and structure data
    const structuredPlan = result.days.map((day: any, index: number) => ({
      day: index + 1,
      date: day.date || `Day ${index + 1}`,
      readings: day.readings?.passage || [],
    }));

    return structuredPlan;
  } catch (error) {
    console.error("Error loading Bible plan:", error instanceof Error ? error.message : String(error));
    return null;
  }
}
