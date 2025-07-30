# Risk Matrix Database Integration

This document describes the integration between the AI risk matrix agent and the MongoDB database for storing risk analysis results.

## Overview

The risk matrix agent now automatically stores analysis results in the database, providing persistent storage and retrieval capabilities for AI governance assessments.

## New Components

### 1. Database Model (`models/RiskMatrixResult.js`)

```javascript
{
  projectId: ObjectId,        // Reference to project
  sessionId: String,          // Unique session identifier
  summary: String,            // Original assessment summary
  markdownTable: String,      // Generated risk matrix table
  riskData: Object,           // Additional risk metadata
  createdBy: ObjectId,        // User who created the assessment
  createdAt: Date,            // Creation timestamp
  updatedAt: Date,            // Last update timestamp
  isActive: Boolean           // Soft delete flag
}
```

### 2. API Routes (`routes/riskMatrixResults.js`)

#### Endpoints:
- `GET /risk-matrix-results/project/:projectId` - Get all results for a project
- `GET /risk-matrix-results/:id` - Get result by ID
- `POST /risk-matrix-results` - Create new result
- `PUT /risk-matrix-results/:id` - Update existing result
- `DELETE /risk-matrix-results/:id` - Soft delete result
- `GET /risk-matrix-results/session/:sessionId` - Get result by session ID

### 3. Updated Agent (`Agent-RakFort/agents/risk_matrix_agent.py`)

The risk matrix agent now:
- Accepts `session_id` and optional `project_id` parameters
- Automatically stores results in the database
- Returns storage status in the response

## Usage

### 1. Start the Backend Server

```bash
cd ai-governance-backend
npm install
npm start
```

### 2. Start the Agent Service

```bash
cd Agent-RakFort
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Call the Risk Matrix Agent

```bash
curl -X POST "http://localhost:8000/agent/risk-matrix" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "AI system for customer data analysis",
    "session_id": "unique-session-id",
    "project_id": "507f1f77bcf86cd799439011"
  }'
```

### 4. Retrieve Results from Database

```bash
# Get by session ID
curl "http://localhost:3001/risk-matrix-results/session/unique-session-id"

# Get by project ID
curl "http://localhost:3001/risk-matrix-results/project/507f1f77bcf86cd799439011"
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/governance_db
JWT_SECRET=your-jwt-secret
```

### Agent (.env)
```
OPENAI_API_KEY=your-openai-api-key
BACKEND_URL=http://localhost:3001
```

## API Response Format

### Agent Response
```json
{
  "markdown_table": "| Risk | Owner | Severity | ...",
  "session_id": "unique-session-id",
  "stored_in_db": true
}
```

### Database Response
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "projectId": "507f1f77bcf86cd799439011",
  "sessionId": "unique-session-id",
  "summary": "AI system for customer data analysis",
  "markdownTable": "| Risk | Owner | Severity | ...",
  "riskData": {
    "risk_list": [...],
    "base_severity": {...},
    "mitigation": {...},
    "target_date": {...}
  },
  "createdBy": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "isActive": true
}
```

## Testing

Run the integration test to verify everything works:

```bash
python test_risk_matrix_integration.py
```

## Error Handling

- **Database Connection**: If the backend is unavailable, the agent will still return results but `stored_in_db` will be `false`
- **Duplicate Sessions**: The API prevents duplicate session IDs
- **Authentication**: All database operations require valid JWT tokens
- **Validation**: Input validation ensures required fields are provided

## Security

- All database routes require authentication
- Admin-only operations for deletion
- Input validation and sanitization
- Soft delete functionality to preserve audit trails

## Performance

- Database indexes on `projectId`, `sessionId`, and `createdAt`
- Lean queries for read operations
- Timeout handling for external API calls
- Efficient pagination support

## Future Enhancements

1. **Bulk Operations**: Support for bulk risk matrix analysis
2. **Export Functionality**: PDF/Excel export of risk matrices
3. **Versioning**: Track changes to risk assessments over time
4. **Notifications**: Alert stakeholders when risk levels change
5. **Analytics**: Dashboard for risk trend analysis 