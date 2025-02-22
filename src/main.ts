import { FirecrawlClient } from '@mendable/firecrawl-js';
// At the top of your component
console.log('Checking API key:', {
  keyExists: !!import.meta.env.VITE_FIRECRAWL_API_KEY,
  keyValue: import.meta.env.VITE_FIRECRAWL_API_KEY?.substring(0, 5) + '...'
});

// Initialize Firecrawl client
const firecrawl = new FirecrawlClient({
  apiKey: "fc-961da62d0c67498c8149fbdfda580cf5" 
});

// Function to load the reading plan
async function loadReadingPlan() {
  try {
    const result = await firecrawl.crawl({
      url: 'https://www.bible.com/reading-plans/10819-the-one-year-chronological-bible',
      // Add any specific Firecrawl options you need
    });
    console.log('Plan loaded:', result);
    return result;
  } catch (error) {
    console.error('Error loading plan:', error);
    throw error;
  }
}

// For OpenAI, you need to set the authorization header properly
async function fetchOpenAIData() {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Your OpenAI request parameters
      })
    });
    const data = await response.json();
    console.log('OpenAI data:', data);
    return data;
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}
