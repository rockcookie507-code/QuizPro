import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

// Helper to get AI Client
// Note: For 'gemini-3-pro-image-preview', we must handle key selection.
// We will create a fresh client in the specific function call to ensure we capture the selected key.

export const geminiService = {
  // Generate Image using Gemini 3 Pro Image Preview
  generateImage: async (
    prompt: string,
    aspectRatio: AspectRatio,
    imageSize: ImageSize
  ): Promise<string> => {
    
    // 1. Check/Request API Key for Paid Model
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }

    // 2. Initialize Client with key from env (which is injected after selection)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      // 3. Call Model
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize
          }
        }
      });

      // 4. Extract Image
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image generated.");
    } catch (error: any) {
      // Handle race condition or expired key for paid models
      if (error.message && error.message.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
        
        // Retry with fresh client
        const retryAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await retryAi.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: {
            parts: [{ text: prompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio,
              imageSize: imageSize
            }
          }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        throw new Error("No image generated.");
      }
      throw error;
    }
  },

  // Edit Image using Gemini 2.5 Flash Image
  editImage: async (
    base64Image: string,
    prompt: string
  ): Promise<string> => {
    // Standard key usage for 2.5 models
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Strip prefix if present for API call
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for simplicity or derived from source
              data: base64Data
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
     throw new Error("No edited image returned.");
  }
};