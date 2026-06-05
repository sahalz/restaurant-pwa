import 'dotenv/config';
import { supabase } from './src/config/supabase.js';

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('Target URL:', process.env.SUPABASE_URL);

  try {
    // Attempt to fetch any record from the categories table (lowercase)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(4);

    if (error) {
      console.error('❌ Connection failed with database error:');
      console.error(error);
      process.exit(1);
    }

    console.log('✅ Connection successful!');
    console.log('Database returned categories:', data);
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed with unexpected error:');
    console.error(err);
    process.exit(1);
  }
}

testConnection();
