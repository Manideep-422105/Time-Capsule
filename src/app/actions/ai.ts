"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Use working model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});

/**
 * HELPER: Robust wrapper to handle Retries and Rate Limits (429)
 */
async function safeAiCall(prompt: string, retries = 2, delay = 2500) {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 || error?.message?.includes("429");

      if (isRateLimit && i < retries) {
        console.warn(`Quota hit. Retrying in ${delay}ms... (Attempt ${i + 1})`);
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      throw error;
    }
  }
}

/**
 * 1. Generates Nostalgic Prompts
 */
export async function generateAiPrompts() {
  try {
    const prompt =
      "Generate 3 short, distinct, thought-provoking questions for someone writing to their future self. Return only a simple numbered list.";
    const text = await safeAiCall(prompt);
    return { content: text };
  } catch (error: any) {
    console.error("Gemini Prompt Error:", error);
    return { error: "AI is resting. Try again in a moment." };
  }
}

/**
 * 2. Combined Action
 */
export async function processMessage(text: string) {
  if (!text || text.length < 10) {
    return { error: "Message is too short to process." };
  }

  try {
    const prompt = `
      You are a writing assistant for a 'Time Capsule' app. 
      Task 1: Refine the text below for clarity and a nostalgic tone.
      Task 2: Provide a 1-sentence heartwarming summary starting with 'This memory is about...'.
      
      Return the result exactly in this format:
      REFINED: [refined text]
      SUMMARY: [summary text]

      Text: "${text}"
    `;

    const responseText = await safeAiCall(prompt);

    const refinedMatch = responseText?.match(/REFINED:\s*(.*)/i);
    const summaryMatch = responseText?.match(/SUMMARY:\s*(.*)/i);

    return {
      refined: refinedMatch ? refinedMatch[1].trim() : text,
      summary: summaryMatch
        ? summaryMatch[1].trim()
        : "A special memory saved for the future.",
    };
  } catch (error) {
    console.error("Gemini Processing Error:", error);
    return { error: "Failed to process message due to high traffic." };
  }
}
