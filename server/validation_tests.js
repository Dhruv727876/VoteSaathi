import http from 'http';

const sendRequest = (payload, testName) => {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`\n--- Test: ${testName} ---`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${body}`);
        resolve();
      });
    });

    req.on('error', error => {
      console.error(error);
      resolve();
    });

    req.write(data);
    req.end();
  });
};

const runTests = async () => {
  // Test 1: Too long message
  await sendRequest({
    message: 'a'.repeat(1001),
    persona: "firstTimeVoter",
    history: []
  }, "Too long message");

  // Test 2: Invalid persona
  await sendRequest({
    message: "hello",
    persona: "hacker",
    history: []
  }, "Invalid persona");

  // Test 3: XSS attempt
  await sendRequest({
    message: "<script>alert(1)</script>",
    persona: "firstTimeVoter",
    history: []
  }, "XSS attempt");
};

runTests();
