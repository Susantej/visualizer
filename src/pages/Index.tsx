
import { useState } from 'react';
import { BibleReader } from '@/components/BibleReader';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [translation, setTranslation] = useState('KJV');
  const { toast } = useToast();
  const [readingPlan, setReadingPlan] = useState<{ day: number; references: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!FirecrawlService.getApiKey());

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    const isValid = await FirecrawlService.testApiKey(apiKey);
    if (isValid) {
      FirecrawlService.saveApiKey(apiKey);
      setShowApiKeyInput(false);
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid API key",
        variant: "destructive",
      });
    }
  };

  const fetchReadingPlan = async () => {
    setIsLoading(true);
    const result = await FirecrawlService.crawlBiblePlan();
    setIsLoading(false);
    
    if (result.success && result.data && result.data.length > 0) {
      // Get the first day's reading
      const firstDay = result.data[0];
      setReadingPlan({
        day: firstDay.day,
        references: firstDay.references
      });
      
      toast({
        title: "Success",
        description: "Reading plan loaded successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to load reading plan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-scripture-light to-white dark:from-scripture-dark dark:to-gray-900">
      <header className="py-8 text-center">
        <h1 className="text-4xl font-serif mb-4">Bible Visualizer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore scripture with AI-powered insights
        </p>
      </header>

      <main className="container mx-auto px-4">
        {showApiKeyInput ? (
          <Card className="p-6 text-center max-w-md mx-auto">
            <h2 className="text-xl font-serif mb-4">Enter Firecrawl API Key</h2>
            <form onSubmit={handleApiKeySubmit} className="space-y-4">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Firecrawl API key"
                className="w-full"
              />
              <Button
                type="submit"
                className="w-full bg-scripture-light dark:bg-scripture-dark text-gray-800 dark:text-gray-200"
              >
                Save API Key
              </Button>
            </form>
          </Card>
        ) : !readingPlan ? (
          <Card className="p-6 text-center max-w-md mx-auto">
            <h2 className="text-xl font-serif mb-4">One Year Chronological Bible</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start your journey through the Bible in chronological order
            </p>
            <Button
              onClick={fetchReadingPlan}
              className="bg-scripture-light dark:bg-scripture-dark text-gray-800 dark:text-gray-200"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load Reading Plan"}
            </Button>
          </Card>
        ) : (
          <BibleReader
            day={readingPlan.day}
            references={readingPlan.references}
            translation={translation}
            onTranslationChange={setTranslation}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
