// server.js (proxy server)
import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Load environment variables from .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error("OpenAI API key is not set in environment variables.");
}

console.log(process.env); // Log all environment variables

const app = express();
const openai = new OpenAI(OPENAI_API_KEY);


// Middleware to parse JSON requests
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Define a simple GET route for the root
app.get('/', (req, res) => {
    res.send('Welcome to the NutriSync API!'); // Response message
});

app.post("/", async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4-turbo", 
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            }),
        });

        // Check if the response from OpenAI is ok
        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenAI API error:", errorData);
            return res.status(response.status).json({ error: errorData });
        }

        const data = await response.json();
        res.json({ recipe: data.choices[0].message.content.trim() });
    } catch (error) {
        console.error("Error fetching recipe from OpenAI:", error.message || error);
        res.status(500).json({ error: "Error fetching recipe." });
    }
});


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
