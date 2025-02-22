import { FirecrawlDocument } from "@mendable/firecrawl-js";

const BIBLE_PLAN_URL =
  "https://www.bible.com/users/TejuoshoSusan142/reading-plans/10819-the-one-year-chronological-bible/subscription/1143073754/";

async function loadBiblePlan(): Promise<any[] | null> {
  try {
    console.log("Fetching Bible plan...");

    const document = new FirecrawlDocument({
      url: BIBLE_PLAN_URL,
      waitForSelector: ".day-title",
    });

    const result = await document.extract({
      dayTitle: { selector: ".day-title", type: "text" },
      passages: { selector: ".readings li", type: "text[]", attribute: "textContent" },
    });

    if (!result) {
      throw new Error("Failed to fetch Bible plan.");
    }

    console.log("Crawl result:", result);

    return result.dayTitle.map((title: string, index: number) => ({
      day: index + 1,
      title,
      readings: result.passages[index] || [],
    }));
  } catch (error) {
    console.error("Error loading Bible plan:", error.message);
    return null;
  }
}

export default loadBiblePlan;
