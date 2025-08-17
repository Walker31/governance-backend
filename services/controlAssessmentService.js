import Control from '../models/ControlAssessment.js';

class ControlMatrixService {
  // Store controls
  static async storeControls(data, userId) {
    const { projectId, sessionId } = data;
    let { parsedControls } = data;
    parsedControls = parsedControls.slice(1);

    if (!parsedControls || !Array.isArray(parsedControls) || parsedControls.length === 0) {
      throw new Error('No controls to store');
    }
    const riskAssessmentId = `RC-${sessionId.substring(0, 8).toUpperCase()}`;

    const controlsToInsert = parsedControls.map(ctrl => ({
      sessionId,
      projectId,
      riskAssessmentId,
      controlId: ctrl.control_id,
      code: ctrl.code,
      section: ctrl.section,
      control: ctrl.control,
      requirements: ctrl.requirements,
      status: ctrl.status,
      tickets: ctrl.tickets,
      owner: userId,
      relatedRisk: ctrl.related_risk,
      createdBy: userId
    }));

    const inserted = await Control.insertMany(controlsToInsert);
    await Control.populate(inserted, { path: 'createdBy', select: 'name surname email' });
    return {
      riskAssessmentId,
      sessionId,
      controlsCount: inserted.length,
      controls: inserted
    };
  }

  // Get controls for a risk assessment
  static async getControlsByAssessment(riskAssessmentId) {
    return await Control.find({ riskAssessmentId, isActive: true })
      .populate('createdBy', 'name surname email')
      .sort({ createdAt: -1 }).lean();
  }

  // Get controls for a sessionId
  static async getControlsBySession(sessionId) {
    return await Control.find({ sessionId, isActive: true })
      .populate('createdBy', 'name surname email')
      .sort({ createdAt: -1 }).lean();
  }

  // Get controls for a project (with pagination)
  static async getControlsByProject(projectId, page = 1, limit = 20, status = null) {
    const query = { projectId, isActive: true };
    if (status) query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const results = await Control.find(query)
      .populate('createdBy', 'name surname email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Control.countDocuments(query);
    return {
      controls: results,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    };
  }

  // Update a control
  static async updateControl(controlId, updateData) {
    const updated = await Control.findOneAndUpdate(
      { controlId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name surname email');
    if (!updated) throw new Error('Control not found');
    return updated;
  }

  // Delete (soft) a control
  static async deleteControl(controlId) {
    const deleted = await Control.findOneAndUpdate(
      { controlId },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    if (!deleted) throw new Error('Control not found');
    return { message: 'Control deleted successfully' };
  }
}

export default ControlMatrixService;
