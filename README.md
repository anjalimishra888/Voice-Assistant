# Luna - AI Voice Assistant

An intelligent AI voice assistant built with the MERN Stack (MongoDB, Express.js, React, Node.js).

## Features

- **Voice Input** (Speech-to-Text) - Speak to Luna using your microphone
- **Text Chat** - Type messages if you prefer not to use voice
- **AI Response Generation** - Intelligent answers using OpenAI API
- **Voice Output** (Text-to-Speech) - Luna reads responses aloud
- **Chat History** - All conversations saved in MongoDB
- **User Authentication** - Register/Login with JWT
- **Responsive UI** - Works on desktop, tablet, and mobile
- **Dark/Light Mode** - Choose your preferred theme
- **Real-Time Chat** - Instant message display
- **Error Handling** - Graceful error handling throughout

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Axios, React Router, React Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **AI**: OpenAI API (with mock responses for development)
- **Voice**: Web Speech API (Speech Recognition + Speech Synthesis)

## Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Install Root Dependencies

```bash
cd Luna
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/luna_db
JWT_SECRET=your_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

> Note: If you don't set an OpenAI API key, Luna will use built-in mock responses.

### 5. Start MongoDB

Make sure MongoDB is running locally or update `MONGODB_URI` in `.env`.

## Running the Application

### Option 1: Run Both (using root package.json)

```bash
cd Luna
npm run dev
```

### Option 2: Run Backend Only

```bash
cd Luna/backend
npm start
```

### Option 3: Run Frontend Only

```bash
cd Luna/frontend
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Chat
- `POST /api/chat/message` - Send message (protected)
- `GET /api/chat/history` - Get chat history (protected)
- `DELETE /api/chat/:id` - Delete specific chat (protected)
- `DELETE /api/chat` - Clear all chats (protected)

### Health
- `GET /api/health` - API health check

