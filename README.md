# ft_transcendence

A modern, real-time multiplayer Pong game built with microservices architecture and full monitoring capabilities.

## 🏓 About

ft_transcendence is a comprehensive web application that recreates the classic Pong game with modern web technologies. The project features a microservices architecture with real-time gameplay, user management, matchmaking, and comprehensive monitoring.

## ✨ Features

### Core Gameplay
- **Real-time multiplayer Pong** with WebSocket communication
- **Local and online game modes**
- **Tournament system** with bracket management
- **Responsive game controls** with smooth paddle movement

### User Management
- **Google OAuth integration** for secure authentication
- **User profiles** with customizable avatars
- **Friend system** for social interactions
- **Game history** and statistics tracking

### Technical Features
- **Microservices architecture** with independent services
- **Real-time communication** via WebSockets
- **Multi-language support** (English, Spanish, French)
- **Comprehensive monitoring** with Prometheus and Grafana
- **Containerized deployment** with Docker

## 🏗️ Architecture

### Services
- **User Service** (Port 4001): User authentication, profiles, and friend management
- **Game Service** (Port 4002): Game logic and real-time gameplay
- **Matchmaking Service** (Port 4003): Queue management and tournament organization
- **Frontend**: TypeScript/Vite-based SPA with Tailwind CSS
- **Caddy**: Reverse proxy and load balancer
- **Monitoring Stack**: Prometheus, Grafana, and Node Exporter

### Technology Stack

#### Frontend
- **TypeScript** with Vite build tool
- **Tailwind CSS** for styling
- **WebSockets** for real-time communication
- **i18next** for internationalization
- **Chart.js** for data visualization

#### Backend
- **Node.js** with Fastify framework
- **TypeScript** for type safety
- **SQLite** databases with better-sqlite3
- **WebSocket** support for real-time features
- **JWT** authentication with OAuth2

#### Infrastructure
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Caddy** as reverse proxy
- **Prometheus** for metrics collection
- **Grafana** for monitoring dashboards

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/itsfwenk/ft_transcendence.git
   cd ft_transcendence
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and run the application**
   ```bash
   make
   ```

   Or manually:
   ```bash
   # Build frontend
   cp .env frontend/.env
   cd frontend/ && npm install && npm run build && cd ..

   # Start all services
   docker compose up --build
   ```

### Accessing the Application

- **Main Application**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/password from env)

## 🎮 How to Play

1. **Create an account** or sign in with Google
2. **Choose a game mode**:
   - Local: Play against a friend on the same device
   - Online: Join the matchmaking queue
   - Tournament: Participate in competitive brackets
3. **Controls**:
   - Player 1: W/S keys for up/down
   - Player 2: Arrow keys for up/down
4. **Win condition**: First to reach the score limit wins!

## 📊 Monitoring

The application includes comprehensive monitoring:

- **Application Metrics**: API response times, request counts, error rates
- **System Metrics**: CPU, memory, and disk usage
- **Custom Dashboards**: Game statistics, user activity, service health

Access Grafana at http://localhost:3000 to view real-time dashboards.

## 🛠️ Development

### Project Structure
```
├── backend/                 # Backend services
│   ├── services/
│   │   ├── user/           # User management service
│   │   ├── game/           # Game logic service
│   │   └── matchmaking/    # Matchmaking service
│   └── caddy/              # Reverse proxy configuration
├── frontend/               # Frontend application
│   ├── srcs/              # Source code
│   ├── public/            # Static assets
│   └── components/        # Reusable components
├── monitoring/            # Monitoring stack
│   ├── grafana/          # Grafana configuration
│   └── prometheus/       # Prometheus configuration
└── docker-compose.yml    # Service orchestration
```

### Available Make Commands
```bash
make          # Build and start production environment
make up       # Start services
make down     # Stop and remove containers
make stop     # Stop services
make start    # Start existing containers
make build    # Build all services
```

### Local Development

For frontend development:
```bash
cd frontend
npm install
npm run dev
```

For backend service development:
```bash
cd backend/services/[service-name]
npm install
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables (.env template)

```bash
# Base URLs
GATEWAY_BASE_URL=
USER_SERVICE_BASE_URL=
GAME_SERVICE_BASE_URL=
MATCHMAKING_SERVICE_BASE_URL=
NGXIN_PORT=
HOST_PORT=

# Service Ports
GATEWAY_SERVICE_PORT=
USER_SERVICE_PORT=4001
GAME_SERVICE_PORT=4002
MATCHMAKING_SERVICE_PORT=4003

# Game Configuration
PADDLE_WIDTH=
PADDLE_HEIGHT=
PADDLE_SPEED=
CANVAS_WIDTH=
CANVAS_HEIGHT=
BALL_RADIUS=
BALL_SPEED=
SPEED_INCREASE=

# Frontend Game Configuration
VITE_PADDLE_WIDTH=
VITE_PADDLE_HEIGHT=
VITE_PADDLE_SPEED=
VITE_CANVAS_WIDTH=
VITE_CANVAS_HEIGHT=
VITE_BALL_RADIUS=
VITE_SPEED_INCREASE=

# Frontend Configuration
FRONTEND_TARGET=
FRONTEND_PORT=
FRONTEND_VOLUMES=
FRONTEND_WORKDIR=

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Security
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret

# Game Timing
VITE_1V1_LAUNCH_DELAY=
VITE_TOURNAMENT_LAUNCH_DELAY=
VITE_GAME_LAUNCH_DELAY=

# Monitoring
GRAFANA_PWD=your_grafana_password
ENABLE_METRICS=true
```

### Database Configuration
Each service uses SQLite for data persistence:
- User data: user profiles, authentication, friends
- Game data: game sessions, results, statistics
- Matchmaking data: queues, tournaments, brackets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is part of the 42 School curriculum.

## 🙏 Acknowledgments

- 42 School for the project framework
- The classic Pong game that inspired this implementation
- The open-source community for the amazing tools and libraries used

---

**Happy gaming! 🏓**
