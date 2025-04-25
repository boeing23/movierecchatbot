# MovieGenius - AI Movie Recommendation Agent

A movie recommendation chatbot that uses the Qwen AI model to suggest personalized movie recommendations based on user preferences.

## Live Demo

Visit the live demo at: https://YOUR_GITHUB_USERNAME.github.io/MovieAgent

## Features

- Conversational interface for movie recommendations
- Personalized suggestions based on user preferences
- Chat history with visually distinct messages
- Ability to start new conversations
- Responsive design that works on both desktop and mobile
- Modern black and white theme

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **AI**: Qwen AI model via API

## Deployment Instructions

### Frontend Deployment (GitHub Pages)

1. Fork this repository
2. Clone your forked repository:
   ```bash
   git clone <your-repo-url>
   cd MovieAgent
   ```

3. Install dependencies:
   ```bash
   cd client
   npm install
   ```

4. Update the homepage in `client/package.json`:
   ```json
   {
     "homepage": "https://YOUR_GITHUB_USERNAME.github.io/MovieAgent"
   }
   ```

5. Update the API URL in `client/src/config.js` with your deployed backend URL:
   ```javascript
   apiUrl: 'https://your-backend-url.onrender.com'
   ```

6. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

### Backend Deployment (Render/Heroku)

1. Create a new web service on Render.com or Heroku

2. Configure environment variables:
   - `QWEN_API_KEY`: Your Qwen API key
   - `PORT`: 3001 (or let the platform decide)

3. Deploy the server directory:
   ```bash
   cd server
   git init
   git add .
   git commit -m "Initial backend deployment"
   git remote add render <your-render-git-url>
   git push render main
   ```

## Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MovieAgent
   ```

2. Install dependencies for both server and client:
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the server directory with your Qwen API key
   - Update `client/src/config.js` if needed

4. Start the development servers:
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # In a new terminal, start the frontend
   cd client
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

MIT 