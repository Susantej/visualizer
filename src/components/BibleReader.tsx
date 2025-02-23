import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loader2, ImageIcon, FileTextIcon } from 'lucide-react';
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from 'axios';
import { supabase } from './supabase';

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
    console.log("Sending request to OpenAI proxy:", { prompt, type });
    
    const { data, error } = await supabase.functions.invoke("openai-proxy", {
      body: { prompt, type }
    });

    if (error) {
      console.error("OpenAI proxy error:", error);
      throw new Error(error.message || 'Failed to generate content');
    }

    console.log("OpenAI proxy response:", data);
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
  const [textPrompt, setTextPrompt] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");

  const handleGenerateContent = async (type: 'text' | 'image') => {
    if (!textPrompt && type === 'text') {
      toast({
        title: "Error",
        description: "Please enter a prompt for the text generation",
        variant: "destructive",
      });
      return;
    }

    if (!imagePrompt && type === 'image') {
      toast({
        title: "Error",
        description: "Please enter a prompt for the image generation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = type === 'text' ? textPrompt : imagePrompt;
      const result = await generateContent(prompt, type);
      
      if (type === 'text') {
        setAiContent(result);
      } else {
        setAiImage(result);
      }

      toast({
        title: "Success",
        description: `Generated ${type} successfully`,
      });
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast({
        title: "Error",
        description: `Failed to generate ${type}. Please try again.`,
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
          const url = `https://bible-api.com/${encodeURIComponent(reference)}`;
          const response = await axios.get(url);
          
          if (response.data && response.data.text) {
            contents[reference] = response.data.text;
          } else {
            throw new Error('Unexpected API response format');
          }
        }
        
        setBibleContent(contents);
      } catch (error: any) {
        console.error('Error fetching Bible content:', error);
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="textPrompt">Enter your prompt for text generation</Label>
                      <Input
                        id="textPrompt"
                        placeholder="Ask a question about the passage..."
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => handleGenerateContent('text')}
                      disabled={isGenerating || !textPrompt}
                      className="w-full"
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
                    {aiContent && (
                      <div className="mt-4 p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {aiContent}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="image" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="imagePrompt">Enter your prompt for image generation</Label>
                      <Input
                        id="imagePrompt"
                        placeholder="Describe the image you want to generate..."
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => handleGenerateContent('image')}
                      disabled={isGenerating || !imagePrompt}
                      className="w-full"
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
                    {aiImage && (
                      <div className="mt-4">
                        <img src={aiImage} alt="AI-generated visualization" className="w-full rounded-lg" />
                      </div>
                    )}
                  </div>
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
