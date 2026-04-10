const axios = require('axios');
const { createAccessToken } = require('./utils/auth');
const mongoose = require('mongoose');

async function testChat() {
  const token = createAccessToken({ id: "test_user_123", email: "test@example.com" });
  
  try {
    const response = await axios.post('http://localhost:8000/api/chat', {
      message: "Hello",
      profile: {
        name: "Test User",
        monthly_income: 50000,
        goals: []
      }
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Success! Backend Response:", response.data);
  } catch (error) {
    if (error.response) {
      console.log("Backend threw an HTTP error:");
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    } else {
      console.log("Connection Failed:", error.message);
    }
  }
}

testChat();
