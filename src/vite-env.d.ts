/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPORTS_API_KEY: string;
  // add other VITE_ keys as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
