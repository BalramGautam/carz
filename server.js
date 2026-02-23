const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Serve Static Files (Make sure index.html is in the same folder)
app.use(express.static(path.join(__dirname, './')));

// 3. The "Home" Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 4. Chat API Route
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ reply: "Engine's empty!" });

        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);

        // --- MODEL UPGRADE ---
        // gemini-2.0-flash is the 2026 standard. It's faster and avoids 404 errors.
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash", 
            systemInstruction: "You are CarGPT, an automotive assistant created by Balram Gautam. Be concise."
        });

        // Simplified content generation call
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("AI Error:", error.message);
        // This will show the specific error in your chat box for easier debugging
        res.status(500).json({ reply: "Engine stalled: " + error.message });
    }
});

// 5. Start the Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ CarGPT is live on port ${PORT}`);
});
