import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { GenerationMode, StudyMaterialResponse } from "../types";

// Retrieve and validate the API key at the module level
const apiKey = (process.env['CEREBRAS_API_KEY'] || process.env['API_KEY'] || "").trim();

// Initialize the client as a singleton following the suggested pattern
const client = new Cerebras({
  apiKey: apiKey,
});

/**
 * Generates study materials using the official Cerebras Cloud SDK.
 * Leveraging the high-speed LPU backend for near-instant Llama 3.3 generation.
 */
export async function generateStudyMaterial(
  content: string,
  mode: GenerationMode,
  count: number = 10,
  useSearch: boolean = false
): Promise<StudyMaterialResponse> {
  
  // Runtime check for API key presence
  if (!apiKey || apiKey === "undefined" || apiKey === "null") {
    throw new Error("Cerebras API key is missing. Please check your .env file and ensure CEREBRAS_API_KEY is set correctly.");
  }

  const systemInstruction = `You are a specialized educational assistant. 
  Generate exactly ${count} high-quality ${mode === GenerationMode.FLASHCARDS ? 'flashcards' : 'quiz questions'} based on the provided content.
  
  IMPORTANT: You must return valid JSON in this exact structure:
  {
    "items": [
      ${mode === GenerationMode.FLASHCARDS 
        ? '{ "question": "Front of card", "answer": "Back of card" }' 
        : '{ "question": "Question text", "options": ["Choice A", "Choice B", "Choice C", "Choice D"], "correctAnswer": "Exact matching string from options" }'
      }
    ]
  }

  Focus on factual accuracy, academic clarity, and helpfulness.`;

  const userPrompt = `Context for study material generation: "${content.slice(0, 28000)}"`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ],
      // Use JSON object response format for guaranteed structural integrity
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const jsonStr = response.choices[0]?.message?.content;
    
    if (!jsonStr) {
      throw new Error("Cerebras LPU returned an empty response. Please try again.");
    }

    const data = JSON.parse(jsonStr);
    
    const items = (data.items || []).map((item: any, index: number) => ({
      ...item,
      id: `cerebra-${Date.now()}-${index}`,
    })).slice(0, count);

    // Return the generated items. Note: LPU inference currently handles text-based generation.
    return { items, groundingUrls: [] };

  } catch (error: any) {
    console.error("Cerebras SDK Error:", error);
    
    // Provide actionable feedback for common authentication and rate limit errors
    if (error.status === 401) {
      throw new Error("Cerebras Authentication Failed (401): The provided API key is incorrect or invalid. Verify your .env file.");
    } else if (error.status === 429) {
      throw new Error("Cerebras Rate Limit Exceeded (429): Too many requests. Please wait a moment.");
    }
    
    throw new Error(error.message || "An unexpected error occurred while contacting the Cerebras LPU.");
  }
}