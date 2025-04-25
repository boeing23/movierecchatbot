const config = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://movierecchatbot-production.up.railway.app'
    : 'http://localhost:3001'
};

export default config; 