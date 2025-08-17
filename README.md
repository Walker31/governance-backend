# Governance AI Backend

Backend system with Express.js API server and FastAPI AI agent.

## Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- MongoDB
- npm
- pip

## Project Structure

```
Backend/
├── Agent-RakFort/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── chat_agent.py
│   │   ├── risk_matrix_agent.py
│   │   ├── utils.py
│   │   └── waste/
│   │       ├── ask_agent.py
│   │       ├── chat_agent.py
│   │       └── collect_agent.py
│   ├── main.py
│   ├── requirements.txt
│   ├── run_intake.sh
│   ├── predefined_risks.xlsx
│   └── saved_sessions/
├── config.js
├── DB_schema_templates.sql
├── DB_schema.sql
├── middleware/
│   └── auth.js
├── models/
│   ├── Template.js
│   ├── TemplateResponse.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── templateResponses.js
│   └── templates.js
├── seedData.js
├── seedUsers.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

- **Agent-RakFort/**: Python FastAPI AI agent and related scripts
  - **agents/**: Python agent modules and utilities
  - **waste/**: Specialized agent scripts for waste management
  - **saved_sessions/**: Stores session data (not tracked by git)
- **middleware/**: Express.js middleware (e.g., authentication)
- **models/**: Mongoose data models
- **routes/**: Express.js API route handlers
- **DB_schema.sql**: Main database schema
- **DB_schema_templates.sql**: Template database schema
- **server.js**: Express.js server entry point
- **seedData.js, seedUsers.js**: Database seeding scripts
- **config.js**: Configuration file

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
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/?retryWrites=true&w=majority&appName=Governance-AI
   JWT_SECRET=your_jwt_secret_key_here
   AGENT_URL=http://localhost:8000
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