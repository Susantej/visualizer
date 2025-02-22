
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

interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

const translations = [
  { value: 'kjv', label: 'King James Version' },
  { value: 'web', label: 'World English Bible' },
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

  useEffect(() => {
    const fetchBibleContent = async () => {
      setIsLoading(true);
      try {
        const contents: { [key: string]: string } = {};
        for (const reference of references) {
          // Using the bible_api.git API
          const response = await axios.get(`https://bible-api.com/${reference}?translation=${translation.toLowerCase()}`);
          
          // The API returns the text directly
          contents[reference] = response.data.text;
        }
        setBibleContent(contents);
      } catch (error) {
        console.error('Error fetching Bible content:', error);
        toast({
          title: "Error",
          description: "Failed to load Bible content. Please try again.",
          variant: "destructive",
        });
        // Show error state in content
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

  const handleGenerateInsights = () => {
    toast({
      title: "Generating Insights",
      description: "AI is analyzing the passage...",
    });
    // TODO: Implement AI insights generation
  };

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
