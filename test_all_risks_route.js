import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

async function testAllRisksRoute() {
  console.log('🧪 Testing All Risks Route...\n');

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

    // Step 2: Test getting all risk matrix results
    console.log('\n2️⃣ Testing GET /risk-matrix-results...');
    const allResultsResponse = await axios.get(`${API_BASE_URL}/risk-matrix-results`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ All Results Response:', {
      count: allResultsResponse.data.results?.length || 0,
      pagination: allResultsResponse.data.pagination,
      firstResult: allResultsResponse.data.results?.[0] ? {
        id: allResultsResponse.data.results[0]._id,
        sessionId: allResultsResponse.data.results[0].sessionId,
        summary: allResultsResponse.data.results[0].summary?.substring(0, 50) + '...',
        createdBy: allResultsResponse.data.results[0].createdBy?.name
      } : null
    });

    // Step 3: Test with search parameter
    console.log('\n3️⃣ Testing with search parameter...');
    const searchResponse = await axios.get(`${API_BASE_URL}/risk-matrix-results?search=AI`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Search Results:', {
      count: searchResponse.data.results?.length || 0,
      pagination: searchResponse.data.pagination
    });

    // Step 4: Test with pagination
    console.log('\n4️⃣ Testing with pagination...');
    const paginationResponse = await axios.get(`${API_BASE_URL}/risk-matrix-results?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Pagination Results:', {
      count: paginationResponse.data.results?.length || 0,
      pagination: paginationResponse.data.pagination
    });

  } catch (error) {
    console.log('❌ Test Failed:', error.response?.data || error.message);
  }
}

testAllRisksRoute(); 