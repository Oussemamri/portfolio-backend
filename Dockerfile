FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Ensure environment variables are passed through
ENV NODE_ENV=production
ENV PORT=5000

# Explicitly set variables from build args
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

EXPOSE 5000

CMD ["node", "src/server.js"]