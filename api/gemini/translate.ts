import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { texts } = req.body;
  if (!texts || !Array.isArray(texts))
    return res.status(400).json({ error: "Texts array is required" });
  try {
    const prompt = `Translate the following ${texts.length} scientific abstracts into professional, native-sounding Chinese.
Return ONLY a JSON array of strings. Concise (under 50 words).

Abstracts:
${texts.map((t: string, i: number) => `[${i}]: ${t}`).join("\n\n")}`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to translate" });
  }
}
