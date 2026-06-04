import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const isPlaceholder = !supabaseUrl || supabaseUrl === 'your_supabase_project_url' || !supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key';

if (isPlaceholder) {
  console.warn('Warning: Supabase credentials are not fully configured in your .env file. Running in Mock fallback mode.');
}

export const supabase = createClient(
  isPlaceholder ? 'https://placeholder-project.supabase.co' : supabaseUrl,
  isPlaceholder ? 'placeholder-key' : supabaseAnonKey
);
