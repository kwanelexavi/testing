import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

// Helper to safely get the API key from various environments (Sandbox, Vite, CRA)
const getApiKey = () => {
  // 1. Sandbox Environment
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }
  // 2. Vite Local Development
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
    return (import.meta as any).env.VITE_API_KEY;
  }
  // 3. Create React App Local Development
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_KEY) {
    return process.env.REACT_APP_API_KEY;
  }
  return undefined;
};

const apiKey = getApiKey();

// Initialize AI Client
// Note: If apiKey is missing, this might not throw immediately, but subsequent calls will fail.
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key_for_init' });

// We keep a reference to the chat session instance
let chatSession: Chat | null = null;

export const initializeChat = () => {
  if (!apiKey) {
    console.error("❌ MISSING API KEY: Please create a .env file in your project root with VITE_API_KEY=your_gemini_key");
    return;
  }

  try {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a compassionate, empathetic, and safe mental health support companion named 'Haven'. Your goal is to provide emotional support, listen actively, and offer gentle coping strategies for stress, anxiety, or trauma. You are NOT a doctor or a crisis hotline. If a user indicates they are in immediate danger, self-harming, or facing a life-threatening emergency, you must gently but firmly encourage them to contact local emergency services immediately (like 911 or local helplines). Keep your tone warm, non-judgmental, and supportive. Keep responses concise and readable.",
        temperature: 0.7,
      },
    });
  } catch (error) {
    console.error("Failed to initialize chat:", error);
  }
};

export const sendMessageToGemini = async (message: string): Promise<AsyncIterable<GenerateContentResponse>> => {
  if (!apiKey) {
    throw new Error("Missing Google API Key. Please configure VITE_API_KEY locally.");
  }

  if (!chatSession) {
    initializeChat();
  }
  
  if (!chatSession) {
      throw new Error("Failed to initialize chat session");
  }

  try {
    const result = await chatSession.sendMessageStream({ message });
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};