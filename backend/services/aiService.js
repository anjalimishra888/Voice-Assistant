const OpenAI = require('openai');

const getAIResponse = async (message) => {
  try {
    // If OpenAI API key is not set, use a mock response for development
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return getMockResponse(message);
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Luna, a helpful AI voice assistant. You provide clear, concise, and accurate responses. Keep responses under 200 words for voice readability.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error.message);
    // Fallback to mock response if API call fails
    return getMockResponse(message);
  }
};

const getMockResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'Hello! I am Luna, your AI voice assistant. How can I help you today?';
  }
  if (lowerMessage.includes('how are you')) {
    return 'I am doing great, thank you for asking! I am here to assist you with any questions you may have.';
  }
  if (lowerMessage.includes('time')) {
    const now = new Date();
    return `The current time is ${now.toLocaleTimeString()}.`;
  }
  if (lowerMessage.includes('date') || lowerMessage.includes('today')) {
    const now = new Date();
    return `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
  }
  if (lowerMessage.includes('weather')) {
    return 'I am not connected to a weather service at the moment. Please check your local weather forecast for accurate information.';
  }
  if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
    return 'I am Luna, an intelligent AI voice assistant built with the MERN stack. I can answer questions, help with tasks, and have conversations with you.';
  }
  if (lowerMessage.includes('what is your name')) {
    return 'My name is Luna. It is a pleasure to meet you!';
  }
  if (lowerMessage.includes('thank')) {
    return 'You are welcome! I am happy to help. Feel free to ask me anything else.';
  }
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
    return 'Goodbye! It was nice talking to you. Feel free to come back anytime you need assistance.';
  }
  if (lowerMessage.includes('artificial intelligence') || lowerMessage.includes('ai')) {
    return 'Artificial Intelligence is the simulation of human intelligence by machines. It involves learning, reasoning, problem-solving, perception, and language understanding. AI powers many modern technologies including voice assistants like me!';
  }
  if (lowerMessage.includes('machine learning')) {
    return 'Machine Learning is a branch of Artificial Intelligence that enables systems to learn and improve from experience without being explicitly programmed. It uses algorithms to find patterns in data and make predictions.';
  }
  if (lowerMessage.includes('mern') || lowerMessage.includes('stack')) {
    return 'The MERN stack is a popular web development framework consisting of MongoDB, Express.js, React, and Node.js. It allows developers to build full-stack applications using JavaScript throughout the entire development process.';
  }
  if (lowerMessage.includes('javascript')) {
    return 'JavaScript is a versatile programming language primarily used for web development. It enables interactive web pages and is an essential part of web applications. Along with HTML and CSS, it is one of the core technologies of the World Wide Web.';
  }
  if (lowerMessage.includes('help')) {
    return 'I can help you with various topics! You can ask me about artificial intelligence, programming, the current time and date, or just have a friendly conversation. Feel free to ask me anything!';
  }

  if (lowerMessage.includes('open') || lowerMessage.includes('launch') || lowerMessage.includes('start')) {
    return `Opening that for you!`;
  }

  return `That is an interesting question! Based on my knowledge, I would say that "${message}" is a topic worth exploring further. For more detailed information, please consult relevant resources or ask me a more specific question.`;
};

// Detect action commands like "open google", "open calculator", etc.
const detectAction = (message) => {
  const lower = message.toLowerCase().trim();
  
  // Check if it's an "open/launch/start [something]" command
  const openMatch = lower.match(/^(open|launch|start|show)\s+(.+)/i);
  if (!openMatch) return null;

  const target = openMatch[2].toLowerCase().trim();

  const actionMap = {
    // Websites
    'google': { type: 'url', url: 'https://www.google.com', label: 'Google' },
    'youtube': { type: 'url', url: 'https://www.youtube.com', label: 'YouTube' },
    'github': { type: 'url', url: 'https://www.github.com', label: 'GitHub' },
    'gmail': { type: 'url', url: 'https://mail.google.com', label: 'Gmail' },
    'facebook': { type: 'url', url: 'https://www.facebook.com', label: 'Facebook' },
    'instagram': { type: 'url', url: 'https://www.instagram.com', label: 'Instagram' },
    'twitter': { type: 'url', url: 'https://www.twitter.com', label: 'Twitter' },
    'linkedin': { type: 'url', url: 'https://www.linkedin.com', label: 'LinkedIn' },
    'whatsapp': { type: 'url', url: 'https://web.whatsapp.com', label: 'WhatsApp Web' },
    'amazon': { type: 'url', url: 'https://www.amazon.com', label: 'Amazon' },
    'stackoverflow': { type: 'url', url: 'https://stackoverflow.com', label: 'Stack Overflow' },
    'netflix': { type: 'url', url: 'https://www.netflix.com', label: 'Netflix' },
    'spotify': { type: 'url', url: 'https://open.spotify.com', label: 'Spotify' },
    'reddit': { type: 'url', url: 'https://www.reddit.com', label: 'Reddit' },
    'maps': { type: 'url', url: 'https://maps.google.com', label: 'Google Maps' },
    'drive': { type: 'url', url: 'https://drive.google.com', label: 'Google Drive' },
    'docs': { type: 'url', url: 'https://docs.google.com', label: 'Google Docs' },

    // Tools & utilities (web-based)
    'calculator': { type: 'url', url: 'https://www.google.com/search?q=calculator', label: 'Calculator' },
    'calendar': { type: 'url', url: 'https://calendar.google.com', label: 'Google Calendar' },
    'translate': { type: 'url', url: 'https://translate.google.com', label: 'Google Translate' },
    'weather': { type: 'url', url: 'https://www.google.com/search?q=weather', label: 'Weather' },
    'news': { type: 'url', url: 'https://news.google.com', label: 'Google News' },
    'camera': { type: 'url', url: 'https://www.google.com/search?q=take+photo+online', label: 'Camera' },
  };

  // Check exact match first
  if (actionMap[target]) return actionMap[target];

  // Check partial match (e.g. "open google chrome" -> match "google")
  for (const [key, value] of Object.entries(actionMap)) {
    if (target.includes(key) || key.includes(target)) {
      return value;
    }
  }

  // Default: treat as web search
  return { type: 'url', url: `https://www.google.com/search?q=${encodeURIComponent(target)}`, label: `Search: ${target}` };
};

module.exports = { getAIResponse, detectAction };
