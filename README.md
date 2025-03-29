# Portfolio Backend API

A robust Node.js backend REST API that powers the portfolio website for Oussema Amri. This API handles project data, contact form submissions, and AI-powered chat functionality.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Health Check](#health-check)
  - [Projects](#projects)
  - [Contact](#contact)
  - [AI Chat](#ai-chat)
- [Deployment](#deployment)
  - [Docker](#docker)
  - [GitHub Actions to EC2](#github-actions-to-ec2)
- [Security](#security)
- [Contribution](#contribution)
- [License](#license)

## ✨ Features

- **Project Showcase**: API to retrieve portfolio projects
- **Contact Form**: Handle contact form submissions
- **AI-powered Chat**: Integrated with Deepseek AI for interactive portfolio exploration
- **Secure by Design**: Implements best practices for web API security
- **Docker Support**: Containerized for consistent deployment
- **CI/CD Pipeline**: Automated deployment to AWS EC2

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Validation**: Express Validator
- **Security**: Helmet
- **AI Integration**: Deepseek AI API
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas account)
- Deepseek AI API key (for chat functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Oussemamri/portfolio-backend.git
   cd portfolio-backend