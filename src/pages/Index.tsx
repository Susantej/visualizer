
import { useState } from 'react';
import { BibleReader } from '@/components/BibleReader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { readingPlanData } from '@/data/readingPlan';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Index = () => {
  const [translation, setTranslation] = useState('en-kjv');
  const [currentDay, setCurrentDay] = useState(1);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const currentReading = readingPlanData.find(day => day.day === currentDay);

  const handlePreviousDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDay < readingPlanData.length) {
      setCurrentDay(currentDay + 1);
    }
  };

  if (!currentReading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-scripture-light to-white dark:from-scripture-dark dark:to-gray-900 flex items-center justify-center">
        <Card className="p-6">
          <h2 className="text-xl font-serif mb-4">Reading Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested reading day was not found.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-scripture-light to-white dark:from-scripture-dark dark:to-gray-900">
      <header className="py-8 text-center">
        <h1 className="text-4xl font-serif mb-4">Bible Visualizer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore scripture with AI-powered insights
        </p>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="flex justify-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={handlePreviousDay}
            disabled={currentDay === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Day
          </Button>
          <Button 
            variant="outline" 
            onClick={handleNextDay}
            disabled={currentDay === readingPlanData.length}
          >
            Next Day
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif mb-2">{currentReading.title}</h2>
          {currentReading.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {currentReading.description}
            </p>
          )}
        </div>

        <BibleReader
          day={currentReading.day}
          references={currentReading.references}
          translation={translation}
          onTranslationChange={setTranslation}
        />
      </main>
    </div>
  );
};

export default Index;
