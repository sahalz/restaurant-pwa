import http from 'http';
import jwt from 'jsonwebtoken';
import { getAdminClient } from './src/config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'restaurant_pwa_secret_key_jwt_token_signing';
const PORT = process.env.PORT || 5000;

// Test user details
const customerId = '00000000-0000-0000-0000-888888888888';
const staffId = '00000000-0000-0000-0000-999999999999';

async function setupTestData() {
  const supabase = getAdminClient();
  
  // Clean up any old test data first
  await supabase.from('support_tickets').delete().eq('user_id', customerId);
  await supabase.from('notifications').delete().in('user_id', [customerId, staffId]);
  await supabase.from('users').delete().in('id', [customerId, staffId]);

  console.log('Creating test users...');
  
  // Create test customer
  const { error: custErr } = await supabase
    .from('users')
    .insert({
      id: customerId,
      name: 'Test Customer',
      email: 'customer-test@example.com',
      phone: '1111111111',
      role: 'customer'
    });
  if (custErr) throw new Error('Failed to create test customer: ' + custErr.message);

  // Create test staff
  const { error: staffErr } = await supabase
    .from('users')
    .insert({
      id: staffId,
      name: 'Test Staff Member',
      email: 'staff-test@example.com',
      phone: '2222222222',
      role: 'staff'
    });
  if (staffErr) throw new Error('Failed to create test staff: ' + staffErr.message);

  console.log('Test users set up successfully.');
}

async function cleanupTestData() {
  console.log('Cleaning up test data...');
  const supabase = getAdminClient();
  try {
    await supabase.from('support_tickets').delete().eq('user_id', customerId);
    await supabase.from('notifications').delete().in('user_id', [customerId, staffId]);
    await supabase.from('users').delete().in('id', [customerId, staffId]);
    console.log('Cleanup complete.');
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }
}

async function runTest() {
  try {
    await setupTestData();

    // 1. Generate tokens
    const staffToken = jwt.sign(
      { id: staffId, email: 'staff-test@example.com', role: 'staff' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const customerToken = jwt.sign(
      { id: customerId, email: 'customer-test@example.com', role: 'customer' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 2. Connect Staff to SSE Stream
    const streamUrl = `http://localhost:${PORT}/api/notifications/stream?token=${encodeURIComponent(staffToken)}`;
    console.log(`Connecting staff member to SSE stream at: ${streamUrl}`);
    
    let gotConnectedMessage = false;
    let gotNotificationMessage = false;

    const sseReq = http.get(streamUrl, (sseRes) => {
      console.log(`SSE Response status: ${sseRes.statusCode}`);
      if (sseRes.statusCode !== 200) {
        console.error('Failed to connect to SSE stream');
        process.exit(1);
      }

      sseRes.on('data', (chunk) => {
        const chunkStr = chunk.toString();
        console.log('--- SSE RECEIVED ---');
        console.log(chunkStr);

        if (chunkStr.includes('"status":"connected"')) {
          gotConnectedMessage = true;
        }

        if (chunkStr.includes('New Support Ticket')) {
          gotNotificationMessage = true;
          console.log('✅ SUCCESS: Staff SSE stream successfully received the live support ticket notification!');
          finishTest(0);
        }
      });
    });

    sseReq.on('error', (err) => {
      console.error('SSE Connection error:', err.message);
      finishTest(1);
    });

    // 3. Wait for connection to establish, then trigger support ticket creation via API POST
    setTimeout(() => {
      if (!gotConnectedMessage) {
        console.warn('Warning: Still waiting for SSE connection acknowledgement...');
      }

      console.log('Simulating customer support ticket creation...');
      
      const postData = JSON.stringify({
        subject: 'Test Notification Ticket',
        description: 'Verify that staff is notified of new support tickets.'
      });

      const apiReq = http.request({
        hostname: 'localhost',
        port: PORT,
        path: '/api/support',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (apiRes) => {
        let responseBody = '';
        apiRes.on('data', (c) => { responseBody += c.toString(); });
        apiRes.on('end', () => {
          console.log(`API POST /api/support Response code: ${apiRes.statusCode}`);
          if (apiRes.statusCode !== 201) {
            console.error('API failed to create support ticket. Response:', responseBody);
            finishTest(1);
          } else {
            console.log('Support ticket successfully created via API.');
          }
        });
      });

      apiReq.on('error', (err) => {
        console.error('API Request error:', err.message);
        finishTest(1);
      });

      apiReq.write(postData);
      apiReq.end();
    }, 2000);

    // Timeout safety
    const timeoutId = setTimeout(() => {
      console.error('❌ TIMEOUT: Staff did not receive the support ticket notification over SSE stream in 12 seconds.');
      finishTest(1);
    }, 12000);

    async function finishTest(code) {
      clearTimeout(timeoutId);
      sseReq.destroy();
      await cleanupTestData();
      process.exit(code);
    }

  } catch (err) {
    console.error('Test execution failed:', err);
    await cleanupTestData();
    process.exit(1);
  }
}

runTest();
