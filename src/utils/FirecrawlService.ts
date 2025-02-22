import { FirecrawlClient, CrawlStatusResponse, ErrorResponse } from "@mendable/firecrawl-js";

const BIBLE_PLAN_URL =
  "https://www.bible.com/users/TejuoshoSusan142/reading-plans/10819-the-one-year-chronological-bible/subscription/1143073754/";

const firecrawl = new FirecrawlClient({
  apiKey: import.meta.env.VITE_FIRECRAWL_API_KEY || process.env.VITE_FIRECRAWL_API_KEY|| "fc-961da62d0c67498c8149fbdfda580cf5",
});

// Function to check for API errors
function isErrorResponse(response: any): response is ErrorResponse {
  return response && "error" in response;
}

async function loadBiblePlan(): Promise<any[] | null> {
  try {
    if (!firecrawl.apiKey) {
      throw new Error("Firecrawl API key is missing. Set VITE_FIRECRAWL_API_KEY.");
    }

    console.log("Fetching Bible plan...");

    const result: CrawlStatusResponse | ErrorResponse = await firecrawl.crawl({
      url: BIBLE_PLAN_URL,
      elements: {
        dayTitle: ".day-title",
        passages: ".readings li", // Ensure this matches actual site structure
      },
      waitForSelector: ".day-title",
    });

    if (isErrorResponse(result)) {
      console.error("Firecrawl API Error:", result.error);
      throw new Error(`API Error: ${result.error}`);
    }

    console.log("Crawl result:", result);

    if (!result?.data) {
      throw new Error("No daily readings found.");
    }

    return result.data.map((day, index) => ({
      day: index + 1,
      title: day.dayTitle || `Day ${index + 1}`,
      readings: day.passages || [],
    }));
  } catch (error) {
    console.error("Error loading Bible plan:", error.message);
    return null;
  }
}

export default loadBiblePlan;
