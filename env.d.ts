/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEWSAPI_KEY: string;
  // add other custom VITE_ variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
