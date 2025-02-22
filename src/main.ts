import { FirecrawlClient } from "@mendable/firecrawl-js";
import { useEffect, useState } from "react";

const BIBLE_PLAN_URL =
  "https://www.bible.com/users/TejuoshoSusan142/reading-plans/10819-the-one-year-chronological-bible/subscription/1143073754/";

const firecrawl = new FirecrawlClient({
  apiKey: import.meta.env.VITE_FIRECRAWL_API_KEY || process.env.VITE_FIRECRAWL_API_KEY,
});

// Function to extract daily readings correctly
async function loadBiblePlan() {
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
          _root: ".day", // Adjust based on HTML structure
          date: ".day-title", // The title for each day (e.g., "Day 3")
          readings: {
            _root: ".readings", // The container that holds the readings
            passage: "li" // Each Bible passage inside the list
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
    const structuredPlan = result.days.map((day, index) => ({
      day: index + 1, // Assuming ordered structure
      date: day.date || `Day ${index + 1}`,
      readings: day.readings?.passage || [],
    }));

    return structuredPlan;
  } catch (error) {
    console.error("Error loading Bible plan:", error.message);
    return null; // Handle error case
  }
}

export default function BiblePlanComponent() {
  const [biblePlan, setBiblePlan] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBiblePlan()
      .then((data) => {
        if (data) {
          setBiblePlan(data);
        } else {
          setError("Failed to fetch Bible plan. Please try again later.");
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h2>Bible Plan (365 Days)</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {biblePlan.length > 0 ? (
        <div>
          {biblePlan.map((day) => (
            <div key={day.day} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
              <h3>{day.date}</h3>
              <ul>
                {day.readings.map((passage, idx) => (
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
}
