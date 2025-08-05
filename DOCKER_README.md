# Docker Setup for AI Governance Backend

This guide explains how to dockerize and run the AI Governance Backend application.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

### Production Setup

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Run in background:**
   ```bash
   docker-compose up -d --build
   ```

3. **Stop the services:**
   ```bash
   docker-compose down
   ```

### Development Setup

1. **Build and run development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Run in background:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d --build
   ```

3. **Stop the development services:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Application Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://admin:password123@mongodb:27017/?retryWrites=true&w=majority&appName=Governance-AI&authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Services

### Backend API
- **Port:** 3001
- **Health Check:** `http://localhost:3001/`
- **Container Name:** `governance-backend` (prod) / `governance-backend-dev` (dev)

### MongoDB Database
- **Port:** 27017
- **Database:** governance_db
- **Username:** admin
- **Password:** password123
- **Container Name:** `governance-mongodb` (prod) / `governance-mongodb-dev` (dev)

## Docker Commands

### Build Images
```bash
# Production
docker build -t governance-backend .

# Development
docker build -f Dockerfile.dev -t governance-backend-dev .
```

### Run Individual Containers
```bash
# Backend only (requires MongoDB)
docker run -p 3001:3001 --env-file .env governance-backend

# MongoDB only
docker run -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo:7.0
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs mongodb

# Follow logs
docker-compose logs -f backend
```

### Database Operations
```bash
# Access MongoDB shell
docker exec -it governance-mongodb mongosh -u admin -p password123

# Seed data
docker exec -it governance-backend npm run seed

# Seed users
docker exec -it governance-backend npm run seed:users
```

## Development Features

### Hot Reloading
The development setup includes:
- Volume mounting for live code changes
- Nodemon for automatic restart
- Source code changes reflect immediately

### Database Persistence
- MongoDB data is persisted in Docker volumes
- Data survives container restarts
- Separate volumes for production and development

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3001
   lsof -i :27017
   
   # Stop conflicting services
   docker-compose down
   ```

2. **Database connection issues:**
   ```bash
   # Check if MongoDB is running
   docker ps | grep mongodb
   
   # Check MongoDB logs
   docker-compose logs mongodb
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Build cache issues:**
   ```bash
   # Clean build
   docker-compose build --no-cache
   ```

### Health Checks

The application includes health checks:
- Backend: HTTP GET to `/` endpoint
- MongoDB: Built-in health check

Check health status:
```bash
docker ps
```

## Production Deployment

For production deployment:

1. **Use production Dockerfile:**
   ```bash
   docker build -t governance-backend:prod .
   ```

2. **Set production environment variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-mongodb-uri/?retryWrites=true&w=majority&appName=Governance-AI
   JWT_SECRET=your-production-secret
   ```

3. **Use external MongoDB or managed database service**

4. **Set up reverse proxy (nginx) for SSL termination**

## Security Notes

- The application runs as non-root user
- Database credentials are configurable via environment variables
- Health checks are implemented
- CORS is configurable for production deployment

## Monitoring

Monitor the application:
```bash
# Resource usage
docker stats

# Container logs
docker-compose logs -f

# Health check status
curl http://localhost:3001/
``` 