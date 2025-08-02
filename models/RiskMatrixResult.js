import mongoose from 'mongoose';

const riskMatrixResultSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: false // Make it optional for now
  },
  sessionId: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  markdownTable: {
    type: String,
    required: true
  },
  riskData: {
    type: mongoose.Schema.Types.Mixed, // Store parsed risk data as JSON
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
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

// Index for efficient queries
riskMatrixResultSchema.index({ projectId: 1, createdAt: -1 });
riskMatrixResultSchema.index({ sessionId: 1 });

const RiskMatrixResult = mongoose.model('RiskMatrixResult', riskMatrixResultSchema);

export default RiskMatrixResult; 