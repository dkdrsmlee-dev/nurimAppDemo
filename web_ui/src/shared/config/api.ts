const defaultDirectApiBaseUrl = 'http://192.168.0.147:4011';

const env = import.meta.env as ImportMetaEnv & {
  readonly VITE_API_BASE_URL?: string;
};

const configuredApiBaseUrl = env.VITE_API_BASE_URL?.trim() ?? '';

export const apiBaseUrl =
  configuredApiBaseUrl.replace(/\/$/, '') ||
  (import.meta.env.DEV ? '' : defaultDirectApiBaseUrl);

export function buildApiUrl(path: string) {
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}
