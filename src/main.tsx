
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
      throw new Error(
        "Firecrawl API key is missing. Please set VITE_FIRECRAWL_API_KEY in your environment variables."
      );
    }

    console.log("Starting to load Bible plan...");

    const result = await firecrawl.crawlUrl(BIBLE_PLAN_URL);

    console.log("Full Crawl Response:", JSON.stringify(result, null, 2));
    
    if (!result.success) {
      throw new Error("Failed to fetch Bible plan");
    }

    // Log extracted data from each document
    result.data.forEach((doc: any, index: number) => {
      console.log(`Document ${index + 1} extracted data:`, doc.extract());
    });

    // Process and structure data
    const data = result.data;
    const plan = data.map((item: any, index) => {
      const extracted = item.extract();
      console.log(`Extracted data for day ${index + 1}:`, extracted);
      
      return {
        day: index + 1,
        text: item.url || `Day ${index + 1}`,
        content: Array.isArray(item.links) ? item.links : []
      };
    });

    return plan;
  } catch (error) {
    console.error("Error loading Bible plan:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

const BiblePlanComponent: React.FC = () => {
  const [biblePlan, setBiblePlan] = useState<DayPlan[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadBiblePlan()
      .then((data) => {
        if (data) {
          setBiblePlan(data);
        } else {
          setError("Failed to fetch Bible plan. Please try again later.");
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  return (
    <div>
      <h2>Bible Plan (365 Days)</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {biblePlan.length > 0 ? (
        <div>
          {biblePlan.map((day) => (
            <div
              key={day.day}
              style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}
            >
              <h3>Day {day.day}: {day.text}</h3>
              <ul>
                {day.content.map((passage, idx) => (
                  <li key={idx}>{passage}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default BiblePlanComponent;
