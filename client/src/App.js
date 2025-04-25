import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import './App.css';
import config from './config';

// Components
import ChatMessage from './components/ChatMessage';
import LoadingDots from './components/LoadingDots';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize session ID
  useEffect(() => {
    if (!sessionId) {
      setSessionId(uuidv4());
      
      // Add initial welcome message
      setMessages([{
        id: uuidv4(),
        role: 'assistant',
        content: 'Hi! I\'m MovieGenius, your personal movie recommendation assistant. I\'d love to help you find your next favorite movie. To get started, could you tell me what genres you usually enjoy watching?'
      }]);
    }
  }, [sessionId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (inputValue.trim() === '') return;
    
    // Add user message to chat
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: inputValue
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Send message to server using the configured API URL
      const response = await axios.post(`${config.apiUrl}/api/chat`, {
        message: userMessage.content,
        sessionId: sessionId
      });
      
      // Add assistant's response to chat
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: uuidv4(),
          role: 'assistant',
          content: response.data.response
        }
      ]);
    } catch (error) {
      console.error('Error fetching response:', error);
      
      // Show error message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, I encountered an error while fetching movie recommendations. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await axios.post(`${config.apiUrl}/api/reset`, { sessionId });
      
      // Clear messages and add welcome message
      setMessages([{
        id: uuidv4(),
        role: 'assistant',
        content: 'Let\'s start fresh! What kind of movies do you enjoy watching?'
      }]);
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>MovieGenius</h1>
        <p>Your AI Movie Recommendation Assistant</p>
      </header>
      
      <main className="chat-container">
        <div className="messages">
          {messages.map(message => (
            <ChatMessage 
              key={message.id} 
              role={message.role} 
              content={message.content} 
            />
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-content">
                <LoadingDots />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form className="input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputValue.trim()}>
            Send
          </button>
          <button type="button" onClick={handleReset} className="reset-button">
            New Conversation
          </button>
        </form>
      </main>
      
      <footer className="footer">
        <p>Powered by Qwen AI</p>
      </footer>
    </div>
  );
}

export default App; 