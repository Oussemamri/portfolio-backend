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
    
    try {
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
    } catch (apiError) {
      console.error('Deepseek API error:', apiError.response?.data || apiError.message);
      
      // Use fallback response when API fails
      const fallbackResponse = getFallbackResponse(message);
      res.json({
        success: true,
        message: fallbackResponse,
        note: "This is a fallback response as the AI service is currently unavailable."
      });
    }
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

module.exports = router;