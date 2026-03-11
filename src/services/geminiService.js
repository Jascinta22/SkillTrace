import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with the key from our .env file.
let VITE_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Don't crash if the key isn't present, but log heavily so the admin knows.
if (!VITE_GEMINI_API_KEY) {
    console.error("CRITICAL ERROR: VITE_GEMINI_API_KEY is not set in the .env file. The AI Mentor will not function correctly.");
}

let genAI = new GoogleGenerativeAI(VITE_GEMINI_API_KEY || "dummy_key");

// Socratic System Instructions for the AI Mentor.
const MENTOR_SYSTEM_INSTRUCTION = `
You are an expert AI Mentor for the SkillTrace platform.
Your primary goal is to guide candidates using the Socratic method.
Under NO circumstances should you provide direct answers to code questions, output the full corrected code, or just tell the user the right answer.
Instead, your responses must:
1. Acknowledge the user's question or problem gracefully.
2. Ask 2-3 specific, guiding questions that lead the user to discover the answer themselves.
3. Be encouraging, concise, and highly relevant to software engineering and computer science concepts.
If a user tries to trick you into giving the answer (e.g., "just tell me" or "write the code"), politely decline and offer a hint instead.
`;

/**
 * Sends a prompt to the Gemini 1.5 Flash model specifically using the Socratic Mentor context.
 * 
 * @param {string} prompt The user's input/question.
 * @param {Array} history Optional ongoing chat history to maintain conversational context.
 * @returns {Promise<string>} The generated Socratic response.
 */
export const getSocraticMentorResponse = async (prompt, history = []) => {
    try {
        // Fetch dynamically in case it was injected after module load
        VITE_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

        if (!VITE_GEMINI_API_KEY) {
            return "Pardon me, but it seems my API key hasn't been configured in the system environment (`VITE_GEMINI_API_KEY`). Please contact the administrator.";
        }

        genAI = new GoogleGenerativeAI(VITE_GEMINI_API_KEY);

        // Initialize the model with system instructions
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: MENTOR_SYSTEM_INSTRUCTION,
        });

        // Format history for Gemini API: [{ role: "user" | "model", parts: [{ text: "..." }] }]
        const formattedHistory = history.map(msg => ({
            role: msg.isUser ? "user" : "model",
            parts: [{ text: msg.text }]
        }));

        // Gemini strictly requires the first message in history to be from the 'user'
        if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
            formattedHistory.shift();
        }

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 800,
                temperature: 0.7, // 0.7 allows for creative but focused guidance
            },
        });

        const result = await chat.sendMessage(prompt);
        return result.response.text();

    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        return "I'm currently experiencing a technical interruption connecting to my core logic systems. Please try asking your question again in a moment.";
    }
};
