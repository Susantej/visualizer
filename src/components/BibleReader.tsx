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
  // Handle range references like "Genesis 1:1-2:25"
  const rangeMatch = reference.match(/^(\w+)\s+(\d+):(\d+)-(\d+):(\d+)$/);
  if (rangeMatch) {
    const [_, book, startChapter, startVerse, endChapter, endVerse] = rangeMatch;
    return `${book}/${startChapter}/${startVerse}/${endChapter}/${endVerse}`;
  }
  
  // Handle single chapter:verse references
  const singleMatch = reference.match(/^(\w+)\s+(\d+):(\d+)$/);
  if (singleMatch) {
    const [_, book, chapter, verse] = singleMatch;
    return `${book}/${chapter}/${verse}`;
  }
  
  // Handle whole chapter references
  const chapterMatch = reference.match(/^(\w+)\s+(\d+)$/);
  if (chapterMatch) {
    const [_, book, chapter] = chapterMatch;
    return `${book}/${chapter}`;
  }
  
  return reference.replace(/\s+/g, '/');
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
            const url = `https://bible-api.deno.dev/${translation}/${formattedRef}`;
            
            console.log('Fetching:', url);
            
            const response = await fetch(url, {
              headers: {
                'Accept': 'application/json, text/plain',
                'Cache-Control': 'no-cache'
              }
            });

            if (response.status === 0) {
              throw new Error('CORS error - API not accessible. Please check server configuration.');
            }

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            console.log('Response:', text);
            
            let data;
            try {
              data = JSON.parse(text);
            } catch {
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
            contents[reference] = `Error: ${error.message}`;
          }
        }
        
        setBibleContent(contents);
        setRetryCount(0);
        
      } catch (error: any) {
        console.error('Error in fetchBibleContent:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBibleContent();
  }, [references, translation, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
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
          <AlertDescription>
            {error}
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
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
                    {bibleContent[reference]?.startsWith('Error') ? (
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
