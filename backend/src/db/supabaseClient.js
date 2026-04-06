import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key is missing in environment variables');
}

// Ensure backend uses service_role key to bypass RLS and perform admin operations.
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
