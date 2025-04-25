const config = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://your-backend-url.onrender.com' // You'll replace this with your actual deployed backend URL
    : 'http://localhost:3001'
};

export default config; 