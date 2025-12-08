/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_OTHER?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface Window {
  importMetaEnv: ImportMetaEnv;
}

