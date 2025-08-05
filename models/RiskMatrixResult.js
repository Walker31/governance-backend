import mongoose from 'mongoose';

const riskMatrixResultSchema = new mongoose.Schema({
  riskAssessmentId: {
    type: String,
    required: true,
    unique: true
  },
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

// Function to generate the next risk assessment ID
riskMatrixResultSchema.statics.generateRiskAssessmentId = async function() {
  const lastResult = await this.findOne({}, {}, { sort: { 'riskAssessmentId': -1 } });
  
  if (!lastResult) {
    return 'R-001';
  }
  
  // Extract the number from the last ID (e.g., "R-001" -> 1)
  const lastNumber = parseInt(lastResult.riskAssessmentId.split('-')[1]);
  const nextNumber = lastNumber + 1;
  
  // Format with leading zeros (e.g., 1 -> "001")
  return `R-${nextNumber.toString().padStart(3, '0')}`;
};

// Index for efficient queries
riskMatrixResultSchema.index({ projectId: 1, createdAt: -1 });
riskMatrixResultSchema.index({ sessionId: 1 });
riskMatrixResultSchema.index({ riskAssessmentId: 1 });

const RiskMatrixResult = mongoose.model('RiskMatrixResult', riskMatrixResultSchema);

export default RiskMatrixResult; 