
import { GoogleGenAI, Type } from "@google/generative-ai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const fetchSolutionsFromGemini = async (category: string, problem: string): Promise<string[]> => {
  try {
    const prompt = `
      You are an expert school counselor specializing in advising on issues for male middle school students in Korea.
      A student is facing the following issue:
      - Category: ${category}
      - Specific Problem: ${problem}

      Please provide three distinct, practical, and actionable counseling approaches or solutions for this specific problem.
      The solutions should be concise, easy to understand, and suitable for a school counseling record. Each solution should be a complete sentence or two.
      Keep the language professional but empathetic.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            solutions: {
              type: Type.ARRAY,
              description: "List of three counseling solutions.",
              items: {
                type: Type.STRING
              }
            }
          }
        },
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result.solutions && Array.isArray(result.solutions)) {
      return result.solutions;
    }
    
    return [];

  } catch (error) {
    console.error("Error fetching solutions from Gemini:", error);
    throw error;
  }
};
