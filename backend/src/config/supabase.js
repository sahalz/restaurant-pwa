import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const isPlaceholder = !supabaseUrl || 
                      supabaseUrl === 'your_supabase_project_url' || 
                      !supabaseKey || 
                      supabaseKey === 'your_supabase_anon_key' || 
                      supabaseKey === 'your_supabase_service_role_key';

if (isPlaceholder) {
  console.warn('Warning: Supabase credentials are not fully configured in your .env file. Running in Mock fallback mode.');
}

export const supabase = createClient(
  isPlaceholder ? 'https://placeholder-project.supabase.co' : supabaseUrl,
  isPlaceholder ? 'placeholder-key' : supabaseKey
);

export const getAdminClient = () => {
  return createClient(
    isPlaceholder ? 'https://placeholder-project.supabase.co' : supabaseUrl,
    isPlaceholder ? 'placeholder-key' : supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
};
