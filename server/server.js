const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Qwen API configuration
const QWEN_API_KEY = process.env.QWEN_API_KEY;
// Correct API URL for Qwen via Alibaba Cloud DashScope
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

console.log('Starting server with API key:', QWEN_API_KEY ? 'API key is set' : 'API key is missing');

// Add route for a simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Initial system prompt for the movie recommendation agent
const SYSTEM_PROMPT = `You are MovieGenius, an AI movie recommendation agent. 
Ask the user questions about their preferences like:
1. Favorite movie genres
2. Movies they've enjoyed recently
3. Actors or directors they like
4. Mood they're in today
5. Any specific themes they're interested in

Based on their answers, recommend 3-5 movies with a brief explanation of why you think they'd enjoy each one.
Include movie title, year, director, and main cast for each recommendation.`;

// Fallback responses if API fails
const fallbackResponses = {
  greeting: "Hello! I'm MovieGenius, your movie recommendation assistant. What kind of movies do you enjoy watching?",
  genre: "Great! Based on your preference for ACTION movies, I'd recommend:\n\n1. **John Wick** (2014) - Directed by Chad Stahelski, starring Keanu Reeves and Willem Dafoe\n\n2. **Mad Max: Fury Road** (2015) - Directed by George Miller, starring Tom Hardy and Charlize Theron\n\n3. **The Raid** (2011) - Directed by Gareth Evans, starring Iko Uwais and Joe Taslim\n\nWould you like recommendations for any other genres?",
  director: "If you like Christopher Nolan films, you might enjoy:\n\n1. **Inception** (2010) - Starring Leonardo DiCaprio, Joseph Gordon-Levitt, and Ellen Page\n\n2. **Interstellar** (2014) - Starring Matthew McConaughey, Anne Hathaway, and Jessica Chastain\n\n3. **The Prestige** (2006) - Starring Hugh Jackman, Christian Bale, and Scarlett Johansson\n\nDo any of these interest you?",
  actor: "For fans of Tom Hanks, I recommend:\n\n1. **Forrest Gump** (1994) - Directed by Robert Zemeckis, also starring Robin Wright and Gary Sinise\n\n2. **Saving Private Ryan** (1998) - Directed by Steven Spielberg, with Matt Damon and Tom Sizemore\n\n3. **Cast Away** (2000) - Directed by Robert Zemeckis, with Helen Hunt\n\nWould you like more recommendations?",
  general: "Based on your preferences, I think you might enjoy these movies:\n\n1. **Everything Everywhere All at Once** (2022) - Directed by Daniels, starring Michelle Yeoh and Ke Huy Quan\n\n2. **Parasite** (2019) - Directed by Bong Joon-ho, starring Song Kang-ho and Lee Sun-kyun\n\n3. **The Shawshank Redemption** (1994) - Directed by Frank Darabont, starring Tim Robbins and Morgan Freeman\n\nDo any of these catch your interest?"
};

// Store conversation history
const conversations = {};

// Simple function to get a fallback response based on user message
function getFallbackResponse(message) {
  message = message.toLowerCase();
  
  if (message.length < 5 || message.includes('hello') || message.includes('hi ')) {
    return fallbackResponses.greeting;
  } else if (message.includes('action') || message.includes('thriller') || message.includes('adventure')) {
    return fallbackResponses.genre;
  } else if (message.includes('nolan') || message.includes('spielberg') || message.includes('director')) {
    return fallbackResponses.director;
  } else if (message.includes('hanks') || message.includes('actor') || message.includes('actress')) {
    return fallbackResponses.actor;
  } else {
    return fallbackResponses.general;
  }
}

// Route to start or continue a conversation
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received chat request:', req.body);
    const { message, sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // Initialize conversation if it doesn't exist
    if (!conversations[sessionId]) {
      conversations[sessionId] = [
        { role: 'system', content: SYSTEM_PROMPT }
      ];
    }
    
    // Add user message to conversation
    conversations[sessionId].push({ role: 'user', content: message });
    
    console.log('Sending request to Qwen API with messages:', conversations[sessionId]);
    
    try {
      // Call Qwen API with correct format for DashScope API
      const response = await axios.post(
        QWEN_API_URL,
        {
          model: 'qwen-max',
          input: {
            messages: conversations[sessionId]
          },
          parameters: {
            temperature: 0.7,
            max_tokens: 800
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QWEN_API_KEY}`
          }
        }
      );
      
      console.log('Received response from Qwen API:', response.data);
      
      // Extract assistant's response - DashScope API has a different response format
      const assistantContent = response.data.output.text || response.data.output.message?.content;
      const assistantMessage = { role: 'assistant', content: assistantContent };
      
      // Add assistant message to conversation history
      conversations[sessionId].push(assistantMessage);
      
      // Return assistant's response
      res.json({ 
        response: assistantMessage.content,
        sessionId: sessionId
      });
    } catch (apiError) {
      console.error('API Error:', apiError);
      console.error('Falling back to local response generation');
      
      // Use fallback response generation
      const fallbackContent = getFallbackResponse(message);
      const fallbackMessage = { role: 'assistant', content: fallbackContent };
      
      // Add fallback message to conversation history
      conversations[sessionId].push(fallbackMessage);
      
      // Return fallback response
      res.json({
        response: fallbackContent,
        sessionId: sessionId,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error in request handling:', error);
    console.error('Error details:', error.response?.data || error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to handle the request',
      details: error.response?.data || error.message
    });
  }
});

// Route to reset conversation
app.post('/api/reset', (req, res) => {
  const { sessionId } = req.body;
  
  if (sessionId && conversations[sessionId]) {
    conversations[sessionId] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    res.json({ message: 'Conversation reset successfully' });
  } else {
    res.status(400).json({ error: 'Invalid session ID' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 