const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAuthentication() {
  console.log('🧪 Testing Authentication API...\n');

  try {
    // Test 1: Sign up with valid credentials
    console.log('1. Testing sign up...');
    const signUpResponse = await axios.post(`${API_BASE_URL}/auth/signup`, {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    
    if (signUpResponse.data.success) {
      console.log('✅ Sign up successful');
      console.log('User:', signUpResponse.data.data.user.email);
      console.log('Token received:', !!signUpResponse.data.data.token);
    } else {
      console.log('❌ Sign up failed:', signUpResponse.data.error?.message);
    }

    console.log('\n2. Testing sign in with correct credentials...');
    const signInResponse = await axios.post(`${API_BASE_URL}/auth/signin`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (signInResponse.data.success) {
      console.log('✅ Sign in successful');
      console.log('User:', signInResponse.data.data.user.email);
      console.log('Token received:', !!signInResponse.data.data.token);
    } else {
      console.log('❌ Sign in failed:', signInResponse.data.error?.message);
    }

    console.log('\n3. Testing sign in with wrong password...');
    try {
      await axios.post(`${API_BASE_URL}/auth/signin`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed with wrong password');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected wrong password (401)');
        console.log('Error message:', error.response.data.error?.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    console.log('\n4. Testing sign in with non-existent user...');
    try {
      await axios.post(`${API_BASE_URL}/auth/signin`, {
        email: 'nonexistent@example.com',
        password: 'password123'
      });
      console.log('❌ Should have failed with non-existent user');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected non-existent user (401)');
        console.log('Error message:', error.response.data.error?.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    console.log('\n5. Testing sign in with missing fields...');
    try {
      await axios.post(`${API_BASE_URL}/auth/signin`, {
        email: 'test@example.com'
        // Missing password
      });
      console.log('❌ Should have failed with missing password');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected missing fields (400)');
        console.log('Error message:', error.response.data.error?.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    console.log('\n🎉 Authentication tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 3000');
    }
  }
}

// Run the test
testAuthentication(); 