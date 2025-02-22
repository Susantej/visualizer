
import React, { useEffect, useState } from "react";
import FirecrawlApp from "@mendable/firecrawl-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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

    const result = await firecrawl.crawlUrl(BIBLE_PLAN_URL, {
      limit: 10
    });

    if (!result.success) {
      throw new Error(`Failed to fetch Bible plan: ${JSON.stringify(result)}`);
    }

    if (!Array.isArray(result.data)) {
      throw new Error("Invalid response format from Firecrawl");
    }

    const plan = result.data.map((item: any, index) => ({
      day: index + 1,
      text: item.url || `Day ${index + 1}`,
      content: Array.isArray(item.links) ? item.links : []
    }));

    return plan;
  } catch (error) {
    console.error("Error in loadBiblePlan:", error);
    throw error;
  }
}

const BiblePlanComponent: React.FC = () => {
  const { toast } = useToast();
  const [biblePlan, setBiblePlan] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLoadPlan = async () => {
    setLoading(true);
    try {
      const data = await loadBiblePlan();
      if (data) {
        setBiblePlan(data);
        toast({
          title: "Success",
          description: "Bible plan loaded successfully",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load Bible plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button 
          onClick={handleLoadPlan} 
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? "Loading..." : "Load Reading Plan"}
        </Button>
      </div>

      {biblePlan.length > 0 && (
        <div className="space-y-4">
          {biblePlan.map((day) => (
            <div
              key={day.day}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              <h3 className="text-xl font-semibold mb-2">Day {day.day}</h3>
              <ul className="list-disc pl-5 space-y-1">
                {day.content.map((passage, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">{passage}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BiblePlanComponent;
