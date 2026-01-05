/**
 * テストヘルパー関数
 * Zustandストアモックと共通ユーティリティ
 */
import type { StoreApi, UseBoundStore } from "zustand";

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;

/**
 * Zustandストアをモック値で上書き
 * @param useStore - Zustandストアフック
 * @param mockState - モック状態
 * @returns リセット関数
 */
export function mockStore<T extends object>(
  useStore: UseBoundStore<StoreApi<T>>,
  mockState: Partial<T>,
): () => void {
  const originalState = useStore.getState();
  const setState = useStore.setState as SetState<T>;

  setState(mockState);

  return () => {
    setState(originalState);
  };
}

/**
 * ストアを初期状態にリセット
 * @param useStore - Zustandストアフック
 * @param initialState - 初期状態
 */
export function resetStore<T extends object>(
  useStore: UseBoundStore<StoreApi<T>>,
  initialState: T,
): void {
  const setState = useStore.setState as SetState<T>;
  setState(initialState);
}

/**
 * 非同期処理を待機
 * @param ms - 待機時間（ミリ秒）
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Promise が解決されるまで待機し、レンダリングを更新
 * act() でラップされた待機
 */
export async function waitForAsync(): Promise<void> {
  await wait(0);
}

/**
 * モックIPC呼び出しを作成
 * @param responses - チャネルごとのレスポンスマップ
 */
export function createMockIpc(
  responses: Record<string, unknown>,
): (channel: string, ...args: unknown[]) => Promise<unknown> {
  return async (channel: string) => {
    if (channel in responses) {
      return responses[channel];
    }
    throw new Error(`Unexpected IPC call: ${channel}`);
  };
}

/**
 * エラーをスローするモックIPC
 * @param channel - エラーチャネル
 * @param error - スローするエラー
 */
export function createErrorIpc(
  channel: string,
  error: Error,
): (ch: string) => Promise<never> {
  return async (ch: string) => {
    if (ch === channel) {
      throw error;
    }
    throw new Error(`Unexpected IPC call: ${ch}`);
  };
}
