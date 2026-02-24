const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "No prompt" });

        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const result = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are CarGPT, created by Balram Gautam. You are an expert automotive AI.",
                temperature: 0.8
            }
        });

        res.json({ reply: result.text });

    } catch (error) {
  
        if (error.message.includes('429') || error.message.includes('quota')) {
            console.log("⚠️ Quota hit! Sending fuel message.");
            return res.status(429).json({ 
                reply: "Hold up, my fuel is empty! ⛽ I'm getting fueled up now... My tanks are small on the free plan. Give me about 20-30 seconds to get back on the track!" 
            });
        }

        // Handle other engine failures
        console.error("AI Error:", error.message);
        res.status(500).json({ reply: "Engine stalled: " + error.message });
    }
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ CarGPT live on ${PORT}`);
});




