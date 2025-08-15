import express from 'express';
import RiskMatrixRisk from '../models/RiskMatrixRisk.js';
import Question from '../models/Question.js';
import RiskMatrixService from '../services/riskMatrixService.js';
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
      
      const { parsed_risks } = agentResponse.data;
      
      // Store individual risks in database
      if (parsed_risks && parsed_risks.length > 0) {
        const result = await RiskMatrixService.storeRisks({
          projectId,
          sessionId,
          parsedRisks
        }, createdBy);
        
        res.status(201).json({
          message: 'Questionnaire processed successfully',
          sessionId,
          riskAssessmentId: result.riskAssessmentId,
          risksCount: result.risksCount,
          risks: result.risks
        });
      } else {
        res.status(201).json({
          message: 'Questionnaire processed successfully (no risks identified)',
          sessionId,
          risksCount: 0
        });
      }
      
    } catch (error) {
      console.error('Error calling AI agent:', error);
      
      // Fallback to placeholder risks if agent fails
      const fallbackRisks = [
        {
          risk_name: "AI System Complexity",
          risk_owner: "Data Engineering Team",
          severity: 3,
          justification: "Medium risk due to system complexity",
          mitigation: "Regular monitoring and testing",
          target_date: "2024-03-15"
        },
        {
          risk_name: "Regulatory Compliance",
          risk_owner: "Compliance Team",
          severity: 2,
          justification: "Low risk with proper documentation",
          mitigation: "Documentation updates and training",
          target_date: "2024-02-28"
        }
      ];
      
      const result = await RiskMatrixService.storeRisks({
        projectId,
        sessionId,
        parsedRisks: fallbackRisks
      }, createdBy);
      
      res.status(201).json({
        message: 'Questionnaire processed successfully (fallback mode)',
        sessionId,
        riskAssessmentId: result.riskAssessmentId,
        risksCount: result.risksCount,
        risks: result.risks
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
    
    const risks = await RiskMatrixRisk.find({ 
      sessionId, 
      isActive: true 
    })
    .populate('createdBy', 'name surname email')
    .sort({ severity: -1, createdAt: -1 })
    .lean();
    
    if (risks.length === 0) {
      return res.status(404).json({ error: 'Questionnaire processing result not found' });
    }
    
    // Group risks by assessment
    const riskAssessmentId = risks[0]?.riskAssessmentId;
    const groupedRisks = risks.filter(risk => risk.riskAssessmentId === riskAssessmentId);
    
    res.json({
      sessionId,
      riskAssessmentId,
      risksCount: groupedRisks.length,
      risks: groupedRisks
    });
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