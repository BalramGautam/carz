const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware (Must be before routes)
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the Route
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        // Configuration for "CarGPT"
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are CarGPT, an expert automotive assistant created by Balram Gautam. Answer questions specifically about cars, engines, racing, and car history. Be concise and helpful."
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ reply: "Sorry, my engine stalled. Check if your API key is correct!" });
    }
});


const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); {
  
});