# Spur – AI Live Chat Support Agent

A full-stack AI support agent application built for the Spur founding engineer take-home assignment. This application simulates a customer support chat where an AI agent answers user questions using OpenAI's LLM.

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **LLM**: OpenAI (gpt-4o-mini)
- **Other**: CORS, dotenv for environment management

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher) installed and running
- **OpenAI API Key** - Get one from [OpenAI Dashboard](https://platform.openai.com/api-keys)

## 🛠️ Setup & Installation

### 1. Clone and Navigate
```bash
cd /Users/klipit/Documents/self/spur
```

### 2. Database Setup

Create a PostgreSQL database:
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE spur_chat;

# Exit psql
\q
```

The application will automatically create the necessary tables (`sessions` and `messages`) on startup.

### 3. Backend Setup

```bash
cd backend

# Install dependencies (already done)
npm install

# Configure environment variables
# Edit the .env file and add your credentials:
```

Update `backend/.env`:
```env
PORT=3000
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/spur_chat
OPENAI_API_KEY=your_openai_api_key_here
```

**Important**: Replace `YOUR_USERNAME`, `YOUR_PASSWORD`, and `your_openai_api_key_here` with your actual credentials.

```bash
# Run the backend server
npm run dev
```

The backend will start on `http://localhost:3000`

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies (already done)
npm install

# Run the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🎯 Usage

1. Open your browser and navigate to `http://localhost:5173`
2. You'll see the SpurStore Support chat interface
3. Type a message and press Enter or click the Send button
4. The AI agent will respond based on the store's knowledge base

### Example Questions to Try:
- "What's your shipping policy?"
- "Do you ship internationally?"
- "How do I return an item?"
- "What are your support hours?"
- "Can I get a refund?"

## 🏗️ Architecture Overview

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   └── db.ts              # PostgreSQL connection pool
│   ├── controllers/
│   │   └── chatController.ts  # Message handling logic
│   ├── models/
│   │   └── schema.ts          # Database schema initialization
│   ├── routes/
│   │   └── chatRoutes.ts      # API route definitions
│   ├── services/
│   │   └── llmService.ts      # OpenAI LLM integration
│   └── index.ts               # Application entry point
├── .env                        # Environment variables
├── package.json
└── tsconfig.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   ├── ChatMessage.tsx    # Individual message component
│   │   ├── ChatWidget.tsx     # Main chat interface
│   │   └── TypingIndicator.tsx # Loading animation
│   ├── services/
│   │   └── chatService.ts     # API client
│   ├── types/
│   │   └── chat.ts            # TypeScript type definitions
│   ├── App.tsx
│   └── index.css              # Tailwind styles
├── .env                        # Environment variables
├── package.json
└── vite.config.ts
```

### API Endpoints

#### POST `/chat/message`
Send a message and receive an AI response.

**Request:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "reply": "Our return policy allows...",
  "sessionId": "uuid-session-id"
}
```

#### GET `/chat/history/:sessionId`
Retrieve conversation history for a session.

**Response:**
```json
{
  "messages": [
    {
      "id": "1",
      "sender": "user",
      "text": "Hello",
      "timestamp": "2025-12-29T18:00:00.000Z"
    },
    {
      "id": "2",
      "sender": "ai",
      "text": "Hi! How can I help?",
      "timestamp": "2025-12-29T18:00:01.000Z"
    }
  ]
}
```

## 🤖 LLM Integration

### Provider: OpenAI
- **Model**: `gpt-4o-mini`
- **Max Tokens**: 500 (configurable)

### Prompt Design
The system uses a carefully crafted system prompt that:
- Defines the AI's role as a SpurStore support agent
- Includes knowledge about shipping, returns, and support hours
- Maintains conversation context through chat history
- Ensures polite and professional responses

### Context Management
- Conversation history is passed to the LLM with each request
- Previous messages are mapped to OpenAI's expected format (`user`/`assistant` roles)
- The system prompt is prepended to establish the agent's persona

### Error Handling
- **API Failures**: Gracefully caught and returned as user-friendly error messages
- **Rate Limits**: Handled with appropriate error responses (OpenAI 429)
- **Invalid API Keys**: Detected and reported clearly
- **Network Issues**: Timeout handling with fallback messages

## 🛡️ Robustness & Validation

### Input Validation
- ✅ Empty messages are rejected
- ✅ Messages over 2000 characters are rejected with a warning
- ✅ Whitespace-only messages are trimmed and validated

### Error Handling
- ✅ Database connection errors are caught and logged
- ✅ LLM API failures don't crash the server
- ✅ Invalid session IDs are handled gracefully
- ✅ Network errors display user-friendly messages in the UI

### UX Features
- ✅ Typing indicator while AI is generating response
- ✅ Auto-scroll to latest message
- ✅ Session persistence via localStorage
- ✅ Disabled send button during loading
- ✅ Error messages displayed inline
- ✅ Keyboard shortcuts (Enter to send, Shift+Enter for new line)

## 🎨 Design Decisions

### Why These Choices?

1. **PostgreSQL over SQLite**: Better for production scalability, though SQLite would work for this demo
2. **Raw SQL vs ORM**: Kept it simple for the assignment; Prisma would be better for larger apps
3. **Session Management**: Used localStorage for simplicity; production would use proper auth
4. **OpenAI over Gemini**: Using OpenAI for robust and fast response generation
5. **Shadcn UI**: Modern, accessible components that are easy to customize
6. **Vite over CRA**: Faster dev experience and better build performance

### Database Schema
- **sessions**: Minimal table to track conversations
- **messages**: Stores all user and AI messages with timestamps
- **Relationship**: One-to-many (session → messages) with CASCADE delete

### State Management
- Used React's built-in `useState` and `useEffect` hooks
- No Redux/Zustand needed for this simple use case
- Session ID stored in localStorage for persistence

## 🚧 Trade-offs & Future Improvements

### What I Would Add With More Time

#### Backend
- [ ] **Authentication**: JWT-based user authentication
- [ ] **Rate Limiting**: Prevent abuse with express-rate-limit
- [ ] **Caching**: Redis for frequently asked questions
- [ ] **Logging**: Structured logging with Winston or Pino
- [ ] **Testing**: Unit tests with Jest, integration tests with Supertest
- [ ] **Validation**: Zod or Joi for request validation
- [ ] **Database Migrations**: Proper migration system (e.g., node-pg-migrate)
- [ ] **Monitoring**: Error tracking with Sentry
- [ ] **WebSockets**: Real-time updates instead of polling

#### Frontend
- [ ] **Error Boundaries**: React error boundaries for graceful failures
- [ ] **Testing**: Vitest for unit tests, Playwright for E2E
- [ ] **Accessibility**: ARIA labels, keyboard navigation improvements
- [ ] **Internationalization**: i18n support for multiple languages
- [ ] **Offline Support**: Service worker for offline functionality
- [ ] **Message Formatting**: Markdown support for rich text
- [ ] **File Uploads**: Allow users to send images/documents
- [ ] **Voice Input**: Speech-to-text integration

#### LLM
- [ ] **Streaming Responses**: Stream tokens as they're generated
- [ ] **Function Calling**: Allow AI to trigger actions (e.g., create tickets)
- [ ] **RAG Integration**: Vector database for dynamic knowledge retrieval
- [ ] **Multi-turn Context**: Better conversation memory management
- [ ] **Fallback Models**: Switch to backup LLM if primary fails

### Known Limitations
- No authentication/authorization
- Session IDs are stored in localStorage (not secure)
- No message edit/delete functionality
- No admin panel to view conversations
- Limited error recovery options
- No conversation export feature

## 📦 Deployment

### Backend Deployment (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables in dashboard
4. Deploy!

### Frontend Deployment (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set `VITE_API_URL` to your backend URL
4. Deploy!

### Environment Variables for Production
```env
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/dbname
OPENAI_API_KEY=your_production_key
PORT=3000

# Frontend
VITE_API_URL=https://your-backend-url.com
```

## 🧪 Testing the Application

### Manual Testing Checklist
- [ ] Send a normal message and receive a response
- [ ] Try empty message (should be rejected)
- [ ] Try very long message (should be rejected)
- [ ] Refresh page and verify history loads
- [ ] Test with invalid session ID
- [ ] Disconnect backend and verify error handling
- [ ] Test keyboard shortcuts (Enter, Shift+Enter)
- [ ] Verify typing indicator appears
- [ ] Check auto-scroll functionality

## 📝 Notes

- The AI agent has knowledge about a fictional "SpurStore" e-commerce store
- Conversation history is maintained per session
- Sessions persist across page refreshes via localStorage
- The UI is fully responsive and works on mobile devices

## 🙏 Acknowledgments

Built as part of the Spur founding engineer take-home assignment. This project demonstrates:
- Full-stack TypeScript development
- LLM integration and prompt engineering
- Database design and management
- Modern React patterns and best practices
- Error handling and user experience design

---

**Author**: Built for Spur Take-Home Assignment  
**Date**: December 2025  
**Time Spent**: ~8 hours
