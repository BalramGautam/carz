const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Serve Static Files
app.use(express.static(path.join(__dirname, './')));

// 3. The "Home" Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 4. Chat API Route
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ reply: "Engine's empty! Send a prompt." });
        }

        // --- THE FIX IS HERE ---
        // We get the key inside the request to ensure Render has it ready.
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            throw new Error("API Key is missing from Environment Variables");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are CarGPT, an expert automotive assistant created by Balram Gautam. Answer questions specifically about cars, engines, racing, and car history. Be concise and helpful. If asked who created you, say Balram Gautam."
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        // This log will help you see the EXACT error in Render Logs
        console.error("AI Error Details:", error.message);
        res.status(500).json({ reply: "Engine stalled: " + error.message });
    }
});

// 5. Start the Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ CarGPT is live on port ${PORT}`);
});
