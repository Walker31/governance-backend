import express from 'express';
import RiskMatrixRisk from '../models/RiskMatrixRisk.js';
import Question from '../models/Question.js';
import RiskMatrixService from '../services/riskMatrixService.js';
import ControlMatrixService from '../services/controlAssessmentService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { nanoid } from 'nanoid';
import Project from '../models/Projects.js';
import axios from 'axios';

const router = express.Router();

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
  let summary = '';
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

router.post('/process', authenticateToken, async (req, res) => {
  try {
    const {
      questionnaireResponses,
      useCaseType
    } = req.body;

    const createdBy = req.user._id;
    const sessionId = nanoid();

    if (!questionnaireResponses) {
      return res.status(400).json({ error: 'Missing required field: questionnaireResponses' });
    }

    // Convert for agent
    const summary = generateSummaryFromResponses(questionnaireResponses, useCaseType);

    // Create the project
    const newProject = new Project({
      projectName: questionnaireResponses?.purpose?.slice(0, 50) || 'AI Risk Project',
      workflow: 'defaultWorkflow',
      template: useCaseType,
      owner: req.user._id
    });
    const savedProject = await newProject.save();
    const actualProjectId = savedProject.projectId;

    // Call risk-control agent
    const agentUrl = process.env.AGENT_URL || 'http://localhost:8000';
    let agentResponse;
    try {
      agentResponse = await axios.post(`${agentUrl}/agent/risk-control`, {
        summary: summary,
        session_id: sessionId,
        project_id: actualProjectId || null
      }, { timeout: 30000 });
    } catch (error) {
      console.error('Error calling risk-control agent:', error);
      return res.status(500).json({ message: 'Unable to process request from risk-control agent' });
    }

    // --- Store risks and controls ---
    const { parsed_risks, parsed_controls, risk_matrix, control_matrix, risk_assessment_id } = agentResponse.data;

    let resultRisks = { riskAssessmentId: risk_assessment_id, risksCount: 0, risks: [] };
    if (parsed_risks && parsed_risks.length > 0) {
      resultRisks = await RiskMatrixService.storeRisks({
        projectId: actualProjectId,
        sessionId,
        parsedRisks: parsed_risks
      }, createdBy);
    }

    let resultControls = { controlsCount: 0, controls: [] };
    if (parsed_controls && parsed_controls.length > 0) {
      resultControls = await ControlMatrixService.storeControls({
        projectId: actualProjectId,
        sessionId,
        parsedControls: parsed_controls,
        riskAssessmentId: risk_assessment_id
      }, createdBy);
    }

    // --- Respond ---
    return res.status(201).json({
      message: 'Questionnaire processed successfully',
      sessionId,
      riskAssessmentId: risk_assessment_id,
      risksCount: resultRisks.risksCount,
      risks: resultRisks.risks,
      controlsCount: resultControls.controlsCount,
      controls: resultControls.controls,
      risk_matrix,
      control_matrix
    });
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