
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationMode } from "../types";

/**
 * Generates study material (flashcards or quiz questions) using Gemini 3 Flash.
 * Supports text, images, and PDFs.
 */
export async function generateStudyMaterial(
  content: string | { mimeType: string, data: string },
  mode: GenerationMode,
  count: number = 10
): Promise<any[]> {
  // Initialize the Gemini API client. 
  // API key is obtained from the environment variable as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let parts: any[] = [];
  if (typeof content === 'string') {
    parts.push({ text: content });
  } else {
    // Gemini supports multimodal inputs like images and PDFs.
    parts.push({
      inlineData: {
        mimeType: content.mimeType,
        data: content.data,
      }
    });
  }

  // Define system instruction based on the requested mode
  const systemInstruction = mode === GenerationMode.FLASHCARDS 
    ? `You are an expert educational assistant. Your task is to generate exactly ${count} high-quality flashcards from the provided content. 
       Format your response as a JSON array of objects. 
       Each object must have "question" and "answer" properties. 
       Ensure questions are clear and answers are concise and accurate.`
    : `You are an expert educational assistant. Your task is to generate exactly ${count} multiple-choice questions from the provided content. 
       Format your response as a JSON array of objects. 
       Each object must have "question", "options" (array of 4 distinct strings), and "correctAnswer" (string, must exactly match one of the options).`;

  // Define response schema for structured output using Type from @google/genai
  const responseSchema = mode === GenerationMode.FLASHCARDS
    ? {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
          },
          required: ["question", "answer"],
        },
      }
    : {
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
      };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [...parts, { text: `Generate ${count} ${mode.toLowerCase()} based on the provided content.` }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini API returned an empty response.");
    }

    // Parse the structured JSON response
    const items = JSON.parse(text);

    return items.map((item: any, index: number) => ({
      ...item,
      id: `${Date.now()}-${index}`,
    })).slice(0, count);

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
