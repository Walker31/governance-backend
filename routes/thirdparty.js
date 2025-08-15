import express from 'express';
import ThirdParty from '../models/ThirdParty.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Create Third Party
 */
router.post('/', authenticateToken, async (req, res) => {
  const { name, type, role, industry, url, projectId } = req.body;

  if (!name || !type || !role || !industry || !url || !projectId) {
    return res.status(400).json({ message: 'Some fields are missing' });
  }

  try {
    const newTP = await ThirdParty.create({
      userId: req.user._id,
      projectId,
      name,
      type,
      url,
      industry,
      role
    });
    res.status(201).json(newTP);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Get all Third Parties by projectId
 */
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const thirdParties = await ThirdParty.find({
      projectId: req.params.projectId,
      userId: req.user._id
    });
    res.status(200).json(thirdParties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Update Third Party by ID
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedTP = await ThirdParty.findOneAndUpdate(
      { id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedTP) {
      return res.status(404).json({ message: 'Third Party not found' });
    }

    res.status(200).json(updatedTP);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Delete Third Party by ID
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedTP = await ThirdParty.findOneAndDelete({
      id: req.params.id,
      userId: req.user._id
    });

    if (!deletedTP) {
      return res.status(404).json({ message: 'Third Party not found' });
    }

    res.status(200).json({ message: 'Third Party deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
