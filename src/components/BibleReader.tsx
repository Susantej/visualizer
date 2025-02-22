
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

  useEffect(() => {
    const fetchBibleContent = async () => {
      setIsLoading(true);
      try {
        const contents: { [key: string]: string } = {};
        for (const reference of references) {
          // Using the API.Bible API (example URL - you'll need to replace with actual endpoint)
          const response = await axios.get(`https://api.scripture.api.bible/v1/bibles/${translation}/passages/${reference}`, {
            headers: {
              'api-key': 'YOUR_API_KEY' // You'll need to get an API key from API.Bible
            }
          });
          contents[reference] = response.data.data.content;
        }
        setBibleContent(contents);
      } catch (error) {
        console.error('Error fetching Bible content:', error);
        // For now, let's add some sample content so we can see something
        const sampleContent: { [key: string]: string } = {};
        references.forEach(ref => {
          sampleContent[ref] = `Sample content for ${ref}. In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.`;
        });
        setBibleContent(sampleContent);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBibleContent();
  }, [references, translation]);

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
              <p className="font-serif text-lg leading-relaxed">
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
