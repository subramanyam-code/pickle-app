import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://hekxqweezkkwlmjvhvpc.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjRlM2RhMTZiLTNmYjYtNDllMS05OGZhLWRhOTZiY2UzMzM1ZSJ9.eyJwcm9qZWN0SWQiOiJoZWt4cXdlZXpra3dsbWp2aHZwYyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc0NTAzNTQ3LCJleHAiOjIwODk4NjM1NDcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.n00nKNrp-GzB77SYwISFaszE_l1pyedirUmepIDE3x4';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };