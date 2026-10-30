import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_SERVICE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 'placeholder-service-key';

export const isSupabaseConfigured = Boolean(
  (process.env.SUPABASE_SERVICE_URL || process.env.SUPABASE_URL) &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project') &&
  process.env.SUPABASE_ANON_KEY &&
  !supabaseAnonKey.includes('placeholder')
);

export const isSupabaseAdminConfigured = Boolean(
  isSupabaseConfigured &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !supabaseServiceRoleKey.includes('placeholder')
);

// 1. Client using Anon Key (matches public / client access)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// 2. Client using Service Role Key (Admin privileges on Render backend, bypasses RLS safely on server)
export const supabaseAdmin = createClient(
  supabaseUrl,
  isSupabaseAdminConfigured ? supabaseServiceRoleKey : supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in environment (.env).'
    };
  }

  try {
    const { data, error } = await supabaseAdmin.from('scans').select('count', { count: 'exact', head: true });
    if (error) {
      // Table might not exist yet if schema was not run, but connection reached
      return {
        connected: true,
        schemaReady: false,
        message: `Connected to Supabase project, but query returned: ${error.message}`
      };
    }
    return {
      connected: true,
      schemaReady: true,
      message: 'Successfully connected to Supabase database.'
    };
  } catch (err) {
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${err.message}`
    };
  }
}

/**
 * Upload an inspection image to Supabase Storage Bucket ('inspection-images')
 */
export async function uploadImageToSupabase(base64Data, filename) {
  if (!isSupabaseAdminConfigured) {
    return null;
  }

  try {
    const name = filename || `scan_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const { data, error } = await supabaseAdmin.storage
      .from('inspection-images')
      .upload(name, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.warn('[Supabase Storage Warning]', error.message);
      return null;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('inspection-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('[Supabase Storage Error]', err.message);
    return null;
  }
}

export default {
  supabaseClient,
  supabaseAdmin,
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  testSupabaseConnection,
  uploadImageToSupabase
};
