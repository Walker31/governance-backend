import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';
const AGENT_URL = 'http://localhost:8000';

// Test data
const testData = {
  summary: "AI system for customer data analysis with machine learning models",
  session_id: "test-session-" + Date.now(),
  project_id: "507f1f77bcf86cd799439011"
};

async function testRiskMatrixFlow() {
  console.log('🧪 Testing Risk Matrix Data Flow...\n');

  try {
    // Step 1: Test Agent API
    console.log('1️⃣ Testing Agent API...');
    const agentResponse = await axios.post(`${AGENT_URL}/agent/risk-matrix/`, testData);
    console.log('✅ Agent API Response:', {
      session_id: agentResponse.data.session_id,
      stored_in_db: agentResponse.data.stored_in_db,
      table_length: agentResponse.data.markdown_table?.length || 0
    });

    // Step 2: Test Database Retrieval
    if (agentResponse.data.stored_in_db) {
      console.log('\n2️⃣ Testing Database Retrieval...');
      
      // First, we need to get a token for authentication
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@governance.com',
        password: 'admin123'
      });
      
      const token = loginResponse.data.data?.token || loginResponse.data.token;
      
      if (token) {
        const dbResponse = await axios.get(
          `${API_BASE_URL}/risk-matrix-results/session/${agentResponse.data.session_id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('✅ Database Retrieval Response:', {
          id: dbResponse.data._id,
          sessionId: dbResponse.data.sessionId,
          summary: dbResponse.data.summary,
          createdBy: dbResponse.data.createdBy?.name
        });
      } else {
        console.log('❌ Failed to get authentication token');
      }
    } else {
      console.log('⚠️  Result not stored in database');
    }

    // Step 3: Test Project Results
    console.log('\n3️⃣ Testing Project Results...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@governance.com',
        password: 'admin123'
      });
      
      const token = loginResponse.data.data?.token || loginResponse.data.token;
      
      if (token) {
        const projectResponse = await axios.get(
          `${API_BASE_URL}/risk-matrix-results/project/${testData.project_id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('✅ Project Results:', {
          count: projectResponse.data.length,
          results: projectResponse.data.map(r => ({
            id: r._id,
            sessionId: r.sessionId,
            summary: r.summary?.substring(0, 50) + '...'
          }))
        });
      }
    } catch (error) {
      console.log('❌ Project Results Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.log('❌ Test Failed:', error.response?.data || error.message);
  }
}

testRiskMatrixFlow(); 