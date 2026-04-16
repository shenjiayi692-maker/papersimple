import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt, schema } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
}
