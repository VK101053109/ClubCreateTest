const { createClient } = window.supabase;
const SUPABASE_URL = "https://supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_nTShRZ7xR5NJalUeD4VCaQ_e-0LxqW3";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
window.supabase = supabaseClient;
window.supabaseClient = supabaseClient;
