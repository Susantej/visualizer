
import { Request, Response } from 'express';

export interface GenerateRequest extends Request {
  body: {
    prompt: string;
    type: 'text' | 'image';
  };
}

export interface GenerateResponse extends Response {
  json: (body: { 
    text?: string;
    imageUrl?: string;
    error?: string;
  }) => void;
}
