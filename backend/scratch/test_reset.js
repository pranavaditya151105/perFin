const axios = require('axios');

async function test() {
  try {
    console.log("Checking if /api/auth/forgot-password exists...");
    const res = await axios.post('http://localhost:8000/api/auth/forgot-password', { email: 'nonexistent@test.com' });
    console.log("Success message:", res.data.message);
  } catch (err) {
    console.error("Test failed:", err.response?.data || err.message);
  }
}

test();
