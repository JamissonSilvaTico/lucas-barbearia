/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GEMINI_API_KEY: string;
  // Adicione outras variáveis VITE_ aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
