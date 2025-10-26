import { GoogleGenAI } from "@google/genai";
import { Complaint, ComplaintType, Location } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getChatbotResponse = async (query: string, complaints: Complaint[]): Promise<string> => {
  try {
    const systemInstruction = `You are a "SudharSetu" support chatbot. Your role is to provide citizens with the status of their civic complaints.
You must be friendly, professional, and concise.
You have access to a list of complaints in JSON format. Use this data to answer user questions.
If a user asks for the status of a specific complaint ID, find that complaint in the data and provide its status and any other relevant details like resolution notes.
If the complaint ID is not found, inform the user politely.
Do not answer questions unrelated to the provided civic complaints.`;
    
    const contents = `Here is the current list of complaints:
${JSON.stringify(complaints, null, 2)}

User's question: "${query}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error getting response from Gemini:", error);
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
};

export const verifyComplaintImage = async (
  base64Image: string,
  mimeType: string,
  complaintType: ComplaintType
): Promise<boolean> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };
    const textPart = {
      text: `Does this image contain a "${complaintType}"? Respond with only 'Yes' or 'No'.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    const result = response.text.trim().toLowerCase();
    return result === 'yes';
  } catch (error) {
    console.error("Error verifying image with Gemini:", error);
    // Fail open for better UX if the API fails, but in a real app, you might want to log this for review.
    return true; 
  }
};
