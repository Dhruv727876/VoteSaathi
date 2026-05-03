import http from 'http';

const postData = JSON.stringify({
  message: "test",
  persona: "firstTimeVoter",
  history: []
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const makeRequest = (i) => {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Request ${i}: ${res.statusCode}`);
        resolve(res.statusCode);
      });
    });

    req.on('error', (e) => {
      console.error(`Request ${i} error: ${e.message}`);
      resolve(500);
    });

    req.write(postData);
    req.end();
  });
};

const run = async () => {
  const promises = [];
  for (let i = 1; i <= 21; i++) {
    promises.push(makeRequest(i));
  }
  await Promise.all(promises);
  console.log("Done");
};

run();
