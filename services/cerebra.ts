
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationMode, StudyMaterialResponse } from "../types";

/**
 * Generates study materials using the Google Gemini API.
 * This service leverages the Gemini 3 Flash model for high-quality, efficient generation
 * with support for structured JSON output and optional Google Search grounding.
 */
export async function generateStudyMaterial(
  content: string,
  mode: GenerationMode,
  count: number = 10,
  useSearch: boolean = false
): Promise<StudyMaterialResponse> {
  
  // Initialize the Gemini API client. 
  // We create a new instance right before the call to ensure the latest environment config is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isFlashcards = mode === GenerationMode.FLASHCARDS;
  
  // Define the JSON response schema for structured output to ensure consistency in generated data.
  const schema = isFlashcards ? {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
          },
          required: ["question", "answer"],
        },
      },
    },
    required: ["items"],
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
              items: { type: Type.STRING },
            },
            correctAnswer: { type: Type.STRING },
          },
          required: ["question", "options", "correctAnswer"],
        },
      },
    },
    required: ["items"],
  };

  const systemInstruction = `You are an expert educational content generator. 
Generate exactly ${count} high-quality ${isFlashcards ? 'flashcards' : 'quiz questions'} based on the provided content.
${!isFlashcards ? 'For each quiz question, provide exactly 4 options and the correctAnswer must be one of them.' : ''}
Return the items in the requested JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context content for generation: "${content.slice(0, 30000)}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        // Integrate Google Search grounding if research mode is enabled.
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

    // Extract grounding URLs from metadata if Google Search was utilized during generation.
    const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter((chunk: any) => chunk.web)
      ?.map((chunk: any) => ({
        title: chunk.web.title || "Source",
        uri: chunk.web.uri,
      })) || [];

    return {
      items,
      groundingUrls,
    };

  } catch (error: any) {
    console.error("Gemini Inference Error:", error);
    
    if (error.status === 401) {
      throw new Error("Invalid API Key. Authentication failed (401).");
    }
    
    throw new Error(error.message || "An unexpected error occurred during Gemini generation.");
  }
}
