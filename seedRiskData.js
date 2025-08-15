import mongoose from 'mongoose';
import RiskMatrixRisk from './models/RiskMatrixRisk.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-governance';

const riskData = [
  {
    riskAssessmentId: 'R-SEED001',
    sessionId: 'session-seed-001',
    projectId: '507f1f77bcf86cd799439011',
    riskName: 'Data Poisoning',
    riskOwner: 'Data Engineering Team',
    severity: 4,
    justification: 'High severity due to the potential for corrupt data impacting model performance.',
    mitigation: 'Implement input data validation and anomaly detection.',
    targetDate: new Date('2025-12-31T00:00:00.000Z'),
    createdBy: null, // Will be set to first user
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    riskAssessmentId: 'R-SEED001',
    sessionId: 'session-seed-001',
    projectId: '507f1f77bcf86cd799439011',
    riskName: 'Model Inversion Attack',
    riskOwner: 'Security Team',
    severity: 3,
    justification: 'Medium severity as it could lead to sensitive data exposure through model outputs.',
    mitigation: 'Use differential privacy and limit model exposure.',
    targetDate: new Date('2025-12-31T00:00:00.000Z'),
    createdBy: null, // Will be set to first user
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    riskAssessmentId: 'R-SEED001',
    sessionId: 'session-seed-001',
    projectId: '507f1f77bcf86cd799439011',
    riskName: 'Unauthorized Content Generation',
    riskOwner: 'Compliance Team',
    severity: 4,
    justification: 'High severity as it poses risks related to compliance and misuse of generated content.',
    mitigation: 'Enforce usage policies and output filtering.',
    targetDate: new Date('2025-12-31T00:00:00.000Z'),
    createdBy: null, // Will be set to first user
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    riskAssessmentId: 'R-SEED002',
    sessionId: 'session-seed-002',
    projectId: '507f1f77bcf86cd799439011',
    riskName: 'Data Poisoning',
    riskOwner: 'Data Engineering Team',
    severity: 4,
    justification: 'Data poisoning can significantly compromise model integrity.',
    mitigation: 'Implement input data validation and anomaly detection.',
    targetDate: new Date('2025-12-31T00:00:00.000Z'),
    createdBy: null, // Will be set to first user
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    riskAssessmentId: 'R-SEED002',
    sessionId: 'session-seed-002',
    projectId: '507f1f77bcf86cd799439011',
    riskName: 'Model Inversion Attack',
    riskOwner: 'Security Team',
    severity: 4,
    justification: 'This attack can expose sensitive information about the model.',
    mitigation: 'Use differential privacy and limit model exposure.',
    targetDate: new Date('2025-12-31T00:00:00.000Z'),
    createdBy: null, // Will be set to first user
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    riskAssessmentId: 'R-SEED002',
    sessionId: 'session-seed-002',
    projectId: '507f1f77bcf86cd799439011',
    riskName: 'Unauthorized Content Generation',
    riskOwner: 'Compliance Team',
    severity: 3,
    justification: 'This risk can lead to the generation of harmful or misleading content.',
    mitigation: 'Enforce usage policies and output filtering.',
    targetDate: new Date('2025-12-31T00:00:00.000Z'),
    createdBy: null, // Will be set to first user
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
];

async function seedRiskData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the first user to use as createdBy
    const firstUser = await User.findOne();
    if (!firstUser) {
      console.error('No users found in database. Please create a user first.');
      process.exit(1);
    }

    // Update risk data with the user ID
    const risksWithUser = riskData.map(risk => ({
      ...risk,
      createdBy: firstUser._id
    }));

    // Clear existing seed data
    await RiskMatrixRisk.deleteMany({
      riskAssessmentId: { $in: ['R-SEED001', 'R-SEED002'] }
    });
    console.log('Cleared existing seed data');

    // Insert new risk data
    const insertedRisks = await RiskMatrixRisk.insertMany(risksWithUser);
    console.log(`Successfully inserted ${insertedRisks.length} risks`);

    // Display the inserted risks
    console.log('\nInserted Risks:');
    insertedRisks.forEach((risk, index) => {
      console.log(`${index + 1}. ${risk.riskName} (${risk.riskOwner}) - Severity: ${risk.severity}`);
    });

    console.log('\nSeed data insertion completed successfully!');
  } catch (error) {
    console.error('Error seeding risk data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedRiskData(); 