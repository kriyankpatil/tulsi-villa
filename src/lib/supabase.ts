import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedAdminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  if (cachedAdminClient) return cachedAdminClient;
  cachedAdminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedAdminClient;
}

export async function createSignedStorageUrl(objectPath: string, expiresInSeconds = 300): Promise<string | null> {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(objectPath, expiresInSeconds);
  if (error) return null;
  return data?.signedUrl ?? null;
}


