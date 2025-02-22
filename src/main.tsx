
import React, { useEffect, useState } from "react";
import FirecrawlApp from "@mendable/firecrawl-js";

const BIBLE_PLAN_URL =
  "https://www.bible.com/users/TejuoshoSusan142/reading-plans/10819-the-one-year-chronological-bible/subscription/1143073754/";

const firecrawl = new FirecrawlApp({
  apiKey: import.meta.env.VITE_FIRECRAWL_API_KEY || process.env.VITE_FIRECRAWL_API_KEY,
});

interface DayPlan {
  day: number;
  text: string;
  content: string[];
}

async function loadBiblePlan(): Promise<DayPlan[] | null> {
  try {
    if (!firecrawl.apiKey) {
      console.error("API Key missing or undefined:", firecrawl.apiKey);
      throw new Error(
        "Firecrawl API key is missing. Please set VITE_FIRECRAWL_API_KEY in your environment variables."
      );
    }

    console.log("Starting to load Bible plan...");
    console.log("Using API Key:", firecrawl.apiKey);
    console.log("URL to crawl:", BIBLE_PLAN_URL);

    const result = await firecrawl.crawlUrl(BIBLE_PLAN_URL, {
      limit: 10 // Limiting initial results for testing
    });

    // Log the raw response first
    console.log("Raw Firecrawl Response:", result);

    if (!result.success) {
      console.error("Crawl failed with result:", result);
      throw new Error(`Failed to fetch Bible plan: ${JSON.stringify(result)}`);
    }

    if (!Array.isArray(result.data)) {
      console.error("Expected array data but got:", typeof result.data);
      throw new Error("Invalid response format from Firecrawl");
    }

    // Log each document's raw data
    result.data.forEach((doc: any, index: number) => {
      console.log(`Raw document ${index + 1}:`, doc);
      try {
        const extracted = doc.extract();
        console.log(`Extracted data from document ${index + 1}:`, extracted);
      } catch (extractError) {
        console.error(`Failed to extract data from document ${index + 1}:`, extractError);
      }
    });

    // Process and structure data with extensive logging
    const plan = result.data.map((item: any, index) => {
      console.log(`Processing item ${index + 1}:`, item);
      let extracted;
      try {
        extracted = item.extract();
        console.log(`Successfully extracted data for day ${index + 1}:`, extracted);
      } catch (err) {
        console.warn(`Could not extract data for day ${index + 1}:`, err);
        extracted = {};
      }

      const dayPlan = {
        day: index + 1,
        text: item.url || `Day ${index + 1}`,
        content: Array.isArray(item.links) ? item.links : []
      };
      console.log(`Created day plan for day ${index + 1}:`, dayPlan);
      return dayPlan;
    });

    console.log("Final processed plan:", plan);
    return plan;
  } catch (error) {
    console.error("Error in loadBiblePlan:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    return null;
  }
}

const BiblePlanComponent: React.FC = () => {
  const [biblePlan, setBiblePlan] = useState<DayPlan[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("BiblePlanComponent mounted");
    setLoading(true);
    loadBiblePlan()
      .then((data) => {
        console.log("loadBiblePlan returned:", data);
        if (data) {
          setBiblePlan(data);
        } else {
          setError("Failed to fetch Bible plan. Please try again later.");
        }
      })
      .catch((err) => {
        console.error("Error in BiblePlanComponent:", err);
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Bible Plan (365 Days)</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p>Loading Bible plan...</p>
      ) : biblePlan.length > 0 ? (
        <div className="space-y-4">
          {biblePlan.map((day) => (
            <div
              key={day.day}
              className="p-4 border-b border-gray-200"
            >
              <h3 className="text-xl font-semibold mb-2">Day {day.day}: {day.text}</h3>
              <ul className="list-disc pl-5">
                {day.content.map((passage, idx) => (
                  <li key={idx} className="text-gray-700">{passage}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>No bible plan data available.</p>
      )}
    </div>
  );
};

export default BiblePlanComponent;
