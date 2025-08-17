import mongoose from 'mongoose';
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet('0123456789',4);

const riskMatrixRiskSchema = new mongoose.Schema({
  riskAssessmentId: {
    type: String,
    required: true,
    index: true,
    default: () => `R-${nanoid()}`
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
  timestamps: true,collection: 'Risks'
});

// Indexes for efficient queries
riskMatrixRiskSchema.index({ riskAssessmentId: 1, createdAt: -1 });
riskMatrixRiskSchema.index({ sessionId: 1, createdAt: -1 });
riskMatrixRiskSchema.index({ projectId: 1, createdAt: -1 });
riskMatrixRiskSchema.index({ severity: 1 });
riskMatrixRiskSchema.index({ riskOwner: 1 });

const RiskMatrixRisk = mongoose.model('RiskMatrixRisk', riskMatrixRiskSchema);

export default RiskMatrixRisk; 