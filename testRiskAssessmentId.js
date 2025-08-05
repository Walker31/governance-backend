import connectDB from './config.js';
import RiskMatrixResult from './models/RiskMatrixResult.js';

const testRiskAssessmentIdGeneration = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Test the ID generation function
    const nextId = await RiskMatrixResult.generateRiskAssessmentId();
    console.log('Next risk assessment ID:', nextId);

    // Get all existing risk assessment IDs
    const existingIds = await RiskMatrixResult.find({}, { riskAssessmentId: 1 }).sort({ riskAssessmentId: 1 });
    console.log('Existing risk assessment IDs:');
    existingIds.forEach(result => {
      console.log(`- ${result.riskAssessmentId}`);
    });

    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit(0);
  }
};

// Run test
testRiskAssessmentIdGeneration(); 