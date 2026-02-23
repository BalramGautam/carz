const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Middleware
// Use CORS to allow your frontend to talk to this backend
app.use(cors());
// Parse JSON bodies (crucial for your fetch requests)
app.use(express.json());

// 2. Health Check Route
// Render needs this to confirm the server is "Alive"
app.get('/', (req, res) => {
    res.send("CarGPT Server is firing on all cylinders!");
});

// 3. Initialize Gemini AI
// On Render, ensure GEMINI_API_KEY is set in the 'Environment' tab
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 4. Chat Route
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ reply: "Engine's empty! Send a prompt." });
        }

        // Configure the CarGPT Persona
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are CarGPT, an expert automotive assistant created by Balram Gautam. Answer questions specifically about cars, engines, racing, and car history. Be concise and helpful. If asked who created you, say Balram Gautam."
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ reply: "Sorry, my engine stalled. Try asking again in a moment!" });
    }
});

// 5. Start the Server
// Render provides the PORT automatically; 10000 is a safe fallback
const PORT = process.env.PORT || 10000;

// IMPORTANT: We use '0.0.0.0' to allow external connections on Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ CarGPT is running on port ${PORT}`);
});
