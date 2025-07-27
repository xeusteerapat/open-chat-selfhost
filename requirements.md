# AI Chat Application - Agent Prompt Specification

## Project Overview
Create a comprehensive AI chat application similar to OpenWebUI with full Node.js runtime support. The application should be a self-hosted solution that allows users to connect multiple AI providers and manage conversations through a modern web interface.

## Architecture Requirements

### Frontend Stack
- **Framework**: Vite + React 18+ with TypeScript
- **UI Components**: ShadCN/UI for consistent design system
- **State Management**: Redux Toolkit (RTK) with RTK Query for API calls
- **Styling**: Tailwind CSS (integrated with ShadCN)
- **Build Tool**: Vite for fast development and optimized builds

### Backend Stack
- **Server Framework**: Fastify with TypeScript
- **Database**: SQLite with proper migrations
- **ORM/Query Builder**: Consider Drizzle ORM or Prisma for type-safe database operations
- **Authentication**: JWT-based authentication system
- **API Documentation**: Swagger/OpenAPI integration

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for easy deployment
- **Environment**: Support for development, staging, and production environments

## Core Features

### 1. Multi-Provider AI Integration
- Support for multiple AI providers:
  - OpenAI (GPT-3.5, GPT-4, GPT-4 Turbo)
  - Anthropic Claude
  - OpenRouter (multiple models)
  - Extensible architecture for adding new providers
- User-configurable API keys with secure storage
- Provider-specific configuration options (temperature, max tokens, etc.)
- Real-time model availability checking

### 2. Chat Interface
- Modern chat UI with message history
- Streaming responses with real-time updates
- Message formatting with Markdown support
- Code syntax highlighting
- Image upload support (where provider supports it)
- Message search and filtering
- Export conversations (JSON, Markdown)

### 3. Conversation Management
- Multiple conversation threads
- Conversation persistence across sessions
- Conversation sharing capabilities
- Template system for common prompts
- Conversation organization with folders/tags

### 4. User Management
- User registration and authentication
- Profile management
- API key management per user
- Usage analytics and limits
- Admin dashboard for user management

### 5. System Features
- Settings management (themes, language, preferences)
- Real-time notifications
- Error handling and retry mechanisms
- Rate limiting and usage tracking
- Backup and restore functionality

## Technical Specifications

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider VARCHAR(50) NOT NULL,
  key_name VARCHAR(100) NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Conversations table
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Messages table
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSON, -- store provider-specific data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

### API Endpoints Structure
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout

GET /api/users/profile
PUT /api/users/profile
GET /api/users/usage

POST /api/keys
GET /api/keys
PUT /api/keys/:id
DELETE /api/keys/:id

GET /api/conversations
POST /api/conversations
GET /api/conversations/:id
PUT /api/conversations/:id
DELETE /api/conversations/:id

POST /api/chat/stream
POST /api/chat/complete
GET /api/providers
GET /api/providers/:provider/models
```

### Frontend Component Structure
```
src/
├── components/
│   ├── ui/ (ShadCN components)
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── StreamingMessage.tsx
│   ├── conversations/
│   │   ├── ConversationList.tsx
│   │   └── ConversationSettings.tsx
│   ├── providers/
│   │   ├── ProviderConfig.tsx
│   │   └── ApiKeyManager.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Layout.tsx
├── store/
│   ├── index.ts
│   ├── authSlice.ts
│   ├── chatSlice.ts
│   ├── conversationSlice.ts
│   └── api/
│       ├── authApi.ts
│       ├── chatApi.ts
│       └── conversationApi.ts
├── hooks/
├── utils/
├── types/
└── pages/
    ├── Chat.tsx
    ├── Settings.tsx
    ├── Login.tsx
    └── Dashboard.tsx
```

## Implementation Guidelines

### Security Requirements
- Encrypt API keys at rest using AES-256
- Implement proper CORS policies
- Use HTTPS in production
- Sanitize all user inputs
- Implement rate limiting
- Secure JWT token handling
- Environment variable validation

### Performance Considerations
- Implement message pagination for large conversations
- Use WebSocket connections for real-time streaming
- Optimize database queries with proper indexing
- Implement caching strategies (Redis optional)
- Lazy loading for conversation history
- Debounced input handling

### Error Handling
- Global error boundaries in React
- Comprehensive API error responses
- Retry mechanisms for failed requests
- User-friendly error messages
- Logging system for debugging
- Graceful degradation for offline scenarios

### Docker Configuration
```dockerfile
# Multi-stage Dockerfile
FROM node:18-alpine AS builder
# Build both frontend and backend

FROM node:18-alpine AS production
# Production runtime
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

## Development Workflow

### Setup Instructions
1. Clone repository
2. Install dependencies: `npm install`
3. Setup environment variables
4. Run database migrations
5. Start development servers: `npm run dev`

### Environment Variables
```env
# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your-jwt-secret
DATABASE_URL=./data/chat.db

# Encryption
ENCRYPTION_KEY=your-encryption-key

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

### Testing Requirements
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows
- API key encryption/decryption tests

## Deployment Options

### Self-Hosting
- Docker Compose for simple deployment
- Reverse proxy configuration (Nginx/Traefik)
- SSL certificate setup
- Database backup strategies
- Update procedures

### Cloud Deployment
- Container registry support
- Environment-specific configurations
- Health check endpoints
- Monitoring and logging integration
- Scalability considerations

## Additional Features (Nice to Have)
- Plugin system for custom providers
- Conversation templates and presets
- Usage analytics dashboard
- Multi-language support (i18n)
- Voice input/output capabilities
- File attachment support
- Conversation sharing and collaboration
- API access for third-party integrations
- Backup and restore functionality
- Mobile-responsive design
- PWA capabilities

## Success Criteria
- Functional chat interface with multiple AI providers
- Secure API key management
- Persistent conversation history
- Easy self-hosting with Docker
- Responsive and intuitive UI
- Comprehensive error handling
- Production-ready security measures
- Clear documentation and setup guides

## Deliverables
1. Complete source code with TypeScript
2. Docker configuration files
3. Database migration scripts
4. README with setup instructions
5. API documentation
6. Environment configuration examples
7. Basic test suite
8. Production deployment guide