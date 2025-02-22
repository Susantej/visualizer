import { FirecrawlDocument } from "@mendable/firecrawl-js";

const BIBLE_PLAN_URL =
  "https://www.bible.com/users/TejuoshoSusan142/reading-plans/10819-the-one-year-chronological-bible/subscription/1143073754/";

async function loadBiblePlan(): Promise<any[]> {
  try {
    console.log("Fetching Bible plan...");

    const document = new FirecrawlDocument({
      url: BIBLE_PLAN_URL,
      waitForSelector: ".day-title",
    });

    const result = await document.extract({
      dayTitle: { selector: ".day-title", type: "text" },
      readings: { selector: ".readings li", type: "text[]" },
    });

    if (!result) {
      throw new Error("Failed to fetch Bible plan.");
    }

    console.log("Crawl result:", result);

    // Properly map the extracted data
    return result.dayTitle.map((title: string, index: number) => ({
      day: index + 1,
      title,
      readings: result.readings ? result.readings[index] : [],
    }));
  } catch (error) {
    console.error("Error loading Bible plan:", error.message);
    return [];
  }
}

export default loadBiblePlan;

