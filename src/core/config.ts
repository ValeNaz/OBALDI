export const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required.`);
  }
  return value;
};

export const getOptionalEnv = (key: string) => process.env[key] ?? null;

export const getAppBaseUrl = () => {
  const url = getRequiredEnv("APP_BASE_URL");
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

export const getSupabaseUrl = () => getRequiredEnv("SUPABASE_URL");
export const getSupabaseServiceRoleKey = () => getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
export const getStorageBucket = () => getRequiredEnv("STORAGE_BUCKET");

export const getAdminNotificationEmails = () => {
  const raw = getOptionalEnv("ADMIN_NOTIFICATION_EMAILS");
  if (!raw) return [];
  return raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
};
