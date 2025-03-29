const express = require('express');
const axios = require('axios');
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();

// Your Deepseek API key - store this in your .env file
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Define the system prompt with your personal information
const getSystemPrompt = () => {
  return `You are an AI assistant for Oussema Amri, a software engineer. 
Respond to questions about Oussema using the following information:

- Name: Oussema Amri
- Current Location: Meiningen, Germany
- Education: Master's in Computer Science at Hochschule Schmalkalden, Germany; Bachelor's from Esprit School of Engineering in Tunisia
- Languages: English (Fluent), German (Intermediate), French (Fluent), Arabic (Native)
- Skills: React, Vue.js, Node.js, Express, NestJS, Spring Boot, Django, Java, Python, JavaScript, TypeScript, AWS, Docker, Kubernetes, CI/CD, Git
- Experience:
  * Backend Engineer, Talan Tunisie (2021-2022): Developed with Spring Boot and Java
  * Web Developer, Ditriot (2022-2023): Focused on React, Node.js, and AWS
- Projects:
  * Quiz Application: AI-driven quiz management system with adaptive learning algorithms
  * Collaboradoc: Real-time collaboration platform with document management and versioning
  * DevOps Pipeline: Application lifecycle automation with Jenkins, Maven, and Docker
  * Microservices Architecture: Designed and deployed with Spring Boot, Docker, and Kubernetes
  * University Dormitory Management System: Web application for dormitory and event management
- Contact: Email: o.amri@stud.fh-sm.de, Phone: (+49) 15510 357723
- Interests: Cloud computing, AI/ML, DevOps, Microservices

Keep responses professional, concise, and friendly. If asked about topics unrelated to Oussema or his professional background, politely redirect the conversation to relevant topics.`;
};

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Call Deepseek API
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: getSystemPrompt() },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );
    
    // Extract the assistant's response
    const aiResponse = response.data.choices[0].message.content;
    
    res.json({ 
      success: true, 
      message: aiResponse 
    });
    
  } catch (error) {
    console.error('Deepseek API error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get response from AI', 
      details: error.message 
    });
  }
});

module.exports = router;