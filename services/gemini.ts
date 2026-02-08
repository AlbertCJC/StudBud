
import { GenerationMode } from "../types";

/**
 * Generates study material using Cerebras Cloud (Llama-3.3-70b).
 * This provides massive speed and higher free-tier rate limits than Gemini.
 */
export async function generateStudyMaterial(
  content: string | { mimeType: string, data: string },
  mode: GenerationMode,
  count: number = 10
): Promise<any[]> {
  const apiKey = process.env.API_KEY;
  
  let textInput = "";
  if (typeof content === 'string') {
    textInput = content;
  } else {
    // Note: Standard Cerebras Llama models are text-only for now.
    // For images, we provide a graceful fallback or instruction.
    throw new Error("Image analysis is hitting high rate limits on Gemini. For instant results with Cerebras, please paste text directly.");
  }

  const systemPrompt = mode === GenerationMode.FLASHCARDS 
    ? `You are an expert educator. Generate exactly ${count} study flashcards. 
       Return ONLY a JSON object with a key "items".
       Each item must have "question" and "answer".`
    : `You are an expert educator. Generate exactly ${count} multiple-choice questions.
       Return ONLY a JSON object with a key "items".
       Each item must have "question", "options" (array of 4), and "correctAnswer" (must match one option).`;

  try {
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama3.3-70b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Content: ${textInput.slice(0, 15000)}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Cerebras API Error");
    }

    const result = await response.json();
    const data = JSON.parse(result.choices[0].message.content);
    
    return (data.items || data).map((item: any, index: number) => ({
      ...item,
      id: `${Date.now()}-${index}`,
    })).slice(0, count);
  } catch (error) {
    console.error("Generation Error:", error);
    throw error;
  }
}
