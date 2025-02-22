import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import axios from 'axios';

interface BibleReaderProps {
  day: number;
  references: string[];
  translation: string;
  onTranslationChange: (translation: string) => void;
}

const translations = [
  { value: 'KJV', label: 'King James Version' },
  { value: 'NIV', label: 'New International Version' },
  { value: 'ESV', label: 'English Standard Version' },
  { value: 'NKJV', label: 'New King James Version' },
  { value: 'AMPC', label: 'Amplified Bible Classic' },
];

export const BibleReader: React.FC<BibleReaderProps> = ({
  day,
  references,
  translation,
  onTranslationChange,
}) => {
  const { toast } = useToast();
  const [bibleContent, setBibleContent] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchBibleContent = async () => {
      setIsLoading(true);
      try {
        const contents: { [key: string]: string } = {};
        for (const reference of references) {
          try {
            // Format the reference to match the API requirements
            const formattedRef = reference
              .replace(/\s+/g, '+')  // Replace spaces with plus
              .replace(/:/g, '.')    // Replace colons with dots
              .replace(/[^\w\d+.-]/g, ''); // Remove any other special characters
            
            const url = `https://bible-api.deno.dev/api/${translation}/${formattedRef}`;
            
            const response = await axios.get(url, {
              timeout: 10000, // 10 second timeout
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });

            if (response.data && typeof response.data === 'string') {
              contents[reference] = response.data;
            } else if (response.data && response.data.text) {
              contents[reference] = response.data.text;
            } else if (response.data && Array.isArray(response.data)) {
              contents[reference] = response.data.map((verse: any) => verse.text).join(' ');
            } else {
              throw new Error('Invalid response format');
            }
          } catch (error: any) {
            console.error(`Error fetching ${reference}:`, error);
            contents[reference] = `Error loading ${reference}. Please try again.`;
          }
        }
        
        setBibleContent(contents);
        setIsLoading(false);
        
        // Reset retry count on successful fetch
        setRetryCount(0);
        
      } catch (error: any) {
        console.error('Error in fetchBibleContent:', error);
        
        // Implement retry logic
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000 * (retryCount + 1)); // Exponential backoff
        } else {
          toast({
            title: "Error",
            description: "Failed to load Bible content after multiple attempts. Please check your connection.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }
    };

    fetchBibleContent();
  }, [references, translation, toast, retryCount]);

  const handleRetry = () => {
    setRetryCount(0); // Reset retry count
    setIsLoading(true); // Show loading state
  };

  const handleGenerateInsights = () => {
    toast({
      title: "Generating Insights",
      description: "AI is analyzing the passage...",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif">Day {day}</h2>
        <Select value={translation} onValueChange={onTranslationChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select translation" />
          </SelectTrigger>
          <SelectContent>
            {translations.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="backdrop-blur-sm bg-white/30 dark:bg-black/30 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
        <div className="space-y-6">
          {references.map((reference, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-xl font-serif">{reference}</h3>
              <div className="font-serif text-lg leading-relaxed">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                    <span>Loading scripture...</span>
                  </div>
                ) : (
                  <div>
                    {bibleContent[reference]?.includes('Error') ? (
                      <div className="text-red-500 flex items-center space-x-2">
                        <span>{bibleContent[reference]}</span>
                        <Button
                          onClick={handleRetry}
                          variant="outline"
                          size="sm"
                          className="ml-2"
                        >
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line">{bibleContent[reference]}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button
          onClick={handleGenerateInsights}
          className="bg-scripture-light dark:bg-scripture-dark text-gray-800 dark:text-gray-200"
        >
          Generate AI Insights
        </Button>
      </div>
    </div>
  );
};

export default BibleReader;
