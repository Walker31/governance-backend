import mongoose from 'mongoose';

const riskMatrixRiskSchema = new mongoose.Schema({
  riskAssessmentId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  projectId: {
    type: String,
    required: false,
    index: true
  },
  riskName: {
    type: String,
    required: true
  },
  riskOwner: {
    type: String,
    required: true,
    enum: ['Data Engineering Team', 'Security Team', 'Compliance Team']
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  justification: {
    type: String,
    required: false
  },
  mitigation: {
    type: String,
    required: false
  },
  targetDate: {
    type: Date,
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
riskMatrixRiskSchema.index({ riskAssessmentId: 1, createdAt: -1 });
riskMatrixRiskSchema.index({ sessionId: 1, createdAt: -1 });
riskMatrixRiskSchema.index({ projectId: 1, createdAt: -1 });
riskMatrixRiskSchema.index({ severity: 1 });
riskMatrixRiskSchema.index({ riskOwner: 1 });

const RiskMatrixRisk = mongoose.model('RiskMatrixRisk', riskMatrixRiskSchema);

export default RiskMatrixRisk; 