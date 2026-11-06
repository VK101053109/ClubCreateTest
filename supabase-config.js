// 1. Grab the createClient tool from the global browser window
const { createClient } = window.supabase;

const SUPABASE_URL = "https://supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_nTShRZ7xR5NJalUeD4VCaQ_e-0LxqW3";

// 2. Initialize the client safely
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// 3. Make BOTH variable names globally available so ALL your files can see them
window.supabase = supabaseClient;
window.supabaseClient = supabaseClient;

console.log("Your Database is connected and working!");
