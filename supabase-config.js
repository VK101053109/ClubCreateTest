// Supabase configuration
const supabaseConfig = {
    url: "https://pldgzajfnrdbphhresty.supabase.co",
    publishableKey: "sb_publishable_nTShRZ7xR5NJalUeD4VCaQ_e-0LxqW3"
};

// Start Supabase
const supabaseClient = supabase.createClient(
    supabaseConfig.url,
    supabaseConfig.publishableKey
);
