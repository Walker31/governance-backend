import express from 'express';
import ControlMatrixService from '../services/controlAssessmentService.js';
import { authenticateToken } from '../middleware/auth.js';
import Control from '../models/ControlAssessment.js';

const router = express.Router();

// Store controls
router.post('/controls', authenticateToken, async (req, res) => {
  try {
    const { projectId, sessionId, parsedControls } = req.body;
    const createdBy = req.user._id;
    const result = await ControlMatrixService.storeControls({ projectId, sessionId, parsedControls }, createdBy);
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to store controls' });
  }
});

router.get('/all',authenticateToken,async (req,res) => {
  try {
    const response = await Control.find({});
    res.status(200).json({'controls':response});
  } catch(e) {
    res.status(500).json({error:e.message || 'Failed to get controls'});
  }
});

// Get controls by assessment
router.get('/controls/assessment/:riskAssessmentId', authenticateToken, async (req, res) => {
  try {
    const controls = await ControlMatrixService.getControlsByAssessment(req.params.riskAssessmentId);
    res.json(controls);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to get controls' });
  }
});

// Get controls by session
router.get('/controls/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const controls = await ControlMatrixService.getControlsBySession(req.params.sessionId);
    res.json(controls);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to get controls' });
  }
});

// Get controls by project (with pagination/filter)
router.get('/controls/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await ControlMatrixService.getControlsByProject(
      req.params.projectId, page, limit, status
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to get controls' });
  }
});

// Update control
router.put('/controls/:controlId', authenticateToken, async (req, res) => {
  try {
    const updated = await ControlMatrixService.updateControl(req.params.controlId, req.body);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to update control' });
  }
});

// Delete control (soft)
router.delete('/controls/:controlId', authenticateToken, async (req, res) => {
  try {
    const result = await ControlMatrixService.deleteControl(req.params.controlId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to delete control' });
  }
});

export default router;
