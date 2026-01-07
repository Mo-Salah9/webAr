
import { GoogleGenAI, Type } from "@google/genai";

export const getARInsights = async (modelName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this 3D AR object: "${modelName}". Provide a short, engaging description for an AR experience and 3 tips on how to interact with it in a physical space.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING, description: "Description of the model" },
          suggestions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Interaction tips"
          }
        },
        required: ["analysis", "suggestions"]
      }
    }
  });

  return JSON.parse(response.text);
};
