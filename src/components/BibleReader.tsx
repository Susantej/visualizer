import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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

const formatBibleReference = (reference: string): string => {
  // Split reference into book and verses
  const parts = reference.split(' ');
  const book = parts[0];
  const versePart = parts.slice(1).join('');
  
  // Handle chapter:verse format
  return `${book}/${versePart}`
    .replace(/\s+/g, '') // Remove spaces
    .replace(/:/g, '/') // Replace colons with forward slashes
    .replace(/-/g, '/') // Replace hyphens with forward slashes
    .replace(/[^\w\d/]/g, ''); // Remove any other special characters
};

export const BibleReader: React.FC<BibleReaderProps> = ({
  day,
  references,
  translation,
  onTranslationChange,
}) => {
  const [bibleContent, setBibleContent] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBibleContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const contents: { [key: string]: string } = {};
        for (const reference of references) {
          try {
            const formattedRef = formatBibleReference(reference);
            const url = `https://bible-api.deno.dev/api/${translation}/${formattedRef}`;
            
            console.log('Fetching:', url); // Debug log
            
            const response = await fetch(url, {
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });

            if (!response.ok) {
              console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                url: url
              });
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text(); // Get raw response text first
            console.log('Raw response:', text); // Debug log
            
            let data;
            try {
              data = JSON.parse(text);
            } catch (e) {
              // If it's not JSON, use the text directly
              data = text;
            }

            if (typeof data === 'string') {
              contents[reference] = data;
            } else if (data && data.text) {
              contents[reference] = data.text;
            } else if (Array.isArray(data)) {
              contents[reference] = data.map((verse: any) => verse.text).join(' ');
            } else {
              throw new Error('Invalid response format');
            }
          } catch (error: any) {
            console.error(`Error fetching ${reference}:`, error);
            contents[reference] = `Error loading ${reference}. ${error.message}`;
          }
        }
        
        setBibleContent(contents);
        setIsLoading(false);
        setRetryCount(0);
        
      } catch (error: any) {
        console.error('Error in fetchBibleContent:', error);
        
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000 * (retryCount + 1));
        } else {
          setError(`Failed to load Bible content: ${error.message}`);
          setIsLoading(false);
        }
      }
    };

    fetchBibleContent();
  }, [references, translation, retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    setIsLoading(true);
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6 space-y-6">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default BibleReader;
