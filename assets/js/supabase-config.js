/* =========================================================
   KAISEI SANGYOU — Supabase configuration
   Create a FREE project at https://supabase.com/dashboard
   then paste your Project URL + anon key below.
   ========================================================= */

const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';

// Auto-detect whether keys are still placeholders
const AUTH_CONFIGURED = !SUPABASE_URL.includes('YOUR-PROJECT') && SUPABASE_ANON_KEY.length > 30;
