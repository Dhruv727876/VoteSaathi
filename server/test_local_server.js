import axios from 'axios';

async function testLocalServer() {
  console.log("Testing Local Server /api/chat...");
  try {
    const response = await axios.post('http://localhost:5000/api/chat', {
      message: "Hello",
      persona: "default",
      history: []
    });
    console.log("Server Response:", response.data);
  } catch (error) {
    console.error("Local Server Request Failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testLocalServer();
