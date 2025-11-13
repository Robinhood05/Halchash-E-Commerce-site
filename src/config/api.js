// API Base URL - Production: https://halchash.great-site.net
// For local development, create a .env file in the root directory with:
// VITE_API_BASE_URL=http://localhost/halchash/backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://halchash.great-site.net';
