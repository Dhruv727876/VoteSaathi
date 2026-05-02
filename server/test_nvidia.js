import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

async function test() {
  console.log("Testing NVIDIA Gemma 4 Full Response Structure...");
  
  if (!process.env.NVIDIA_API_KEY) {
    console.error("❌ Error: NVIDIA_API_KEY is not set correctly in .env");
    return;
  }

  const headers = {
    "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  const payload = {
    "model": "google/gemma-4-31b-it",
    "messages": [
      { "role": "user", "content": "Hello" }
    ],
    "max_tokens": 1024,
    "temperature": 1.00,
    "top_p": 0.95,
    "stream": false,
    "chat_template_kwargs": { "enable_thinking": true }
  };

  try {
    const response = await axios.post(invokeUrl, payload, { headers });
    console.log("\n--- Full API Response ---");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("-------------------------\n");
  } catch (error) {
    console.error("❌ Test Failed:", error.response?.data || error.message);
  }
}

test();
