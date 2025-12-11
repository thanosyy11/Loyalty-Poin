import { createClient } from '@supabase/supabase-js';

// Fallback to empty string to prevent build errors during static generation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Missing Supabase environment variables! Check your .env.local or Vercel Settings.");
}

// Ini adalah "kunci" untuk membuka pintu database
// Gunakan placeholder jika kosong agar build tidak crash (Vercel Build Phase)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);