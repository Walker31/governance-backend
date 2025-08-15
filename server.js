import express from "express";
import cors from "cors";
import connectDB from "./config.js";
import { requestLogger, errorLogger } from "./middleware/logger.js";
import authRouter from "./routes/auth.js";
import templatesRouter from "./routes/templates.js";
import templateResponsesRouter from "./routes/templateResponses.js";
import riskMatrixRisksRouter from "./routes/riskMatrixRisks.js";
import questionnaireRouter from "./routes/questionnaire.js";
import projectRouter from './routes/projects.js';
import elementRouter from './routes/dataElements.js';
import thirdPartyRouter from './routes/thirdparty.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/auth', authRouter);
app.use('/templates', templatesRouter);
app.use('/template-responses', templateResponsesRouter);
app.use('/risk-matrix-risks', riskMatrixRisksRouter);
app.use('/questionnaire', questionnaireRouter);
app.use('/projects', projectRouter);
app.use('/elements', elementRouter);
app.use('/thirdparty', thirdPartyRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Governance AI Backend API', status: 'running' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling middleware (should be last)
app.use(errorLogger);