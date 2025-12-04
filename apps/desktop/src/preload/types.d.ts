import type { electronAPI } from './index';

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}

export {};
