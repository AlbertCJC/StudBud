
import { GoogleGenAI, Type } from "@google/genai";
import { FlashcardData, QuizData, GenerationMode } from "../types";

export async function generateStudyMaterial(
  content: string | { mimeType: string, data: string },
  mode: GenerationMode,
  count: number = 10
): Promise<any[]> {
  // Use process.env.API_KEY directly as per @google/genai guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const flashcardSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: 'The study question or concept name' },
        answer: { type: Type.STRING, description: 'The explanation or answer' },
      },
      required: ['question', 'answer'],
    },
  };

  const quizSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: 'The multiple choice question' },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: 'Four distinct possible answers'
        },
        correctAnswer: { type: Type.STRING, description: 'The exact string matching the correct option' },
      },
      required: ['question', 'options', 'correctAnswer'],
    },
  };

  const systemInstruction = mode === GenerationMode.FLASHCARDS 
    ? `You are an expert educator. Extract important concepts into exactly ${count} high-quality flashcards with clear questions and concise answers. Do not provide more or fewer than requested.`
    : `You are an expert educator. Create exactly ${count} challenging multiple-choice questions from the content. Provide 4 options per question and clearly identify the correct answer. Do not provide more or fewer than requested.`;

  try {
    let parts: any[] = [];
    if (typeof content === 'string') {
      parts.push({ text: `Create ${count} ${mode === GenerationMode.FLASHCARDS ? 'flashcards' : 'quiz questions'} from this text:\n\n${content}` });
    } else {
      parts.push({ 
        inlineData: {
          mimeType: content.mimeType,
          data: content.data
        } 
      });
      parts.push({ text: `Create ${count} ${mode === GenerationMode.FLASHCARDS ? 'flashcards' : 'quiz questions'} from this document.` });
    }

    // Switched to 'gemini-3-flash-preview' for better free-tier availability and faster response times.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: mode === GenerationMode.FLASHCARDS ? flashcardSchema : quizSchema,
      },
    });

    // Access the .text property directly.
    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text received from AI");
    }

    const data = JSON.parse(responseText);
    return data.map((item: any, index: number) => ({
      ...item,
      id: `${Date.now()}-${index}`,
    })).slice(0, count);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
