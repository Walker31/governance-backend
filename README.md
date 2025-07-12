# Governance AI Backend

Backend system with Express.js API server and FastAPI AI agent.

## Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- MongoDB
- npm
- pip

## Installation

### Express.js API Server

1. Navigate to backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/governance_ai
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

### FastAPI AI Agent

1. Navigate to Agent-RakFort directory:
   ```bash
   cd Backend/Agent-RakFort
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   # Windows: venv\Scripts\activate
   # macOS/Linux: source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Commands

### Express.js API
```bash
npm run dev          # Development server
npm run seed         # Seed database
npm run seed:users   # Seed users
```

### FastAPI Agent
```bash
python -m uvicorn main:app --reload --port 8000  # Development
python -m uvicorn main:app --host 0.0.0.0 --port 8000  # Production
```

## Running

### Individual Services
```bash
# Express.js API
cd Backend && npm run dev

# FastAPI Agent (new terminal)
cd Backend/Agent-RakFort && python -m uvicorn main:app --reload --port 8000
```

### All Services (from project root)
```bash
./run-all-dev.sh
``` 