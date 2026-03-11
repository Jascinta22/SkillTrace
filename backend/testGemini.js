const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

const run = async () => {
    try {
        console.log("Key:", process.env.VITE_GEMINI_API_KEY ? "Loaded" : "Missing");
        const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: 'Say hello' }] }]
        });
        console.log('Successfully connected!');
    } catch (e) {
        console.log('\n--- FULL ERROR ---\n');
        console.log(e.message);
    }
};

run();
