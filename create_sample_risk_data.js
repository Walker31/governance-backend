import axios from 'axios';
import mongoose from 'mongoose';
import RiskMatrixResult from './models/RiskMatrixResult.js';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/governance_db';

const API_BASE_URL = 'http://localhost:3001';

async function createSampleData() {
  console.log('🧪 Creating Sample Risk Matrix Data...\n');

  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database');

    // Get a user for createdBy
    const user = await User.findOne({ email: 'admin@governance.com' });
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }

    // Sample risk matrix data
    const sampleData = [
      {
        projectId: '507f1f77bcf86cd799439011',
        sessionId: 'session-ai-risk-001',
        summary: 'AI system for customer data analysis with machine learning models',
        markdownTable: `| Risk ID | Risk Description | Risk Level | Impact | Likelihood | Mitigation Strategy |
|---------|------------------|------------|--------|------------|-------------------|
| R-001 | Data privacy breach | Critical | Major | Likely | Implement encryption |
| R-002 | Model bias | High | Moderate | Possible | Regular bias testing |
| R-003 | System downtime | Medium | Minor | Unlikely | Backup systems |`,
        riskData: {
          totalRisks: 3,
          criticalRisks: 1,
          highRisks: 1,
          mediumRisks: 1
        },
        createdBy: user._id
      },
      {
        projectId: '507f1f77bcf86cd799439012',
        sessionId: 'session-ai-risk-002',
        summary: 'AI-powered recommendation system for e-commerce platform',
        markdownTable: `| Risk ID | Risk Description | Risk Level | Impact | Likelihood | Mitigation Strategy |
|---------|------------------|------------|--------|------------|-------------------|
| R-004 | Algorithm manipulation | High | Major | Possible | Input validation |
| R-005 | Performance degradation | Medium | Minor | Likely | Load balancing |
| R-006 | User data exposure | Critical | Major | Unlikely | Access controls |`,
        riskData: {
          totalRisks: 3,
          criticalRisks: 1,
          highRisks: 1,
          mediumRisks: 1
        },
        createdBy: user._id
      },
      {
        projectId: '507f1f77bcf86cd799439013',
        sessionId: 'session-ai-risk-003',
        summary: 'AI chatbot for customer service automation',
        markdownTable: `| Risk ID | Risk Description | Risk Level | Impact | Likelihood | Mitigation Strategy |
|---------|------------------|------------|--------|------------|-------------------|
| R-007 | Misleading responses | Low | Minor | Unlikely | Response validation |
| R-008 | Service interruption | Medium | Moderate | Possible | Fallback systems |`,
        riskData: {
          totalRisks: 2,
          criticalRisks: 0,
          highRisks: 0,
          mediumRisks: 2,
          lowRisks: 2
        },
        createdBy: user._id
      },
      {
        projectId: '507f1f77bcf86cd799439014',
        sessionId: 'session-ai-risk-004',
        summary: 'AI system for fraud detection in financial transactions',
        markdownTable: `| Risk ID | Risk Description | Risk Level | Impact | Likelihood | Mitigation Strategy |
|---------|------------------|------------|--------|------------|-------------------|
| R-009 | False positives | High | Major | Likely | Model tuning |
| R-010 | False negatives | Critical | Major | Possible | Regular audits |
| R-011 | System overload | Medium | Moderate | Unlikely | Scalability planning |`,
        riskData: {
          totalRisks: 3,
          criticalRisks: 1,
          highRisks: 1,
          mediumRisks: 1
        },
        createdBy: user._id
      }
    ];

    // Clear existing data
    await RiskMatrixResult.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert sample data
    const results = await RiskMatrixResult.insertMany(sampleData);
    console.log(`✅ Created ${results.length} sample risk matrix results`);

    // Test the statistics route
    console.log('\n🧪 Testing statistics with sample data...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@governance.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    
    const statsResponse = await axios.get(`${API_BASE_URL}/risk-matrix-results/stats/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Statistics with sample data:', {
      riskLevels: statsResponse.data.riskLevels,
      percentages: statsResponse.data.percentages,
      totalRisks: statsResponse.data.totalRisks,
      totalAssessments: statsResponse.data.totalAssessments
    });

    await mongoose.disconnect();
    console.log('✅ Disconnected from database');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

createSampleData(); 