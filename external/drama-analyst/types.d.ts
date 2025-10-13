/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_MODEL?: string;
  // أضف متغيرات بيئة أخرى حسب الحاجة
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
