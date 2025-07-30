import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

async function testStatsRoute() {
  console.log('🧪 Testing Risk Statistics Route...\n');

  try {
    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@governance.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    
    if (!token) {
      console.log('❌ Failed to get authentication token');
      return;
    }
    
    console.log('✅ Login successful');

    // Step 2: Test getting risk statistics
    console.log('\n2️⃣ Testing GET /risk-matrix-results/stats/summary...');
    const statsResponse = await axios.get(`${API_BASE_URL}/risk-matrix-results/stats/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Statistics Response:', {
      riskLevels: statsResponse.data.riskLevels,
      percentages: statsResponse.data.percentages,
      totalRisks: statsResponse.data.totalRisks,
      totalAssessments: statsResponse.data.totalAssessments,
      summary: statsResponse.data.summary
    });

    // Step 3: Test with project filter
    console.log('\n3️⃣ Testing with project filter...');
    const projectStatsResponse = await axios.get(`${API_BASE_URL}/risk-matrix-results/stats/summary?projectId=test-project`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Project Filtered Statistics:', {
      riskLevels: projectStatsResponse.data.riskLevels,
      totalRisks: projectStatsResponse.data.totalRisks
    });

  } catch (error) {
    console.log('❌ Test Failed:', error.response?.data || error.message);
  }
}

testStatsRoute(); 