
import { useState } from 'react';
import { BibleReader } from '@/components/BibleReader';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [translation, setTranslation] = useState('KJV');
  const { toast } = useToast();
  const [readingPlan, setReadingPlan] = useState<{ day: number; references: string[] } | null>(null);

  const fetchReadingPlan = async () => {
    const result = await FirecrawlService.crawlBiblePlan();
    
    if (result.success && result.data) {
      // Process the crawled data to extract reading plan
      // This is a placeholder - you'll need to process the actual crawled data
      setReadingPlan({
        day: 1,
        references: ["Genesis 1:1-2:25"]
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
          <div className="text-center py-12">
            <Button
              onClick={fetchReadingPlan}
              className="bg-scripture-light dark:bg-scripture-dark text-gray-800 dark:text-gray-200"
            >
              Load Reading Plan
            </Button>
          </div>
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
