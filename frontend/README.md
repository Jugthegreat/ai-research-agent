# AI Research Agent

An AI-powered research assistant that answers questions by searching the web and synthesizing information from multiple sources.

![AI Research Agent](https://img.shields.io/badge/AI-Research%20Agent-e11d48?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 🌟 Features

- **AI-Powered Research**: Uses Claude AI with web search capabilities to provide accurate, up-to-date answers
- **Real-time Streaming**: Responses stream in real-time for better UX
- **Source Citations**: All answers include clickable source links
- **Thinking Process**: View the AI's reasoning steps for transparency
- **Shareable Chats**: Each conversation has a unique URL for easy sharing
- **Chat History**: All conversations are saved and searchable
- **Dark Mode UI**: Clean, modern interface with smooth animations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Anthropic Claude** - AI model with web search

## 📁 Project Structure

```
ai-research-agent/
├── frontend/                # Next.js frontend
│   ├── app/                 # App router pages
│   │   ├── chat/[id]/       # Dynamic chat pages
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SourceCard.tsx
│   │   └── ThinkingIndicator.tsx
│   └── lib/                 # Utilities
│       └── api.ts           # API client
│
├── backend/                 # FastAPI backend
│   ├── main.py              # Entry point & routes
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database connection
│   └── requirements.txt     # Python dependencies
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL
- Anthropic API key

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/research_agent
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

5. **Create PostgreSQL database**
   ```bash
   createdb research_agent
   ```

6. **Run the backend**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/chats` | Get all chats |
| `POST` | `/chats` | Create new chat |
| `GET` | `/chats/{id}` | Get chat by ID |
| `PUT` | `/chats/{id}` | Update chat title |
| `DELETE` | `/chats/{id}` | Delete chat |
| `DELETE` | `/chats` | Delete all chats |
| `GET` | `/chats/{id}/messages` | Get chat messages |
| `POST` | `/chats/{id}/messages` | Send message (streaming) |

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = your deployed backend URL

### Backend (Railway/Render)

1. Create new project
2. Connect GitHub repository
3. Set environment variables:
   - `DATABASE_URL` = PostgreSQL connection string
   - `ANTHROPIC_API_KEY` = your API key
4. Deploy

## 📝 Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |

### Frontend
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

## 🎥 Demo

[Link to demo video]

## 🔗 Live Demo

- **Frontend**: [https://your-app.vercel.app](https://your-app.vercel.app)
- **Backend**: [https://your-api.railway.app](https://your-api.railway.app)

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own projects.

## 👤 Author

**Jugal Upadhyay**
- GitHub: [@jugthegreat](https://github.com/jugthegreat)
