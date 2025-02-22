import { useEffect, useState } from "react";
import loadBiblePlan from "./utils/FirecrawlService";

export default function BiblePlanComponent() {
  const [biblePlan, setBiblePlan] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Loading Bible plan...");

    loadBiblePlan()
      .then((data) => {
        if (data.length > 0) {
          setBiblePlan(data);
        } else {
          setError("Failed to fetch Bible plan.");
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h2>Bible Plan (365 Days)</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {biblePlan.length > 0 ? (
        biblePlan.map((day) => (
          <div key={day.day}>
            <h3>Day {day.day}: {day.title}</h3>
            <ul>
              {day.readings.map((passage: string, idx: number) => (
                <li key={idx}>{passage}</li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

