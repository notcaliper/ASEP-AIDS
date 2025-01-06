export const config = {
  // Default to localhost during development
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
};