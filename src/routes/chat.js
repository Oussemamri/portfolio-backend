const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

console.log("Loading chat.js route");
console.log(`GEMINI_API_KEY exists directly in process.env: ${!!process.env.GEMINI_API_KEY}`);
console.log(`GEMINI_API_KEY first 5 chars: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' : 'not set'}`);

// Your Gemini API key - store this in your .env file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

// Fallback function to use when API is unavailable
const getFallbackResponse = (message) => {
  // Basic responses for common questions
  const responses = {
    skills: "Oussema's key skills include React, Vue.js, Node.js, Express, NestJS, Spring Boot, Django, Java, Python, JavaScript, TypeScript, AWS, Docker, Kubernetes, CI/CD, and Git.",
    experience: "Oussema worked as a Backend Engineer at Talan Tunisie (2021-2022) using Spring Boot and Java, and as a Web Developer at Ditriot (2022-2023) focusing on React, Node.js, and AWS.",
    education: "Oussema has a Master's in Computer Science from Hochschule Schmalkalden, Germany and a Bachelor's from Esprit School of Engineering in Tunisia.",
    contact: "You can contact Oussema via email at o.amri@stud.fh-sm.de or by phone at (+49) 15510 357723.",
    projects: "Oussema's notable projects include a Quiz Application, Collaboradoc (real-time collaboration platform), DevOps Pipeline, Microservices Architecture, and a University Dormitory Management System.",
    location: "Oussema is currently based in Meiningen, Germany.",
    languages: "Oussema is fluent in English, French, and Arabic (native), with intermediate knowledge of German.",
    default: "I'm a simple assistant for Oussema's portfolio. I can tell you about his skills, experience, education, projects, or contact information."
  };

  // Check for keywords in the message
  const lowercaseMessage = message.toLowerCase();
  if (lowercaseMessage.includes('skill')) return responses.skills;
  if (lowercaseMessage.includes('experience') || lowercaseMessage.includes('work')) return responses.experience;
  if (lowercaseMessage.includes('education') || lowercaseMessage.includes('study')) return responses.education;
  if (lowercaseMessage.includes('contact') || lowercaseMessage.includes('email') || lowercaseMessage.includes('phone')) return responses.contact;
  if (lowercaseMessage.includes('project')) return responses.projects;
  if (lowercaseMessage.includes('location') || lowercaseMessage.includes('live')) return responses.location;
  if (lowercaseMessage.includes('language') || lowercaseMessage.includes('speak')) return responses.languages;
  
  return responses.default;
};

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // If no Gemini API key is provided, use fallback responses
    if (!GEMINI_API_KEY) {
      console.log('No Gemini API key found, using fallback response');
      const fallbackResponse = getFallbackResponse(message);
      return res.json({
        success: true,
        message: fallbackResponse,
        note: "Using predefined responses as the AI service is not configured."
      });
    }
    
    try {
      console.log('Attempting to call Gemini API...');
      
      // Initialize the model (using Gemini 1.5 Flash which is fastest and most efficient)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Prepare the prompt
      const systemPrompt = getSystemPrompt();
      
      // Create the generation request - Gemini uses a slightly different format than other APIs
      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nUser question: ${message}` }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });
      
      console.log('Gemini API call successful');
      
      // Extract the response
      const aiResponse = result.response.text();
      
      res.json({ 
        success: true, 
        message: aiResponse 
      });
    } catch (apiError) {
      console.log('Using fallback response system');
      console.error('Gemini API error:', apiError);
      
      // Use fallback response when API fails
      const fallbackResponse = getFallbackResponse(message);
      return res.json({
        success: true,
        message: fallbackResponse,
        note: "This is a fallback response as the AI service is currently unavailable."
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Debug endpoint
router.get('/debug', (req, res) => {
  res.json({
    nodeVersion: process.version,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT
    },
    mongodb: {
      uri: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 15) + '...' : 'not set',
      connected: mongoose.connection.readyState === 1
    },
    gemini: {
      apiKeyExists: !!process.env.GEMINI_API_KEY,
      apiKeyFirstChars: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' : 'not set'
    }
  });
});

module.exports = router;