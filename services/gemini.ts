
import { GenerationMode } from "../types";

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
    // Current Cerebras Llama models are text-optimized. 
    // For a world-class experience, we notify the user if they try to use images in this mode.
    throw new Error("Image analysis is not supported with the Cerebras Llama-3.3 model. Please use the 'Custom Text' tab for instant generation.");
  }

  const systemPrompt = mode === GenerationMode.FLASHCARDS 
    ? `You are an expert educational assistant. Your task is to generate exactly ${count} high-quality flashcards from the provided content. 
       Format your response as a JSON object with a key "items" which is an array of objects. 
       Each object must have "question" and "answer" properties. 
       Ensure questions are clear and answers are concise and accurate.`
    : `You are an expert educational assistant. Your task is to generate exactly ${count} multiple-choice questions from the provided content. 
       Format your response as a JSON object with a key "items" which is an array of objects. 
       Each object must have "question", "options" (array of 4 distinct strings), and "correctAnswer" (string, must exactly match one of the options).`;

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
          { role: "user", content: `Generate ${count} ${mode.toLowerCase()} based on this content: ${textInput}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Cerebras API Error: ${response.status}`);
    }

    const result = await response.json();
    const contentString = result.choices[0].message.content;
    
    // Parse the structured JSON response
    const jsonContent = JSON.parse(contentString);
    const items = jsonContent.items || [];

    return items.map((item: any, index: number) => ({
      ...item,
      id: `${Date.now()}-${index}`,
    })).slice(0, count);

  } catch (error) {
    console.error("Cerebras Generation Error:", error);
    throw error;
  }
}
