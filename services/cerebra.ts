import OpenAI from "openai";
import { GenerationMode, StudyMaterialResponse } from "../types";

export async function generateStudyMaterial(
  content: string,
  mode: GenerationMode,
  count: number = 10
): Promise<StudyMaterialResponse> {

  const isFlashcards = mode === GenerationMode.FLASHCARDS;

  // 1. UNIVERSAL API KEY EXTRACTION
  // Checks both Vite (Client) and Node (Server) environments safely.
  let apiKey = "";
  try {
    apiKey = (import.meta as any).env.VITE_CEREBRAS_API_KEY || "";
  } catch (e) { /* Ignore Vite error in Node */ }

  if (!apiKey && typeof process !== "undefined") {
    apiKey = process.env.CEREBRAS_API_KEY || "";
  }
  
  // Hardcoded Fallback (Only for your local testing in AI Studio)
  // Replace the empty string below with your key if env vars fail
  if (!apiKey) apiKey = ""; 

  if (!apiKey) {
    throw new Error("❌ API Key is missing. Please set VITE_CEREBRAS_API_KEY (Vite) or CEREBRAS_API_KEY (Node) in your .env file.");
  }

  // 2. INITIALIZE CLIENT (Per Cerebras Docs)
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.cerebras.ai/v1", // Required Base URL
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
      // 3. MODEL SELECTION (Critical Fix)
      // According to docs, valid IDs are: "llama-3.3-70b" (Recommended) or "llama3.1-8b" (Fastest)
      model: "llama-3.3-70b", 
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `Context: "${content.slice(0, 30000)}"` }
      ],
      response_format: { type: "json_object" }, // Supported by Llama 3.x
      temperature: 0.6,
      max_tokens: 8192,
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) throw new Error("Empty response from Cerebras.");

    const data = JSON.parse(resultText);
    
    const items = (data.items || []).map((item: any, index: number) => ({
      ...item,
      id: `cerebra-${Date.now()}-${index}`,
    })).slice(0, count);

    return { items, groundingUrls: [] };

  } catch (error: any) {
    console.error("Cerebras API Error:", error);
    
    // Documentation-specific error handling
    if (error.status === 404) {
       throw new Error(`Model not found (404). 'llama-3.3-70b' or 'llama3.1-8b' are the currently supported model IDs.`);
    }

    throw new Error(error.message || "Failed to generate study materials.");
  }
}