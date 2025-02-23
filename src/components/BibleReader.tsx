
import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loader2, ImageIcon, FileTextIcon } from 'lucide-react';
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

const generateContent = async (prompt: string, type: "text" | "image") => {
  try {
    console.log("Sending request to server:", { prompt, type });
    
    const response = await fetch("http://localhost:8080/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, type }),
    });

    console.log("Server response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server error:", errorData);
      throw new Error(errorData.error || 'Failed to generate content');
    }

    const data = await response.json();
    console.log("Server response data:", data);
    
    return type === "text" ? data.text : data.imageUrl;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
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
  const [aiContent, setAiContent] = useState<string>("");
  const [aiImage, setAiImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateContent = async (type: 'text' | 'image') => {
    setIsGenerating(true);
    try {
      const prompt = `Bible passage: ${references.map(ref => `${ref}: ${bibleContent[ref]}`).join('\n')}`;
      
      const result = await generateContent(prompt, type);
      
      if (type === 'text') {
        setAiContent(result);
      } else {
        setAiImage(result);
      }

      toast({
        title: "Success",
        description: `Generated ${type} summary successfully`,
      });
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast({
        title: "Error",
        description: `Failed to generate ${type} summary. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const fetchBibleContent = async () => {
      setIsLoading(true);
      try {
        const contents: { [key: string]: string } = {};
        for (const reference of references) {
          console.log('Fetching reference:', reference);
          
          const url = `https://bible-api.com/${encodeURIComponent(reference)}`;
          console.log('API URL:', url);
          
          const response = await axios.get(url);
          console.log('API Response:', response.data);
          
          if (response.data && response.data.text) {
            contents[reference] = response.data.text;
          } else {
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
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileTextIcon className="w-4 h-4" />
                Ask AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>AI-Generated Insights</DialogTitle>
                <DialogDescription>
                  Generate AI-powered summaries and visualizations for this passage
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text Summary</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="space-y-4">
                  {aiContent ? (
                    <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {aiContent}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Button
                        onClick={() => handleGenerateContent('text')}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Text Summary'
                        )}
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="image" className="space-y-4">
                  {aiImage ? (
                    <img src={aiImage} alt="AI-generated visualization" className="w-full rounded-lg" />
                  ) : (
                    <div className="text-center py-4">
                      <Button
                        onClick={() => handleGenerateContent('image')}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Image'
                        )}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
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
