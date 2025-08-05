import connectDB from './config.js';
import RiskMatrixResult from './models/RiskMatrixResult.js';

const migrateRiskAssessmentIds = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all existing risk matrix results without riskAssessmentId
    const existingResults = await RiskMatrixResult.find({ 
      riskAssessmentId: { $exists: false } 
    }).sort({ createdAt: 1 });

    console.log(`Found ${existingResults.length} records to migrate`);

    if (existingResults.length === 0) {
      console.log('No records need migration');
      return;
    }

    // Generate risk assessment IDs for existing records
    let counter = 1;
    for (const result of existingResults) {
      const riskAssessmentId = `R-${counter.toString().padStart(3, '0')}`;
      
      await RiskMatrixResult.findByIdAndUpdate(result._id, {
        riskAssessmentId: riskAssessmentId
      });
      
      console.log(`Updated ${result._id} with risk assessment ID: ${riskAssessmentId}`);
      counter++;
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
};

// Run migration
migrateRiskAssessmentIds(); 