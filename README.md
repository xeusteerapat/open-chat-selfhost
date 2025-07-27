# OpenChat Self-Host

A comprehensive AI chat application similar to OpenWebUI with multi-provider support, built with Node.js 22 LTS and modern web technologies.

## Features

- **Multi-Provider AI Support**: OpenAI, Anthropic, and OpenRouter integration
- **User Authentication**: JWT-based authentication system
- **Conversation Management**: Create, manage, and organize chat conversations
- **API Key Management**: Securely store and manage provider API keys
- **Real-time Chat Interface**: Modern, responsive chat UI
- **Self-Hosted**: Complete Docker setup for easy deployment

## Tech Stack

### Backend
- Node.js 22 LTS
- Fastify web framework
- PostgreSQL with Drizzle ORM
- JWT authentication
- TypeScript

### Frontend
- React 18 with TypeScript
- Vite build tool
- ShadCN/UI components
- Tailwind CSS
- RTK Query for state management

## Quick Start

### Prerequisites
- Node.js 22 LTS
- pnpm package manager
- Docker and Docker Compose (for containerized deployment)

### Development Setup

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd open-chat-selfhost
   ```

2. **Backend setup:**
   ```bash
   cd backend
   pnpm install
   cp .env.example .env
   # Edit .env with your database and JWT settings
   pnpm run db:generate
   pnpm run db:migrate
   pnpm run dev
   ```

3. **Frontend setup:**
   ```bash
   cd frontend
   pnpm install
   pnpm run dev
   ```

### Docker Deployment

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000

## Configuration

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://openchat:openchat_password@localhost:5432/openchat
JWT_SECRET=your-super-secret-jwt-key
```

**Frontend (.env):**
```env
# No environment variables needed - API calls use relative URLs with proxy
```

## API Proxy Configuration

The frontend uses a proxy setup to avoid path conflicts:

**Development:**
- Frontend API calls: `/backend/*` 
- Vite proxy: `/backend/*` → `http://localhost:3001/api/*`
- Backend endpoints: `/api/*`

**Production (Docker):**
- Nginx proxy: `/backend/*` → `http://backend:3001/api/*`

### API Keys Setup

1. Register/Login to the application
2. Navigate to API Keys management  
3. Add your provider API keys:
   - OpenAI: Get from https://platform.openai.com/api-keys
   - Anthropic: Get from https://console.anthropic.com/
   - OpenRouter: Get from https://openrouter.ai/keys

## Available Scripts

### Backend
- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm start` - Start production server
- `pnpm run db:generate` - Generate database migrations
- `pnpm run db:migrate` - Run database migrations

### Frontend
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build

## API Documentation

The backend provides a comprehensive REST API:

- **Authentication**: `/auth/register`, `/auth/login`
- **Conversations**: `/conversations` (CRUD operations)
- **Messages**: `/conversations/:id/messages`
- **API Keys**: `/api-keys` (CRUD operations)
- **Providers**: `/providers` (list available providers)

## Docker Services

- **database**: PostgreSQL 15
- **backend**: Node.js API server
- **frontend**: Nginx serving React app

## License

MIT License