const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

if (!env.supabase.url || !env.supabase.serviceRoleKey) {
  throw new Error('Supabase URL and Service Role Key are required.');
}

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = supabase;
