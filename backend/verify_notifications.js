import http from 'http';
import jwt from 'jsonwebtoken';
import { getAdminClient } from './src/config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'restaurant_pwa_secret_key_jwt_token_signing';
const PORT = process.env.PORT || 5000;

// Test user details
const testUserId = '00000000-0000-0000-0000-111111111111';

// Create a test user in DB if it doesn't exist
async function ensureTestUser() {
  const supabase = getAdminClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', testUserId)
    .maybeSingle();

  if (error) {
    console.error('Error checking test user:', error.message);
    process.exit(1);
  }

  if (!user) {
    console.log('Creating mock test user in database...');
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        name: 'SSE Verification User',
        email: 'sse-test@example.com',
        phone: '1234567890',
        role: 'customer'
      });

    if (insertError) {
      console.error('Failed to create test user:', insertError.message);
      process.exit(1);
    }
  }
}

async function runVerification() {
  await ensureTestUser();

  // 1. Generate JWT for the test user
  const token = jwt.sign(
    { id: testUserId, email: 'sse-test@example.com', role: 'customer' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log('Test JWT token generated.');

  // 2. Connect to the SSE endpoint
  const url = `http://localhost:${PORT}/api/notifications/stream?token=${encodeURIComponent(token)}`;
  console.log(`Connecting to SSE stream at: ${url}`);

  const req = http.get(url, (res) => {
    console.log(`SSE Response headers received. Status: ${res.statusCode}`);
    console.log('Headers:', JSON.stringify(res.headers));

    if (res.statusCode !== 200) {
      console.error('Failed to connect to SSE stream, status code:', res.statusCode);
      process.exit(1);
    }

    res.on('data', (chunk) => {
      const dataStr = chunk.toString();
      console.log('--- RECEIVED CHUNK ---');
      console.log(dataStr);

      if (dataStr.includes('Verification Successful')) {
        console.log('SUCCESS: SSE Stream successfully received the broadcasted notification!');
        cleanupAndExit();
      }
    });
  });

  req.on('error', (err) => {
    console.error('SSE connection error:', err.message);
    process.exit(1);
  });

  // 3. Wait 2 seconds for connection to establish, then trigger database insertion
  setTimeout(async () => {
    console.log('Triggering database notification insertion...');
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: testUserId,
        title: 'Verification Successful',
        message: 'This is a test notification confirming that Postgres-to-SSE is working!',
        type: 'support',
        is_read: false
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting notification to database:', error.message);
      cleanupAndExit(1);
    } else {
      console.log('Inserted notification record ID:', data.id);
    }
  }, 2000);

  // Timeout safety
  const timeoutId = setTimeout(() => {
    console.error('TIMEOUT: Did not receive the broadcasted notification in time.');
    cleanupAndExit(1);
  }, 12000);

  async function cleanupAndExit(code = 0) {
    clearTimeout(timeoutId);
    req.destroy();
    
    // Clean up test notifications and user
    try {
      console.log('Cleaning up test data...');
      const supabase = getAdminClient();
      await supabase.from('notifications').delete().eq('user_id', testUserId);
      await supabase.from('users').delete().eq('id', testUserId);
    } catch (e) {
      console.error('Failed to cleanup database:', e.message);
    }

    console.log('Done.');
    process.exit(code);
  }
}

runVerification();
