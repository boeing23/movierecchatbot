const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'MovieGenius API',
    version: '1.0.0',
    endpoints: {
      '/': 'API information (this endpoint)',
      '/health': 'Health check endpoint',
      '/api/health': 'API health status',
      '/api/chat': 'POST - Send messages to the movie recommendation agent',
      '/api/reset': 'POST - Reset conversation history'
    }
  });
});

// OpenRouter API configuration
const QWEN_API_KEY = process.env.QWEN_API_KEY;
// Correct API URL for OpenRouter
const QWEN_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Validate API key on startup
if (!QWEN_API_KEY) {
  console.error('Missing OpenRouter API key. Please add QWEN_API_KEY to your environment variables.');
}

console.log('Starting server with API key:', QWEN_API_KEY ? `${QWEN_API_KEY.substring(0, 10)}...` : 'API key is missing');

// Add detailed debug endpoint
app.get('/api/debug', async (req, res) => {
  try {
    console.log('=== DEBUG API KEY INFO ===');
    console.log('API Key exists:', !!QWEN_API_KEY);
    console.log('API Key length:', QWEN_API_KEY ? QWEN_API_KEY.length : 0);
    console.log('API Key prefix:', QWEN_API_KEY ? QWEN_API_KEY.substring(0, 10) : 'N/A');
    console.log('API Key format valid:', QWEN_API_KEY && QWEN_API_KEY.startsWith('sk-or-'));
    
    // Debug payload
    const payload = {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' }
      ],
      temperature: 0.7,
      max_tokens: 800
    };
    
    console.log('Request payload:', JSON.stringify(payload, null, 2));
    console.log('API URL:', QWEN_API_URL);
    
    console.log('Sending test request to OpenRouter API...');
    
    try {
      const response = await axios.post(
        QWEN_API_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QWEN_API_KEY}`,
            'HTTP-Referer': 'https://boeing23.github.io/movierecchatbot',
            'X-Title': 'MovieGenius'
          }
        }
      );
      
      console.log('=== DEBUG API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Headers:', JSON.stringify(response.headers, null, 2));
      console.log('Data:', JSON.stringify(response.data, null, 2));
      
      res.json({
        status: 'success',
        api_key_info: {
          exists: !!QWEN_API_KEY,
          length: QWEN_API_KEY ? QWEN_API_KEY.length : 0,
          prefix: QWEN_API_KEY ? QWEN_API_KEY.substring(0, 10) : 'N/A',
          valid_format: QWEN_API_KEY && QWEN_API_KEY.startsWith('sk-or-')
        },
        request: {
          url: QWEN_API_URL,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QWEN_API_KEY.substring(0, 10)}...`,
            'HTTP-Referer': 'https://boeing23.github.io/movierecchatbot',
            'X-Title': 'MovieGenius'
          },
          payload: payload
        },
        response: {
          status: response.status,
          headers: response.headers,
          data: response.data
        }
      });
    } catch (apiError) {
      console.error('=== DEBUG API ERROR ===');
      console.error('Message:', apiError.message);
      console.error('Status:', apiError.response?.status);
      console.error('Status Text:', apiError.response?.statusText);
      console.error('Data:', JSON.stringify(apiError.response?.data, null, 2));
      console.error('Headers:', JSON.stringify(apiError.response?.headers, null, 2));
      
      res.status(500).json({
        status: 'error',
        api_key_info: {
          exists: !!QWEN_API_KEY,
          length: QWEN_API_KEY ? QWEN_API_KEY.length : 0,
          prefix: QWEN_API_KEY ? QWEN_API_KEY.substring(0, 10) : 'N/A',
          valid_format: QWEN_API_KEY && QWEN_API_KEY.startsWith('sk-or-')
        },
        request: {
          url: QWEN_API_URL,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QWEN_API_KEY.substring(0, 10)}...`,
            'HTTP-Referer': 'https://boeing23.github.io/movierecchatbot',
            'X-Title': 'MovieGenius'
          },
          payload: payload
        },
        error: {
          message: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          headers: apiError.response?.headers
        }
      });
    }
  } catch (error) {
    console.error('General error in debug endpoint:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Add route for API key test endpoint
app.get('/api/test', async (req, res) => {
  try {
    // Log full API key for debugging (BE CAREFUL TO REMOVE THIS IN PRODUCTION)
    console.log('Debug - Full API key:', QWEN_API_KEY);
    
    const authHeader = `Bearer ${QWEN_API_KEY}`;
    console.log('Debug - Auth header:', authHeader);
    
    // Make a simple API test call
    const testResponse = await axios.post(
      QWEN_API_URL,
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello' }
        ],
        temperature: 0.7,
        max_tokens: 800
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'HTTP-Referer': 'https://boeing23.github.io/movierecchatbot',
          'X-Title': 'MovieGenius'
        }
      }
    );
    
    res.json({ 
      status: 'success', 
      message: 'API connection successful',
      response: testResponse.data
    });
  } catch (error) {
    console.error('API Test Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          'Content-Type': error.config?.headers?.['Content-Type'],
          'Authorization': error.config?.headers?.['Authorization'] ? 
            `Bearer ${error.config?.headers?.['Authorization'].substring(7, 15)}...` : 'missing'
        }
      }
    });
    
    res.status(500).json({
      status: 'error',
      error: error.message,
      details: error.response?.data || 'No response data',
      statusCode: error.response?.status || 'No status code'
    });
  }
});

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

// Format assistant responses for better readability
function formatAssistantResponse(content) {
  let formatted = content.trim();

  // Replace numbered movie titles with 🎬 emoji and ensure bold formatting
  formatted = formatted.replace(/(\d+\.\s+\*\*)(.+?)(\*\*\s*\()(\d{4})(\))/g, '🎬 **$2** ($4)');

  // Add emojis and line breaks before known sections
  const sections = [
    { pattern: /Director:/gi, replacement: '\n🎥 **Director:**' },
    { pattern: /Cast:/gi, replacement: '\n👥 **Cast:**' },
    { pattern: /Brief Explanation:/gi, replacement: '\n✨ **Brief Explanation:**' }
  ];
  sections.forEach(({ pattern, replacement }) => {
    formatted = formatted.replace(pattern, replacement);
  });

  // Add line breaks for conclusions
  const conclusions = [
    { pattern: /Would you like/gi, replacement: '\n\n🤔 Would you like' },
    { pattern: /Do you have any/gi, replacement: '\n\n💭 Do you have any' },
    { pattern: /Based on your/gi, replacement: '\n\n🎯 Based on your' }
  ];
  conclusions.forEach(({ pattern, replacement }) => {
    formatted = formatted.replace(pattern, replacement);
  });

  // Greet if it's a hello
  let parts = formatted.split(/(?=🎬)/g); // Better split on 🎬 without losing it
  let introduction = parts[0].trim();
  
  if (introduction.toLowerCase().includes('hello') || introduction.toLowerCase().includes('hi')) {
    introduction = '👋 ' + introduction;
  }

  // Rebuild final message
  formatted = [introduction, ...parts.slice(1).map(m => m.trim())]
    .filter(Boolean)
    .join('\n\n');

  // Final cleanup
  formatted = formatted.replace(/\*\*\s*-\s*\*\*/g, '');
  formatted = formatted.replace(/\n{3,}/g, '\n\n').trim();

  return formatted;
}

// Route to start or continue a conversation
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received chat request:', req.body);
    const { message, sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // Validate API key before making the request
    if (!QWEN_API_KEY) {
      console.error('Missing OpenRouter API key');
      throw new Error('Missing API key configuration');
    }
    
    // Initialize conversation if it doesn't exist
    if (!conversations[sessionId]) {
      conversations[sessionId] = [
        { role: 'system', content: SYSTEM_PROMPT }
      ];
    }
    
    // Add user message to conversation
    conversations[sessionId].push({ role: 'user', content: message });
    
    console.log('Using OpenRouter API Key:', `${QWEN_API_KEY.substring(0, 10)}...`);
    console.log('Sending conversation:', JSON.stringify(conversations[sessionId], null, 2));
    
    try {
      console.log('Attempting to call OpenRouter API...');
      const response = await axios.post(
        QWEN_API_URL,
        {
          model: 'openai/gpt-3.5-turbo', // Using a more reliable model
          messages: conversations[sessionId],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QWEN_API_KEY}`,
            'HTTP-Referer': 'https://boeing23.github.io/movierecchatbot',
            'X-Title': 'MovieGenius'
          }
        }
      );
      
      console.log('OpenRouter API response status:', response.status);
      console.log('OpenRouter API response data:', JSON.stringify(response.data, null, 2));
      
      // Extract and format assistant's response
      const assistantContent = response.data.choices[0].message.content;
      if (!assistantContent) {
        console.error('No content in API response:', response.data);
        throw new Error('No content in API response');
      }
      
      const formattedContent = formatAssistantResponse(assistantContent);
      const assistantMessage = { role: 'assistant', content: formattedContent };
      conversations[sessionId].push(assistantMessage);
      
      res.json({ 
        response: formattedContent,
        sessionId: sessionId
      });
    } catch (apiError) {
      console.error('API Error Details:', {
        message: apiError.message,
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        headers: apiError.response?.headers
      });
      
      // Use fallback response generation with formatting
      const fallbackContent = formatAssistantResponse(getFallbackResponse(message));
      const fallbackMessage = { role: 'assistant', content: fallbackContent };
      conversations[sessionId].push(fallbackMessage);
      
      res.json({
        response: fallbackContent,
        sessionId: sessionId,
        fallback: true,
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('Request handling error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    res.status(500).json({ 
      error: 'Failed to handle the request',
      details: error.message,
      fallback: true
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