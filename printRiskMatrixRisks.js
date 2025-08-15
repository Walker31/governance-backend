import mongoose from 'mongoose';
import RiskMatrixRisk from './models/RiskMatrixRisk.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-governance';

async function printRisks() {
  try {
    await mongoose.connect(MONGODB_URI);
    const risks = await RiskMatrixRisk.find({}, {
      riskName: 1,
      riskOwner: 1,
      severity: 1,
      justification: 1,
      mitigation: 1,
      targetDate: 1,
      _id: 0
    }).lean();
    console.log('Current RiskMatrixRisk entries:');
    risks.forEach((risk, idx) => {
      console.log(`${idx + 1}.`, risk);
    });
  } catch (err) {
    console.error('Error fetching risks:', err);
  } finally {
    await mongoose.disconnect();
  }
}

printRisks();