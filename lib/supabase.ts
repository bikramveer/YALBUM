// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { createClient } from "@supabase/supabase-js";

// // =====================================================
// // SUPABASE CLIENT
// // =====================================================
// // This file creates the Supabase client that connects
// // your app to your Supabase database, auth, and storage
// // =====================================================

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export function getSupabaseClient() {
//     return createClientComponentClient();
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//     auth: {
//         persistSession: true,       // keep user logged in
//         autoRefreshToken: true,     // automatically refresh aut tokens
//         detectSessionInUrl: true,   // handle OAuth redirects
//     }
// })


// Pre-Error version
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// export const supabase = createClientComponentClient();

import { createBrowserClient } from '@supabase/ssr'
 
// =====================================================
// SUPABASE CLIENT
// =====================================================
// This file creates the Supabase client that connects
// your app to your Supabase database, auth, and storage
// =====================================================
 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)