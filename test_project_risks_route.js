import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3001';

// Test data
const testCredentials = {
  email: 'admin@governance.com',
  password: 'admin123'
};

const testProjectId = '507f1f77bcf86cd799439011';

async function testProjectRisksRoute() {
  try {
    console.log('🧪 Testing Project Risks Route with Project ID...\n');

    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testCredentials);
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    
    if (!token) {
      throw new Error('Failed to get authentication token');
    }
    
    console.log('✅ Login successful\n');

    // Step 2: Test getting all risk matrix results with project filter
    console.log('2️⃣ Testing GET /risk-matrix-results with projectId filter...');
    const allRisksResponse = await axios.get(`${API_BASE_URL}/risk-matrix-results?projectId=${testProjectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ All risks response:', {
      totalResults: allRisksResponse.data.results?.length || 0,
      pagination: allRisksResponse.data.pagination,
      sampleResult: allRisksResponse.data.results?.[0] ? {
        sessionId: allRisksResponse.data.results[0].sessionId,
        summary: allRisksResponse.data.results[0].summary?.substring(0, 50) + '...',
        projectId: allRisksResponse.data.results[0].projectId,
        createdBy: allRisksResponse.data.results[0].createdBy?.name,
        createdAt: allRisksResponse.data.results[0].createdAt
      } : null
    });

    // Step 3: Test getting risk summary stats for the project
    console.log('\n3️⃣ Testing GET /risk-matrix-results/stats/summary with projectId...');
    const statsResponse = await axios.get(`${API_BASE_URL}/risk-matrix-results/stats/summary?projectId=${testProjectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Risk summary stats:', {
      riskLevels: statsResponse.data.riskLevels,
      percentages: statsResponse.data.percentages,
      totalRisks: statsResponse.data.totalRisks,
      totalAssessments: statsResponse.data.totalAssessments,
      summary: statsResponse.data.summary,
      recentAssessments: statsResponse.data.recentAssessments?.length || 0
    });

    // Step 4: Test getting project-specific risks (if this route exists)
    console.log('\n4️⃣ Testing GET /risk-matrix-results/project/:projectId...');
    try {
      const projectRisksResponse = await axios.get(`${API_BASE_URL}/risk-matrix-results/project/${testProjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Project-specific risks response:', {
        totalRisks: projectRisksResponse.data?.length || 0,
        sampleResult: projectRisksResponse.data?.[0] ? {
          sessionId: projectRisksResponse.data[0].sessionId,
          summary: projectRisksResponse.data[0].summary?.substring(0, 50) + '...',
          projectId: projectRisksResponse.data[0].projectId,
          createdBy: projectRisksResponse.data[0].createdBy?.name
        } : null
      });
    } catch (error) {
      console.log('⚠️ Project-specific route not found or error:', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Project ID: ${testProjectId}`);
    console.log(`- Total risks found: ${allRisksResponse.data.results?.length || 0}`);
    console.log(`- Risk levels: ${JSON.stringify(statsResponse.data.riskLevels)}`);
    console.log(`- Total assessments: ${statsResponse.data.totalAssessments}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testProjectRisksRoute(); 