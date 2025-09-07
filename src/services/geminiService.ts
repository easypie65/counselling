// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Vite 규칙: 빌드 타임에 주입되는 공개 환경변수는 VITE_ 접두사
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not set. Please configure it in your build environment.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export async function askGemini(prompt: string) {
  // 모델명은 필요에 맞게 바꿔도 됩니다 (예: "gemini-1.5-flash", "gemini-1.5-pro")
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
