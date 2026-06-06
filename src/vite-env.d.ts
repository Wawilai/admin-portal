/// <reference types="vite/client" />

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
        }) => void;
        renderButton: (
          element: HTMLElement | null,
          options: {
            theme?: string;
            size?: string;
            width?: number;
            text?: string;
          },
        ) => void;
      };
    };
  };
}

interface ImportMetaEnv {
  readonly VITE_ADMIN_API_BASE_URL?: string;
  readonly VITE_APP_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
