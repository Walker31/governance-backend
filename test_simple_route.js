import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3001';

// Test data
const testCredentials = {
  email: 'admin@governance.com',
  password: 'admin123'
};

async function testSimpleRoute() {
  try {
    console.log('🧪 Testing Simple Route Access...\n');

    // Step 1: Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/`);
      console.log('✅ Health endpoint response:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health endpoint failed:', error.message);
    }

    // Step 2: Login to get token
    console.log('\n2️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testCredentials);
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    
    if (!token) {
      throw new Error('Failed to get authentication token');
    }
    
    console.log('✅ Login successful, token received');

    // Step 3: Test risk matrix results route without any filters
    console.log('\n3️⃣ Testing GET /risk-matrix-results without filters...');
    try {
      const allRisksResponse = await axios.get(`${API_BASE_URL}/risk-matrix-results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ All risks response:', {
        totalResults: allRisksResponse.data.results?.length || 0,
        pagination: allRisksResponse.data.pagination,
        sampleResult: allRisksResponse.data.results?.[0] ? {
          sessionId: allRisksResponse.data.results[0].sessionId,
          summary: allRisksResponse.data.results[0].summary?.substring(0, 50) + '...',
          projectId: allRisksResponse.data.results[0].projectId,
          createdBy: allRisksResponse.data.results[0].createdBy?.name
        } : null
      });
    } catch (error) {
      console.log('❌ All risks route failed:', error.response?.data?.error || error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }

    // Step 4: Test with projectId filter
    console.log('\n4️⃣ Testing GET /risk-matrix-results with projectId filter...');
    try {
      const projectRisksResponse = await axios.get(`${API_BASE_URL}/risk-matrix-results?projectId=507f1f77bcf86cd799439011`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Project risks response:', {
        totalResults: projectRisksResponse.data.results?.length || 0,
        pagination: projectRisksResponse.data.pagination,
        sampleResult: projectRisksResponse.data.results?.[0] ? {
          sessionId: projectRisksResponse.data.results[0].sessionId,
          summary: projectRisksResponse.data.results[0].summary?.substring(0, 50) + '...',
          projectId: projectRisksResponse.data.results[0].projectId,
          createdBy: projectRisksResponse.data.results[0].createdBy?.name
        } : null
      });
    } catch (error) {
      console.log('❌ Project risks route failed:', error.response?.data?.error || error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testSimpleRoute(); 