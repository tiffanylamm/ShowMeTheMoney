import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}

export const geminiClient = new GoogleGenAI({ apiKey });

export async function generateJSON<T>(
    prompt: string,
    schema: GenerateContentConfig["responseSchema"]
): Promise<T> {
    const response = await geminiClient.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini returned empty response");

    return JSON.parse(text) as T;
}
