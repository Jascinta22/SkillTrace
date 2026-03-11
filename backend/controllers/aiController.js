const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../config/db");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const evaluateSoftSkills = async (req, res) => {
    const { message, history } = req.body;
    const userId = req.user.userId;

    try {
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 200,
            },
        });

        // Prompt enhancement for soft skill evaluation
        const systemPrompt = `You are an AI Soft Skills Evaluator for the SkillTrace platform. 
        Your goal is to evaluate the user's communication, empathy, and conflict resolution skills through a natural conversation.
        Current Scenario: Team Conflict Resolution.
        Provide a concise response (max 2 sentences) that both continues the conversation and subtly guides them to demonstrate more empathy or technical objectivity. 
        At the end of your response, provide a JSON block with 'tone' and 'clarity' metrics (0-100).
        Example format: "That's a good start. How would you handle it if they disagreed? { \"tone\": \"Professional\", \"clarity\": \"High\", \"sentiment_score\": 85 }"`;

        const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
        const responseText = result.response.text();

        // Extract JSON metrics if present
        let cleanText = responseText;
        let metrics = { tone: "Professional", clarity: "High", sentiment_score: 70 };

        const jsonMatch = responseText.match(/\{.*\}/);
        if (jsonMatch) {
            try {
                metrics = JSON.parse(jsonMatch[0]);
                cleanText = responseText.replace(jsonMatch[0], "").trim();
            } catch (err) {
                console.error("Failed to parse AI metrics:", err);
            }
        }

        res.json({
            text: cleanText,
            metrics: metrics
        });

    } catch (err) {
        console.error("Gemini AI Error:", err);
        res.status(500).json({ error: "Failed to get AI response", message: err.message });
    }
};

module.exports = {
    evaluateSoftSkills
};
