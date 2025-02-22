
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
  { value: 'en-kjv', label: 'King James Version' },
  { value: 'en-niv', label: 'New International Version' },
  { value: 'en-esv', label: 'English Standard Version' },
  { value: 'en-nkjv', label: 'New King James Version' },
  { value: 'en-amp', label: 'Amplified Bible Classic' },
];

const formatReference = (reference: string): string => {
  // Handle range references like "Genesis 1:1-2:25"
  const match = reference.match(/^(\w+)\s+(\d+):(\d+)-(\d+):(\d+)$/);
  if (match) {
    const [_, book, startChapter, startVerse, endChapter, endVerse] = match;
    return `${book}/${startChapter}/${startVerse}/${endChapter}/${endVerse}`;
  }
  return reference.replace(/\s/g, '/');
};

export const BibleReader: React.FC<BibleReaderProps> = ({
  day,
  references,
  translation,
  onTranslationChange,
}) => {
  const { toast } = useToast();
  const [bibleContent, setBibleContent] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBibleContent = async () => {
      setIsLoading(true);
      try {
        const contents: { [key: string]: string } = {};
        for (const reference of references) {
          const formattedRef = formatReference(reference);
          console.log('Fetching reference:', formattedRef);
          
          const url = `https://bible-api.deno.dev/${translation}/${formattedRef}`;
          console.log('API URL:', url);
          
          const response = await axios.get(url);
          console.log('API Response:', response.data);
          
          if (typeof response.data === 'string') {
            contents[reference] = response.data;
          } else {
            console.error('Unexpected response format:', response.data);
            throw new Error('Unexpected API response format');
          }
        }
        console.log('Processed content:', contents);
        setBibleContent(contents);
      } catch (error: any) {
        console.error('Error fetching Bible content:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        toast({
          title: "Error",
          description: "Failed to load Bible content. Please try again.",
          variant: "destructive",
        });
        
        const errorContent: { [key: string]: string } = {};
        references.forEach(ref => {
          errorContent[ref] = "Unable to load Bible content. Please try again.";
        });
        setBibleContent(errorContent);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBibleContent();
  }, [references, translation, toast]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8 animate-fadeIn">
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
              <p className="font-serif text-lg leading-relaxed whitespace-pre-line">
                {isLoading ? (
                  "Loading scripture content..."
                ) : (
                  bibleContent[reference] || `Unable to load content for ${reference}`
                )}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
