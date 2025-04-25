const config = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://movierecchatbot-backend.onrender.com'
    : 'http://localhost:3001'
};

export default config; 