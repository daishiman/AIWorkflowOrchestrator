import { useAppStore } from "@/renderer/store";

/**
 * 全 surface から実行コンソールを開く共有 action。
 * source of truth として唯一のエントリポイント。
 */
export function openExecutionConsole(): void {
  useAppStore.getState().setCurrentView("executionConsole");
}
