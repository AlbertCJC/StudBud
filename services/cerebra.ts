import { GoogleGenAI, Type } from "@google/genai";
import { GenerationMode, StudyMaterialResponse } from "../types";

export async function generateStudyMaterial(
  content: string,
  mode: GenerationMode,
  count: number = 10
): Promise<StudyMaterialResponse> {
  // FIX: Replaced Cerebras implementation with Google Gemini API as per guidelines.
  // The API key is sourced from process.env.API_KEY as per strict instructions.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const isFlashcards = mode === GenerationMode.FLASHCARDS;

  const flashcardSchema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "The question for the flashcard." },
      answer: { type: Type.STRING, description: "The answer to the flashcard question." },
    },
    required: ['question', 'answer'],
  };

  const quizSchema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "The quiz question." },
      options: {
        type: Type.ARRAY,
        description: "An array of exactly 4 potential answers.",
        items: { type: Type.STRING },
      },
      correctAnswer: { type: Type.STRING, description: "The correct answer from the options array." },
    },
    required: ['question', 'options', 'correctAnswer'],
  };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        description: `An array of exactly ${count} study items.`,
        items: isFlashcards ? flashcardSchema : quizSchema,
      },
    },
    required: ['items'],
  };

  const systemInstruction = `You are an expert educational content generator. 
Your goal is to create exactly ${count} high-quality ${isFlashcards ? 'flashcards' : 'quiz questions'} based on the provided content.

${isFlashcards 
  ? `For each flashcard, provide a 'question' and an 'answer'. The question should be concise and test a key concept. The answer should be clear and comprehensive.` 
  : `For each quiz question, provide a 'question', an array of exactly 4 'options', and the 'correctAnswer'. The options should be plausible, with one clear correct answer.`
}

Analyze the provided context and extract the most important information to create the study materials.`;

  // Heuristic to determine if the input is a topic that requires web search.
  const isTopicSearch = content.length < 200;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // A good default for text tasks
      contents: `Context: "${content.slice(0, 30000)}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.5,
        tools: isTopicSearch ? [{googleSearch: {}}] : undefined,
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini.");

    // The Gemini API returns a string that needs to be parsed.
    const data = JSON.parse(resultText);
    
    const items = (data.items || []).map((item: any, index: number) => ({
      ...item,
      id: `gemini-${Date.now()}-${index}`,
    })).slice(0, count);

    if (items.length === 0) {
      throw new Error("The AI was unable to extract enough study items from the provided content.");
    }
    
    const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => {
        if (chunk.web) {
          return { title: chunk.web.title || chunk.web.uri, uri: chunk.web.uri };
        }
        return null;
      })
      .filter((url): url is { title: string; uri: string } => url !== null) || [];

    return {
      items,
      groundingUrls,
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const message = error.message || "Failed to generate study materials.";
    const enhancedError = new Error(message);
    (enhancedError as any).cause = error.cause || error;
    throw enhancedError;
  }
}
