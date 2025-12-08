// utils/env.ts
export const API_URL = window.__ENV__?.VITE_API_URL ?? import.meta.env.VITE_API_URL;
export const SSE_URL = window.__ENV__?.VITE_SSE_URL ?? import.meta.env.VITE_SSE_URL;

