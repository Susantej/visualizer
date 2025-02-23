
interface GenerateContentRequest {
  prompt: string;
  type: 'text' | 'image';
}

interface GenerateContentResponse {
  text?: string;
  imageUrl?: string;
  error?: string;
}

export async function generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
  try {
    const response = await fetch('http://localhost:3001/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate content');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error in generateContent:', error);
    throw error;
  }
}
