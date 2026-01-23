import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/src/core/config";

let supabaseAdmin: ReturnType<typeof createClient> | null = null;
let cachedBucket: string | null = null;
let cachedUrl: string | null = null;

const getSupabaseUrl = () => {
  if (!cachedUrl) {
    cachedUrl = getRequiredEnv("SUPABASE_URL");
  }
  return cachedUrl;
};

export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    const supabaseServiceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    supabaseAdmin = createClient(getSupabaseUrl(), supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return supabaseAdmin;
};

export const getStorageBucket = () => {
  if (!cachedBucket) {
    cachedBucket = getRequiredEnv("STORAGE_BUCKET");
  }
  return cachedBucket;
};

export const buildPublicStorageUrl = (path: string) => {
  const baseUrl = getSupabaseUrl().replace(/\/$/, "");
  const storageBucket = getStorageBucket();
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${baseUrl}/storage/v1/object/public/${storageBucket}/${encodedPath}`;
};

export const extractStoragePath = (url: string) => {
  const baseUrl = getSupabaseUrl().replace(/\/$/, "");
  const storageBucket = getStorageBucket();
  const prefix = `${baseUrl}/storage/v1/object/public/${storageBucket}/`;
  if (!url.startsWith(prefix)) return null;
  return decodeURIComponent(url.slice(prefix.length));
};
