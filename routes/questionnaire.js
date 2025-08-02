import express from 'express';
import RiskMatrixResult from '../models/RiskMatrixResult.js';
import Question from '../models/Question.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { nanoid } from 'nanoid';
import axios from 'axios';

const router = express.Router();

// Helper function to generate summary from questionnaire responses
function generateSummaryFromResponses(responses, useCaseType) {
  const questions = [
    "Name and country",
    "Project type (in-house vs third-party)",
    "Geographic regions",
    "AI system objective",
    "General-purpose model",
    "Learning model",
    "Regulatory review",
    "Human oversight",
    "Affected groups",
    "Project timeline",
    "Potential delays"
  ];
  
  let summary = `AI System Type: ${useCaseType === 'human' ? 'Human-operated' : 'Automated AI Bot'}\n\n`;
  
  Object.keys(responses).forEach((questionId, index) => {
    const question = questions[index] || `Question ${questionId}`;
    const response = responses[questionId];
    
    if (response) {
      if (typeof response === 'object' && response.name && response.country) {
        summary += `${question}: ${response.name} from ${response.country}\n`;
      } else if (Array.isArray(response)) {
        summary += `${question}: ${response.join(', ')}\n`;
      } else {
        summary += `${question}: ${response}\n`;
      }
    }
  });
  
  return summary;
}

// Process questionnaire responses and generate risk analysis
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { 
      questionnaireResponses,
      projectId,
      useCaseType = 'human' // 'human' or 'bot'
    } = req.body;
    
    const createdBy = req.user._id;
    const sessionId = nanoid(); // Generate unique session ID
    
    // Validate required fields
    if (!questionnaireResponses) {
      return res.status(400).json({ 
        error: 'Missing required field: questionnaireResponses' 
      });
    }
    
    // Check if session already exists
    const existingResult = await RiskMatrixResult.findOne({ sessionId });
    if (existingResult) {
      return res.status(400).json({ error: 'Session already exists' });
    }
    
    // Call AI agent to generate risk analysis
    const agentUrl = process.env.AGENT_URL || 'http://localhost:8000';
    
    try {
      // Convert questionnaire responses to a summary for the AI agent
      const summary = generateSummaryFromResponses(questionnaireResponses, useCaseType);
      
      // Call the risk matrix agent
      const agentResponse = await axios.post(`${agentUrl}/agent/risk-matrix`, {
        summary: summary,
        session_id: sessionId,
        project_id: projectId || null
      }, {
        timeout: 30000 // 30 second timeout
      });
      
      const { markdown_table: markdownTable, stored_in_db } = agentResponse.data;
      
      // If the agent didn't store in DB, we need to store it ourselves
      if (!stored_in_db) {
        const riskData = {
          useCaseType,
          questionnaireResponses,
          analysisDate: new Date(),
          riskLevel: 'Medium', // This could be extracted from the markdown table
          categories: ['Technical', 'Compliance', 'Operational']
        };
        
        // Create a temporary project document or use empty string for projectId
        const riskMatrixResult = new RiskMatrixResult({
          projectId: projectId || '', // Use provided projectId or empty string
          sessionId,
          summary,
          markdownTable,
          riskData,
          createdBy
        });
        
        const savedResult = await riskMatrixResult.save();
        await savedResult.populate('createdBy', 'name surname email');
        
        res.status(201).json({
          message: 'Questionnaire processed successfully',
          sessionId,
          riskMatrixResult: savedResult
        });
      } else {
        // Agent already stored in DB, just return success
        res.status(201).json({
          message: 'Questionnaire processed successfully',
          sessionId,
          stored_in_db: true
        });
      }
      
    } catch (error) {
      console.error('Error calling AI agent:', error);
      
      // Fallback to placeholder response if agent fails
      const summary = `Risk analysis generated for ${useCaseType} AI system based on questionnaire responses.`;
      const markdownTable = `| Risk Level | Category | Description | Mitigation |
|------------|----------|-------------|------------|
| Medium | Technical | AI system complexity | Regular monitoring |
| Low | Compliance | Regulatory requirements | Documentation updates |`;
      
      const riskData = {
        useCaseType,
        questionnaireResponses,
        analysisDate: new Date(),
        riskLevel: 'Medium',
        categories: ['Technical', 'Compliance', 'Operational']
      };
      
      // Create a temporary project document or use empty string for projectId
      const riskMatrixResult = new RiskMatrixResult({
        projectId: projectId || '', // Use provided projectId or empty string
        sessionId,
        summary,
        markdownTable,
        riskData,
        createdBy
      });
      
      const savedResult = await riskMatrixResult.save();
      await savedResult.populate('createdBy', 'name surname email');
      
      res.status(201).json({
        message: 'Questionnaire processed successfully (fallback mode)',
        sessionId,
        riskMatrixResult: savedResult
      });
    }
    
  } catch (error) {
    console.error('Error processing questionnaire:', error);
    res.status(500).json({ error: 'Failed to process questionnaire' });
  }
});

// Get questionnaire processing status
router.get('/status/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await RiskMatrixResult.findOne({ 
      sessionId, 
      isActive: true 
    })
    .populate('createdBy', 'name surname email')
    .lean();
    
    if (!result) {
      return res.status(404).json({ error: 'Questionnaire processing result not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching questionnaire status:', error);
    res.status(500).json({ error: 'Failed to fetch questionnaire status' });
  }
});

// ===== ADMIN-ONLY ROUTES FOR QUESTION MANAGEMENT =====

// Get all questions (admin only)
router.get('/questions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true })
      .sort({ order: 1 })
      .populate('createdBy', 'name surname email')
      .populate('updatedBy', 'name surname email');
    
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Create new question (admin only)
router.post('/questions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, label, options, fields, placeholder, required, order } = req.body;
    
    // Validate required fields
    if (!type || !label) {
      return res.status(400).json({ error: 'Type and label are required' });
    }
    
    const question = new Question({
      id: nanoid(),
      type,
      label,
      options: options || [],
      fields: fields || [],
      placeholder,
      required: required !== false,
      order: order || 0,
      createdBy: req.user._id
    });
    
    const savedQuestion = await question.save();
    await savedQuestion.populate('createdBy', 'name surname email');
    
    res.status(201).json(savedQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update question (admin only)
router.put('/questions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedBy: req.user._id };
    
    const question = await Question.findOneAndUpdate(
      { id, isActive: true },
      updateData,
      { new: true }
    ).populate('createdBy', 'name surname email')
     .populate('updatedBy', 'name surname email');
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete question (admin only)
router.delete('/questions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findOneAndUpdate(
      { id, isActive: true },
      { isActive: false, updatedBy: req.user._id },
      { new: true }
    );
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Get questions for frontend (public route, but questions are filtered)
router.get('/questions/public', async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true })
      .sort({ order: 1 })
      .select('-createdBy -updatedBy -__v -createdAt -updatedAt');
    
    res.json(questions);
  } catch (error) {
    console.error('Error fetching public questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

export default router; 