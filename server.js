const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const path = require('path'); // Required to serve your HTML file
require('dotenv').config();

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Serve Static Files
// This tells Express to look for index.html in your main folder
app.use(express.static(path.join(__dirname, './')));

// 3. The "Home" Route
// This ensures that when you visit your URL, you see the actual website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 4. Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 5. Chat API Route
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ reply: "Engine's empty! Send a prompt." });
        }

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

// 6. Start the Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ CarGPT is live on port ${PORT}`);
});
