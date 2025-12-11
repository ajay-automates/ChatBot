// Simple test script to verify upload endpoint
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUpload() {
  console.log('Testing Knowledge Base Upload Endpoint...\n');

  // You'll need to replace these with actual values
  const BOT_ID = 'your-bot-id'; // Replace with actual bot ID
  const AUTH_TOKEN = 'your-jwt-token'; // Replace with actual JWT token
  const API_URL = 'http://localhost:3000';

  const testFiles = [
    { path: './test-uploads/sample-faq.json', type: 'JSON' },
    { path: './test-uploads/sample-faq.csv', type: 'CSV' },
    { path: './test-uploads/sample-docs.md', type: 'Markdown' },
    { path: './test-uploads/sample-text.txt', type: 'Text' },
  ];

  console.log('⚠️  IMPORTANT: Before running this test:');
  console.log('1. Create a chatbot in the dashboard');
  console.log('2. Copy the chatbot ID');
  console.log('3. Get your JWT token from localStorage after login');
  console.log('4. Update BOT_ID and AUTH_TOKEN variables in this file\n');

  if (BOT_ID === 'your-bot-id' || AUTH_TOKEN === 'your-jwt-token') {
    console.log('❌ Please update BOT_ID and AUTH_TOKEN before running tests');
    console.log('\nTo get your token:');
    console.log('1. Login at http://localhost:3000/login');
    console.log('2. Open browser DevTools > Application > Local Storage');
    console.log('3. Copy the token value');
    return;
  }

  for (const testFile of testFiles) {
    try {
      console.log(`\n📤 Testing ${testFile.type} upload: ${testFile.path}`);

      const form = new FormData();
      form.append('file', fs.createReadStream(testFile.path));

      const response = await axios.post(
        `${API_URL}/api/knowledge/${BOT_ID}/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
          maxBodyLength: Infinity,
        }
      );

      console.log(`✅ Success!`);
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Stats:`, response.data.stats);

    } catch (error) {
      console.log(`❌ Failed!`);
      if (error.response) {
        console.log(`   Error: ${error.response.data.error || error.message}`);
        console.log(`   Status: ${error.response.status}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
  }

  console.log('\n✅ Test complete!');
}

// Run tests
testUpload().catch(console.error);
