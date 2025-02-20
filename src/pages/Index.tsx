
import { useState } from 'react';
import { BibleReader } from '@/components/BibleReader';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [translation, setTranslation] = useState('KJV');
  const { toast } = useToast();
  const [readingPlan, setReadingPlan] = useState<{ day: number; references: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        {!readingPlan ? (
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
