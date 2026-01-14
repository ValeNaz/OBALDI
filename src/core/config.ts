export const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required.`);
  }
  return value;
};

export const getAppBaseUrl = () => {
  const url = getRequiredEnv("APP_BASE_URL");
  return url.endsWith("/") ? url.slice(0, -1) : url;
};
