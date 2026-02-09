
import OpenAI from "openai";
import { GenerationMode, StudyMaterialResponse } from "../types";

export async function generateStudyMaterial(
  content: string,
  mode: GenerationMode,
  count: number = 10
): Promise<StudyMaterialResponse> {
  const isFlashcards = mode === GenerationMode.FLASHCARDS;

  // Use a generic environment variable for the API key.
  const apiKey = (import.meta as any).env.VITE_AI_API_KEY || "";

  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_AI_API_KEY in your .env file.");
  }

  // NOTE: This client is configured for a specific AI provider.
  // To use a different provider, you may need to update the baseURL.
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.cerebras.ai/v1", // This baseURL is provider-specific.
    dangerouslyAllowBrowser: true 
  });

  const systemInstruction = `You are an expert educational content generator. 
Your goal is to create exactly ${count} high-quality ${isFlashcards ? 'flashcards' : 'quiz questions'} based on the provided content.

${isFlashcards 
  ? `For each flashcard, provide a 'question' and an 'answer'.` 
  : `For each quiz question, provide a 'question', exactly 4 'options', and the 'correctAnswer'.`
}

Output MUST be a single valid JSON object. Format: { "items": [ ... ] }`;

  try {
    const response = await client.chat.completions.create({
      // Model selection is provider-specific.
      model: "llama-3.3-70b", 
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `Context: "${content.slice(0, 30000)}"` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 8192,
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) throw new Error("Empty response from the AI model.");

    const data = JSON.parse(resultText);
    
    const items = (data.items || []).map((item: any, index: number) => ({
      ...item,
      id: `ai-gen-${Date.now()}-${index}`, // Generic ID
    })).slice(0, count);

    return { items, groundingUrls: [] };

  } catch (error: any) {
    console.error("AI API Error:", error);
    
    if (error.status === 401) {
       throw new Error(`Authentication Error (401). Please check your API key.`);
    }
    if (error.status === 404) {
       throw new Error(`Model not found (404). Please ensure the model name is correct for your provider.`);
    }

    throw new Error(error.message || "Failed to generate study materials.");
  }
}
