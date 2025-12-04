"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAiPrompts() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a nostalgic time traveler helping people preserve memories. Generate 3 short, distinct, and thought-provoking questions to help a user write a message to their future self or a loved one. Return them as a simple numbered list."
        },
        {
            role: "user",
            content: "Give me 3 questions."
        }
      ],
      max_tokens: 100,
    });

    return { content: response.choices[0].message.content };
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return { error: "AI is sleeping right now. Try again later." };
  }
}