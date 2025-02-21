import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
# In your Next.js project root:
mkdir -p lib/scrapers
cp ../bible-scraper/src/scraper.js lib/scrapers/
