import express from "express";
import cors from "cors";
import connectDB from "./config.js";
import authRouter from "./routes/auth.js";
import templatesRouter from "./routes/templates.js";
import templateResponsesRouter from "./routes/templateResponses.js";

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/templates', templatesRouter);
app.use('/template-responses', templateResponsesRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Governance AI Backend API', status: 'running' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});