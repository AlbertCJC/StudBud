
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateStudyMaterial(
  content: string,
  mode: GenerationMode,
  count: number = 10,
  useSearch: boolean = false
): Promise<any[]> {
  const model = "gemini-3-flash-preview";

  const schema = mode === GenerationMode.FLASHCARDS 
    ? {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ["question", "answer"]
            }
          }
        },
        required: ["items"]
      }
    : {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer"]
            }
          }
        },
        required: ["items"]
      };

  const prompt = useSearch 
    ? `RESEARCH TOPIC: "${content}". 
       Use Google Search to find accurate, academic information about this topic.
       Generate exactly ${count} high-quality ${mode.toLowerCase()} based on your findings.`
    : `Generate exactly ${count} ${mode.toLowerCase()} based on this content: 
       "${content.slice(0, 10000)}"`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  
  const data = JSON.parse(text);
  const items = data.items || [];

  return items.map((item: any, index: number) => ({
    ...item,
    id: `${Date.now()}-${index}`,
  })).slice(0, count);
}
