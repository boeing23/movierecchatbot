import React from 'react';
import './ChatMessage.css';

function ChatMessage({ role, content }) {
  // Function to parse movie details from the recommendation text
  const parseMovieDetails = (text) => {
    const movieMatch = text.match(/\*\*(.*?)\*\*\s*\((\d{4})\)\s*-\s*(?:Directed by\s*)?(.*?)(?:,\s*starring\s*|\s*with\s*)(.*)/);
    if (movieMatch) {
      return {
        title: movieMatch[1],
        year: movieMatch[2],
        director: movieMatch[3],
        cast: movieMatch[4]
      };
    }
    return null;
  };

  // Function to render content with movie recommendations highlighted
  const renderContent = () => {
    if (!content) return null;
    
    // Check if this appears to be a movie recommendation
    if (role === 'assistant' && (content.includes('recommend') || content.includes('movie'))) {
      const lines = content.split('\n');
      const renderedContent = [];
      let currentText = '';

      lines.forEach((line, index) => {
        if (line.trim() === '') return;

        const movieDetails = parseMovieDetails(line);
        if (movieDetails) {
          // If there's accumulated text, add it first
          if (currentText.trim()) {
            renderedContent.push(
              <p key={`text-${index}`} className="recommendation-text">
                {currentText}
              </p>
            );
            currentText = '';
          }

          // Add the movie recommendation card
          renderedContent.push(
            <div key={`movie-${index}`} className="movie-recommendation">
              <div className="movie-title">
                {movieDetails.title} ({movieDetails.year})
              </div>
              <div className="movie-details">
                Directed by {movieDetails.director}
              </div>
              <div className="movie-separator" />
              <div className="movie-cast">
                Starring: {movieDetails.cast}
              </div>
            </div>
          );
        } else {
          // Accumulate regular text
          currentText += line + '\n';
        }
      });

      // Add any remaining text
      if (currentText.trim()) {
        renderedContent.push(
          <p key="remaining-text" className="recommendation-text">
            {currentText}
          </p>
        );
      }

      return renderedContent;
    }
    
    // For regular messages, just return the content as string
    return <p>{content}</p>;
  };

  return (
    <div className={`message ${role}`}>
      <div className="avatar">
        {role === 'assistant' ? '🎬' : '👤'}
      </div>
      <div className="message-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default ChatMessage; 