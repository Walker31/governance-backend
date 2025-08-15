import express from 'express';
import RiskMatrixRisk from '../models/RiskMatrixRisk.js';
import RiskMatrixService from '../services/riskMatrixService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all risks with pagination and filtering (authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      search,
      projectId,
      sessionId,
      severity
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (projectId) {
      query.projectId = projectId;
    }
    
    if (sessionId) {
      query.sessionId = sessionId;
    }
    
    if (severity) {
      query.severity = parseInt(severity);
    }
    
    if (search) {
      query.$or = [
        { riskName: { $regex: search, $options: 'i' } },
        { riskOwner: { $regex: search, $options: 'i' } },
        { justification: { $regex: search, $options: 'i' } },
        { mitigation: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate skip
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query
    const risks = await RiskMatrixRisk.find(query)
      .populate('createdBy', 'name surname email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count
    const total = await RiskMatrixRisk.countDocuments(query);
    
    // Calculate pagination info
    const pages = Math.ceil(total / parseInt(limit));
    
    res.json({
      risks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

// Get all risks for a risk assessment (authenticated users)
router.get('/assessment/:riskAssessmentId', authenticateToken, async (req, res) => {
  try {
    const { riskAssessmentId } = req.params;
    
    const risks = await RiskMatrixService.getRisksByAssessment(riskAssessmentId);
    res.json(risks);
  } catch (error) {
    console.error('Error fetching risks for assessment:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

// Get all risks for a session (authenticated users)
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const risks = await RiskMatrixService.getRisksBySession(sessionId);
    res.json(risks);
  } catch (error) {
    console.error('Error fetching risks for session:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

// Get all risks for a project (authenticated users)
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, severity } = req.query;
    
    const result = await RiskMatrixService.getRisksByProject(projectId, page, limit, severity);
    res.json(result);
  } catch (error) {
    console.error('Error fetching risks for project:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

// Create multiple risks (authenticated users)
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { risks, riskAssessmentId, sessionId, projectId } = req.body;
    const createdBy = req.user._id;
    
    if (!risks || !Array.isArray(risks) || risks.length === 0) {
      return res.status(400).json({ error: 'Risks array is required' });
    }
    
    if (!riskAssessmentId || !sessionId) {
      return res.status(400).json({ error: 'Risk assessment ID and session ID are required' });
    }
    
    // Prepare risks for bulk insertion
    const risksToInsert = risks.map(risk => ({
      riskAssessmentId,
      sessionId,
      projectId,
      riskName: risk.risk_name,
      riskOwner: risk.risk_owner,
      severity: risk.severity,
      justification: risk.justification,
      mitigation: risk.mitigation,
      targetDate: risk.target_date ? new Date(risk.target_date) : null,
      createdBy
    }));
    
    const insertedRisks = await RiskMatrixRisk.insertMany(risksToInsert);
    
    // Populate createdBy for response
    await RiskMatrixRisk.populate(insertedRisks, { path: 'createdBy', select: 'name surname email' });
    
    res.status(201).json({
      message: `${insertedRisks.length} risks created successfully`,
      risks: insertedRisks
    });
  } catch (error) {
    console.error('Error creating risks:', error);
    res.status(500).json({ error: 'Failed to create risks' });
  }
});

// Update a risk (authenticated users)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { riskName, riskOwner, severity, justification, mitigation, targetDate } = req.body;
    
    const updatedRisk = await RiskMatrixService.updateRisk(id, {
      riskName,
      riskOwner,
      severity,
      justification,
      mitigation,
      targetDate: targetDate ? new Date(targetDate) : null
    });
    
    res.json(updatedRisk);
  } catch (error) {
    console.error('Error updating risk:', error);
    if (error.message === 'Risk not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update risk' });
    }
  }
});

// Delete a risk (soft delete) (authenticated users)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await RiskMatrixService.deleteRisk(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting risk:', error);
    if (error.message === 'Risk not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete risk' });
    }
  }
});

// Get risk statistics (authenticated users)
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    const stats = await RiskMatrixService.getRiskStatistics(projectId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching risk statistics:', error);
    res.status(500).json({ error: 'Failed to fetch risk statistics' });
  }
});

export default router; 