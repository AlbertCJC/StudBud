
// Use Google GenAI SDK as per the world-class engineer guidelines
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationMode, StudyMaterialResponse } from "../types";

/**
 * Generates study materials using the Gemini API.
 * This service leverages Gemini 3 models for high-quality educational content generation.
 */
export async function generateStudyMaterial(
  content: string,
  mode: GenerationMode,
  count: number = 10,
  useSearch: boolean = false
): Promise<StudyMaterialResponse> {
  
  const isFlashcards = mode === GenerationMode.FLASHCARDS;
  
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API key is missing. Please check your environment configuration.");
  }

  // Create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date key.
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an expert educational content generator. 
Generate exactly ${count} high-quality ${isFlashcards ? 'flashcards' : 'quiz questions'} based on the provided content.

${isFlashcards 
  ? `For each flashcard, provide a 'question' and an 'answer'.` 
  : `For each quiz question, provide a 'question', exactly 4 'options', and the 'correctAnswer' (which must be one of the options).`
}

Output MUST be a single JSON object.`;

  // Define the response schema based on the generation mode to ensure deterministic JSON output.
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: isFlashcards ? {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
          } : {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.STRING },
          },
          propertyOrdering: isFlashcards ? ["question", "answer"] : ["question", "options", "correctAnswer"],
        },
      },
    },
    propertyOrdering: ["items"],
  };

  try {
    // Generate content using Gemini 3 Pro for complex reasoning tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Context content: "${content.slice(0, 30000)}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.7,
        // Only include googleSearch tool if explicitly requested for topic research.
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gemini returned an empty response.");
    }

    const data = JSON.parse(resultText);
    const items = (data.items || []).map((item: any, index: number) => ({
      ...item,
      id: `gemini-${Date.now()}-${index}`,
    })).slice(0, count);

    // Extract website URLs from grounding chunks if googleSearch was utilized.
    const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || 'Source',
        uri: chunk.web.uri,
      })) || [];

    return {
      items,
      groundingUrls
    };

  } catch (error: any) {
    console.error("Generation Error:", error);
    
    // Implement robust error handling as per guidelines.
    if (error.status === 401) {
      throw new Error("Authentication Failed. Please verify your API key.");
    }
    
    throw new Error(error.message || "An unexpected error occurred during study material generation.");
  }
}
