import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
export const electronAPI = {
  // App info
  getVersion: (): string => process.env.npm_package_version || "1.0.0",

  // Platform info
  platform: process.platform,

  // IPC communication (type-safe channels will be added here)
  invoke: (channel: string, ...args: unknown[]): Promise<unknown> => {
    const validChannels = ["app:getVersion", "db:query"];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },

  on: (
    channel: string,
    callback: (...args: unknown[]) => void,
  ): (() => void) => {
    const validChannels = ["app:update-available", "app:update-downloaded"];
    if (validChannels.includes(channel)) {
      const subscription = (
        _event: Electron.IpcRendererEvent,
        ...args: unknown[]
      ): void => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    return () => {};
  },
};

// Use contextBridge APIs to expose Electron APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electronAPI", electronAPI);
  } catch (error) {
    console.error("Failed to expose electronAPI:", error);
  }
} else {
  // @ts-ignore window.electronAPI is defined in preload
  window.electronAPI = electronAPI;
}
