import axios from 'axios';


const envBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;

function readMetaTag(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const el = document.querySelector(`meta[name="${name}"]`);
  return el?.getAttribute('content') ?? null;
}

function readRuntimeConfig(): string | undefined {
  try {
    const globalAny = window as any;
    if (globalAny.__RUNTIME_CONFIG__ && typeof globalAny.__RUNTIME_CONFIG__.VITE_API_BASE_URL === 'string') {
      return globalAny.__RUNTIME_CONFIG__.VITE_API_BASE_URL;
    }
  } catch (e) {
    // ignore
  }
  return undefined;
}

let baseURL: string | undefined = envBaseUrl;

if (!baseURL) {
  // Try runtime-injected global config (useful for docker/nginx runtime replacement)
  baseURL = readRuntimeConfig();
}

if (!baseURL) {
  // Try meta tag: <meta name="api-base-url" content="https://..." />
  baseURL = readMetaTag('api-base-url') ?? undefined;
}

if (!baseURL) {
  // If in dev, fallback to origin and warn. In production, fallback silently to origin to avoid hard crash.
  if ((import.meta as any).env?.DEV && typeof window !== 'undefined') {
    console.warn('[axiosClient] Missing VITE_API_BASE_URL. Falling back to current origin for local development.');
  }
  if (typeof window !== 'undefined') {
    baseURL = window.location.origin;
  }
}

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
