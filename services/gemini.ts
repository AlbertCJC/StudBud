
import { GoogleGenAI, Type } from "@google/genai";
import { FlashcardData, QuizData, GenerationMode } from "../types";

export async function generateStudyMaterial(
  content: string | { mimeType: string, data: string },
  mode: GenerationMode
): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
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
    ? "You are an expert educator. Extract important concepts into high-quality flashcards with clear questions and concise answers."
    : "You are an expert educator. Create challenging multiple-choice questions from the content. Provide 4 options per question and clearly identify the correct answer.";

  try {
    let parts: any[] = [];
    if (typeof content === 'string') {
      parts.push({ text: `Create study material from this text in ${mode} format:\n\n${content}` });
    } else {
      parts.push({ inlineData: content });
      parts.push({ text: `Create study material from this document in ${mode} format.` });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: mode === GenerationMode.FLASHCARDS ? flashcardSchema : quizSchema,
      },
    });

    const data = JSON.parse(response.text || '[]');
    return data.map((item: any, index: number) => ({
      ...item,
      id: `${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
