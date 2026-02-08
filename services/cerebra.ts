
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationMode, StudyMaterialResponse } from "../types";

/**
 * Initialize the Google GenAI client.
 * The API key must be obtained exclusively from the environment variable process.env.API_KEY.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates study materials using the Gemini API.
 * This service leverages Gemini 3 Flash for high-speed, high-fidelity educational content generation.
 */
export async function generateStudyMaterial(
  content: string,
  mode: GenerationMode,
  count: number = 10,
  useSearch: boolean = false
): Promise<StudyMaterialResponse> {
  
  const isFlashcards = mode === GenerationMode.FLASHCARDS;
  
  // Validation for API key presence
  if (!process.env.API_KEY) {
    throw new Error("Gemini API key is missing. Please check your configuration.");
  }

  // Define structured schemas for reliable response parsing using GenAI Type enum
  const schema = isFlashcards ? {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
          },
          required: ["question", "answer"]
        }
      }
    },
    required: ["items"]
  } : {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer"]
        }
      }
    },
    required: ["items"]
  };

  const systemInstruction = `You are an expert educational content generator. 
Your goal is to create exactly ${count} high-quality ${isFlashcards ? 'flashcards' : 'quiz questions'} based on the provided content.

${isFlashcards 
  ? `For each flashcard, provide a 'question' and an 'answer'.` 
  : `For each quiz question, provide a 'question', exactly 4 'options', and the 'correctAnswer' (which must be one of the options).`
}

Ensure the output strictly follows the JSON schema provided.`;

  try {
    // Use gemini-3-flash-preview for high-speed generation as requested by the app's performance-focused UI.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context content for generation: "${content.slice(0, 40000)}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema as any,
        // Using Google Search grounding when research is required.
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
      }
    });

    const resultText = response.text;
    
    if (!resultText) {
      throw new Error("The model returned an empty response.");
    }

    const data = JSON.parse(resultText);
    const items = (data.items || []).map((item: any, index: number) => ({
      ...item,
      id: `gemini-${Date.now()}-${index}`,
    })).slice(0, count);

    // Extract grounding URLs from groundingMetadata as required by Gemini guidelines
    const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
      if (chunk.web) {
        return {
          title: chunk.web.title || 'Source',
          uri: chunk.web.uri || ''
        };
      }
      return null;
    }).filter((link: any) => link && link.uri) || [];

    return {
      items,
      groundingUrls
    };

  } catch (error: any) {
    console.error("Gemini API Failure:", error);
    throw new Error(error.message || "An unexpected error occurred during content generation.");
  }
}
