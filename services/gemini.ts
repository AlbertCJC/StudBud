
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationMode, StudyMaterialResponse } from "../types";

/**
 * Generates study materials using Google Gemini API.
 * Uses gemini-3-flash-preview for fast and high-quality educational content generation.
 */
export async function generateStudyMaterial(
  content: string,
  mode: GenerationMode,
  count: number = 10,
  useSearch: boolean = false
): Promise<StudyMaterialResponse> {
  // Always create a new instance to ensure the most up-to-date API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Define structured schemas for different study material types
  const flashcardSchema = {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "The study question or term." },
            answer: { type: Type.STRING, description: "The answer or definition." },
          },
          required: ["question", "answer"],
        },
      },
    },
    required: ["items"],
  };

  const quizSchema = {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "The quiz question." },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Exactly four multiple choice options."
            },
            correctAnswer: { type: Type.STRING, description: "The correct option from the options array." },
          },
          required: ["question", "options", "correctAnswer"],
        },
      },
    },
    required: ["items"],
  };

  const systemInstruction = `You are a world-class educational assistant. 
  Your goal is to generate exactly ${count} high-quality ${mode.toLowerCase()} based on the provided content.
  Focus on key concepts, definitions, and critical reasoning.`;

  const userPrompt = `Content to analyze: "${content.slice(0, 30000)}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: mode === GenerationMode.FLASHCARDS ? flashcardSchema : quizSchema,
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
      },
    });

    // Access text property directly as per guidelines (not a method call)
    const text = response.text;
    if (!text) {
      throw new Error("No response generated from the model.");
    }

    const data = JSON.parse(text);
    
    const items = (data.items || []).map((item: any, index: number) => ({
      ...item,
      id: `${Date.now()}-${index}`,
    })).slice(0, count);

    // Extract grounding URLs for source citations, as required by Gemini Search Grounding rules
    const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter((chunk: any) => chunk.web)
      ?.map((chunk: any) => ({
        title: chunk.web.title || "Reference Source",
        uri: chunk.web.uri
      })) || [];

    return { items, groundingUrls };

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate study materials using Gemini API.");
  }
}
