import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('⚠️ Supabase 환경변수가 설정되지 않았습니다. .env.local 또는 Vercel 환경변수를 확인하세요.');
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');

export const isSupabaseConfigured = Boolean(url && key);
