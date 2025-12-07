import { GoogleGenAI } from "@google/genai";
import { InsightResponse } from "../types";

const processApiKey = process.env.API_KEY || '';

export const generateAwakeningInsight = async (): Promise<InsightResponse> => {
  if (!processApiKey) {
    return {
      message: "Energy persists, the mind becomes luminous. (API Key missing for live insight)",
      source: "System Default"
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: processApiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `The user has just completed a visualization exercise where they vigorously broke through a stone crust covering a glowing planet, symbolizing the overcoming of "Thina-middha" (Sloth and Torpor) using "Viriya" (Energy).
      
      Generate a short, profound, 1-sentence insight or quote in the style of the Pali Canon or Zen tradition about the transition from heaviness/darkness to luminosity/energy. 
      Also provide a fictional or traditional source name.
      
      Return as JSON: { "message": "string", "source": "string" }`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text) as InsightResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      message: "Through effort, the moon frees itself from the clouds.",
      source: "Dhammapada (Fallback)"
    };
  }
};