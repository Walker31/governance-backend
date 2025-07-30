import express from 'express';
import RiskMatrixResult from '../models/RiskMatrixResult.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all risk matrix results (authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      search = '',
      projectId = ''
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Add project filter if provided
    if (projectId) {
      query.projectId = projectId;
    }
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { summary: { $regex: search, $options: 'i' } },
        { sessionId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get results with pagination
    const results = await RiskMatrixResult.find(query)
      .populate('createdBy', 'name surname email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const total = await RiskMatrixResult.countDocuments(query);
    
    res.json({
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching all risk matrix results:', error);
    res.status(500).json({ error: 'Failed to fetch risk matrix results' });
  }
});

// Get all risk matrix results for a project (authenticated users)
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const results = await RiskMatrixResult.find({ 
      projectId, 
      isActive: true 
    })
    .populate('createdBy', 'name surname email')
    .sort({ createdAt: -1 })
    .lean();
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching risk matrix results:', error);
    res.status(500).json({ error: 'Failed to fetch risk matrix results' });
  }
});

// Get risk matrix result by ID (authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await RiskMatrixResult.findOne({ 
      _id: id, 
      isActive: true 
    })
    .populate('createdBy', 'name surname email')
    .lean();
    
    if (!result) {
      return res.status(404).json({ error: 'Risk matrix result not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching risk matrix result:', error);
    res.status(500).json({ error: 'Failed to fetch risk matrix result' });
  }
});

// Create new risk matrix result (authenticated users)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, sessionId, summary, markdownTable, riskData } = req.body;
    const createdBy = req.user._id;
    
    // Check if session already exists
    const existingResult = await RiskMatrixResult.findOne({ sessionId });
    if (existingResult) {
      return res.status(400).json({ error: 'Session already exists' });
    }
    
    const riskMatrixResult = new RiskMatrixResult({
      projectId,
      sessionId,
      summary,
      markdownTable,
      riskData: riskData || {},
      createdBy
    });
    
    const savedResult = await riskMatrixResult.save();
    
    // Populate createdBy for response
    await savedResult.populate('createdBy', 'name surname email');
    
    res.status(201).json(savedResult);
  } catch (error) {
    console.error('Error creating risk matrix result:', error);
    res.status(500).json({ error: 'Failed to create risk matrix result' });
  }
});

// Update risk matrix result (authenticated users)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { summary, markdownTable, riskData } = req.body;
    
    const updatedResult = await RiskMatrixResult.findByIdAndUpdate(
      id,
      {
        summary,
        markdownTable,
        riskData: riskData || {},
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name surname email');
    
    if (!updatedResult) {
      return res.status(404).json({ error: 'Risk matrix result not found' });
    }
    
    res.json(updatedResult);
  } catch (error) {
    console.error('Error updating risk matrix result:', error);
    res.status(500).json({ error: 'Failed to update risk matrix result' });
  }
});

// Delete risk matrix result (soft delete) (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedResult = await RiskMatrixResult.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!deletedResult) {
      return res.status(404).json({ error: 'Risk matrix result not found' });
    }
    
    res.json({ message: 'Risk matrix result deleted successfully' });
  } catch (error) {
    console.error('Error deleting risk matrix result:', error);
    res.status(500).json({ error: 'Failed to delete risk matrix result' });
  }
});

// Get risk matrix result by session ID (authenticated users)
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await RiskMatrixResult.findOne({ 
      sessionId, 
      isActive: true 
    })
    .populate('createdBy', 'name surname email')
    .lean();
    
    if (!result) {
      return res.status(404).json({ error: 'Risk matrix result not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching risk matrix result by session:', error);
    res.status(500).json({ error: 'Failed to fetch risk matrix result' });
  }
});

// Get risk summary statistics (authenticated users)
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    // Build query
    const query = { isActive: true };
    if (projectId) {
      query.projectId = projectId;
    }
    
    // Get all risk matrix results
    const results = await RiskMatrixResult.find(query)
      .populate('createdBy', 'name surname email')
      .lean();
    
    // Analyze risk levels from markdown tables
    const riskLevels = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0
    };
    
    let totalRisks = 0;
    let totalAssessments = 0;
    
    results.forEach(result => {
      if (result.markdownTable) {
        totalAssessments++;
        
        // Parse markdown table to count risk levels
        const lines = result.markdownTable.split('\n');
        lines.forEach(line => {
          if (line.includes('|') && !line.includes('---')) {
            const cells = line.split('|').filter(cell => cell.trim());
            if (cells.length >= 3) {
              const riskLevel = cells[2]?.trim().toLowerCase();
              if (riskLevel) {
                if (riskLevel.includes('critical')) riskLevels.Critical++;
                else if (riskLevel.includes('high')) riskLevels.High++;
                else if (riskLevel.includes('medium')) riskLevels.Medium++;
                else if (riskLevel.includes('low')) riskLevels.Low++;
                totalRisks++;
              }
            }
          }
        });
      }
    });
    
    // Calculate percentages
    const total = Object.values(riskLevels).reduce((sum, count) => sum + count, 0);
    const percentages = {};
    Object.keys(riskLevels).forEach(level => {
      percentages[level] = total > 0 ? Math.round((riskLevels[level] / total) * 100) : 0;
    });
    
    // Get recent assessments
    const recentAssessments = results
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(result => ({
        id: result._id,
        sessionId: result.sessionId,
        summary: result.summary,
        createdAt: result.createdAt,
        createdBy: result.createdBy?.name || 'Unknown',
        riskCount: result.markdownTable ? result.markdownTable.split('\n').filter(line => 
          line.includes('|') && !line.includes('---') && line.includes('|')
        ).length - 1 : 0
      }));
    
    res.json({
      riskLevels,
      percentages,
      totalRisks,
      totalAssessments,
      recentAssessments,
      summary: {
        totalAssessments: results.length,
        completedAssessments: totalAssessments,
        pendingAssessments: results.length - totalAssessments
      }
    });
  } catch (error) {
    console.error('Error fetching risk summary statistics:', error);
    res.status(500).json({ error: 'Failed to fetch risk summary statistics' });
  }
});

export default router; 