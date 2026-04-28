// API utility to handle both development and production environments
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to construct full API URL
export function getApiUrl(path) {
  // In development with Vite proxy, use relative paths
  // In production (Vercel), use full URL from environment variable
  if (import.meta.env.DEV) {
    return path; // Vite proxy will handle this
  }
  // In production, prepend the API base URL
  return `${API_BASE}${path}`;
}

// Export API_BASE for direct use if needed
export { API_BASE };
