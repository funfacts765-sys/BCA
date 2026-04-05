import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function askDoubt(question: string, context?: string) {
  const model = "gemini-3-flash-preview";
  const prompt = context 
    ? `You are an educational assistant. A student has a doubt about the following context: "${context}". \n\nQuestion: ${question}`
    : `You are an educational assistant. A student has a doubt: \n\nQuestion: ${question}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "I'm sorry, I couldn't generate an answer.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while processing your request.";
  }
}
