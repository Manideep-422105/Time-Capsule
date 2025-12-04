"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Use the specific 1.5 Flash model which is Free and Fast
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 

export async function generateAiPrompts() {
  try {
    const prompt = "You are a nostalgic time traveler helping people preserve memories. Generate 3 short, distinct, and thought-provoking questions to help a user write a message to their future self or a loved one. Return them as a simple numbered list.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { content: response.text() };
  } catch (error: any) {
    console.error("Gemini Prompt Error:", error);
    // Fallback error message
    return { error: "AI is currently sleeping. Please try again in a moment." };
  }
}

export async function generateSummary(text: string) {
  if (!text || text.length < 30) return null;

  try {
    const prompt = `You are a historian analyzing a time capsule. Provide a 1-sentence heartwarming summary of this text. Start with 'This memory is about...'. Here is the text: "${text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return null; 
  }
}

export async function refineMessage(text: string) {
  if (!text || text.length < 10) return { error: "Please write a message first." };

  try {
    const prompt = `You are a writing assistant. Refine the following message for clarity, grammar, and tone (nostalgic/personal). Do not add new factual content. Simply return the corrected and improved version of the text without any introductory or concluding remarks. Text: "${text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { content: response.text() };
  } catch (error) {
    console.error("Gemini Refinement Error:", error);
    return { error: "AI failed to refine the message. Try again." };
  }
}