import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project-id') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your_anon_key')
);

// Initialize Supabase Client with Anon Key (Client-side safe for Vercel)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Upload an inspection image directly to Supabase Storage (Bucket: 'inspection-images')
 */
export async function uploadImageToSupabaseStorage(base64OrFile, customName) {
  if (!isSupabaseConfigured) {
    console.warn('[Supabase Client] Supabase is not fully configured. Storing in local state.');
    return { error: null, publicUrl: null, path: null };
  }

  try {
    const filename = customName || `inspection_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    let fileBlob;

    if (typeof base64OrFile === 'string' && base64OrFile.startsWith('data:')) {
      const res = await fetch(base64OrFile);
      fileBlob = await res.blob();
    } else {
      fileBlob = base64OrFile;
    }

    const { data, error } = await supabase.storage
      .from('inspection-images')
      .upload(filename, fileBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('[Supabase Storage Upload Error]', error.message);
      return { error, publicUrl: null, path: null };
    }

    const { data: publicData } = supabase.storage
      .from('inspection-images')
      .getPublicUrl(data.path);

    return { error: null, publicUrl: publicData.publicUrl, path: data.path };
  } catch (err) {
    console.error('[Supabase Storage Exception]', err);
    return { error: err, publicUrl: null, path: null };
  }
}

export default supabase;
