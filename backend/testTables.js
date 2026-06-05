import 'dotenv/config';
import { supabase } from './src/config/supabase.js';

async function testTables() {
  const tablesToCheck = [
    { capital: 'MenuItems', lower: 'menu_items' },
    { capital: 'CartItems', lower: 'cart_items' },
    { capital: 'OrderItems', lower: 'order_items' },
    { capital: 'DeliveryTracking', lower: 'delivery_tracking' },
    { capital: 'RefundRequests', lower: 'refund_requests' },
    { capital: 'SupportTickets', lower: 'support_tickets' },
    { capital: 'Complaints', lower: 'complaints' }
  ];

  console.log('Checking table names in database...');

  for (const table of tablesToCheck) {
    // Try Capitalized
    const { error: capError } = await supabase.from(table.capital).select('*').limit(1);
    const capExists = !capError || capError.code !== 'PGRST205';

    // Try Lowercase
    const { error: lowError } = await supabase.from(table.lower).select('*').limit(1);
    const lowExists = !lowError || lowError.code !== 'PGRST205';

    console.log(`- ${table.capital} (Capitalized): ${capExists ? '✅ Found' : '❌ Not Found'} (${capError?.code || 'OK'})`);
    console.log(`- ${table.lower} (Lowercase): ${lowExists ? '✅ Found' : '❌ Not Found'} (${lowError?.code || 'OK'})`);
    console.log('---');
  }
  process.exit(0);
}

testTables();
