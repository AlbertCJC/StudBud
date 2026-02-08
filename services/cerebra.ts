
import { Cerebras } from "@cerebras/cerebras_cloud_sdk";
import { GenerationMode, StudyMaterialResponse } from "../types";

/**
 * Generates study materials using the Cerebras Cloud SDK.
 * This service leverages the ultra-fast Cerebras LPU for instant generation.
 */
export async function generateStudyMaterial(
  content: string,
  mode: GenerationMode,
  count: number = 10,
  useSearch: boolean = false
): Promise<StudyMaterialResponse> {
  
  const isFlashcards = mode === GenerationMode.FLASHCARDS;

  // Vite requires the VITE_ prefix to expose environment variables to the client.
  const apiKey = (import.meta.env.VITE_CEREBRAS_API_KEY || "").trim();

  // Robust validation before client initialization
  if (!apiKey) {
    console.error("CRITICAL: Cerebras API key not found. Ensure VITE_CEREBRAS_API_KEY is set in your .env file.");
    throw new Error("API authentication failed: Missing VITE_CEREBRAS_API_KEY. Please check your configuration.");
  }

  // Initialize the Cerebras SDK Client
  const client = new Cerebras({
    apiKey: apiKey
  });

  const systemInstruction = `You are an expert educational content generator. 
Your goal is to create exactly ${count} high-quality ${isFlashcards ? 'flashcards' : 'quiz questions'} based on the provided content.

${isFlashcards 
  ? `For each flashcard, provide a 'question' and an 'answer'.` 
  : `For each quiz question, provide a 'question', exactly 4 'options', and the 'correctAnswer' (which must be one of the options).`
}

Output MUST be a single valid JSON object. 
Format:
{
  "items": [
    ${isFlashcards 
      ? '{ "question": "Question text", "answer": "Answer text" }' 
      : '{ "question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "The exactly matching correct option string" }'
    }
  ]
}

IMPORTANT: 
- Return ONLY the raw JSON object. 
- NO markdown code blocks.
- NO introductory or concluding text.`;
  
  // FIX: Explicitly type the messages array to narrow the 'role' property from 'string'
  // to a union of literals ('system' | 'user'). This resolves the TypeScript error where
  // the inferred type was too broad and failed to match the SDK's expected message types.
  const messages: { role: "system" | "user"; content: string }[] = [
    { role: "system", content: systemInstruction },
    { role: "user", content: `Context content for generation (truncated to 30k chars): "${content.slice(0, 30000)}"` }
  ];

  try {
    const chatCompletion = await client.chat.completions.create({
        messages,
        model: "qwen-3-235b-a22b-instruct-2507", // Using model from user's provided snippet
        temperature: 0.6,
        max_tokens: 8192,
    });

    const resultText = chatCompletion.choices?.[0]?.message?.content;

    if (!resultText) {
      throw new Error("The Cerebras LPU returned an empty or malformed response.");
    }

    let data;
    try {
      // The model might still wrap the response in markdown, so we'll clean it up.
      const cleanedText = resultText.trim().replace(/^```json\n?/, '').replace(/```$/, '');
      data = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Cerebras JSON response:", resultText);
      throw new Error("The AI generated an invalid JSON response. Please try again.");
    }

    const items = (data.items || []).map((item: any, index: number) => ({
      ...item,
      id: `cerebra-${Date.now()}-${index}`,
    })).slice(0, count);

    if (items.length === 0) {
      throw new Error("The AI was unable to extract enough study items from the provided content.");
    }

    return {
      items,
      groundingUrls: [] // Grounding is not implemented in this flow
    };

  } catch (error: any) {
    console.error("Cerebras Generation Failure:", error);
    let errorMessage = "An unexpected error occurred during study material generation.";
    // Handle potential structured errors from the SDK
    if (error && typeof error === 'object') {
        if ('status' in error && error.status === 401) {
            errorMessage = "Authentication failed (401). Your Cerebras API key is invalid or lacks permission for the requested model.";
        } else if ('status' in error && error.status === 429) {
            errorMessage = "Rate limit exceeded (429). Please wait a moment before trying again.";
        } else if ('message' in error && typeof error.message === 'string') {
            errorMessage = error.message;
        }
    }
    // Re-throw the error with a clean message for the UI
    throw new Error(errorMessage);
  }
}
