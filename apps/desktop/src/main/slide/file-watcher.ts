/**
 * ファイルウォッチャー
 * structure.mdの変更を検知し、イベントを発火する
 * @module main/slide/file-watcher
 */

import chokidar, { FSWatcher } from "chokidar";
import type { WatcherConfig, ChangeContext, SkillPhase } from "@repo/shared";

/**
 * スライドウォッチャーインターフェース
 */
export interface SlideWatcher {
  /** プロジェクトパス */
  projectPath: string;
  /** ウォッチャーインスタンス */
  watcher: FSWatcher | null;
  /** 監視を開始する */
  start(): void;
  /** 監視を停止する */
  stop(): void;
  /** structure.md変更時のコールバックを登録 */
  onStructureChange(callback: (path: string) => void): void;
  /** スキル起因の変更としてマーク（無限ループ防止） */
  markAsSkillChange(path: string, phase: SkillPhase): void;
  /** 変更コンテキストをクリア */
  clearChangeContext(path: string): void;
}

/** デフォルトのウォッチャー設定 */
const DEFAULT_CONFIG: WatcherConfig = {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100,
  },
  ignored: ["**/node_modules/**", "**/.git/**"],
};

/** 変更コンテキストのTTL（ミリ秒） */
const CHANGE_CONTEXT_TTL = 1000;

/**
 * スライドウォッチャーを作成する
 * @param projectPath プロジェクトパス
 * @returns SlideWatcherインスタンス
 */
export const createSlideWatcher = (projectPath: string): SlideWatcher => {
  let watcher: FSWatcher | null = null;
  const callbacks: Array<(path: string) => void> = [];
  const changeContextMap = new Map<string, ChangeContext>();

  /**
   * 変更イベントを処理する
   * 無限ループ防止のため、スキル起因の変更は無視する
   */
  const handleChange = (filePath: string): void => {
    const context = changeContextMap.get(filePath);
    const now = Date.now();

    // スキル起因の変更かどうかをチェック
    const isSkillChange =
      context?.source === "skill" &&
      now - context.timestamp < CHANGE_CONTEXT_TTL;

    if (isSkillChange) {
      // スキル起因の変更は無視（無限ループ防止）
      changeContextMap.delete(filePath);
      return;
    }

    // ユーザー起因の変更としてコールバックを実行
    callbacks.forEach((cb) => cb(filePath));
  };

  return {
    projectPath,

    get watcher() {
      return watcher;
    },

    start() {
      const structurePath = `${projectPath}/structure.md`;
      watcher = chokidar.watch(structurePath, {
        persistent: DEFAULT_CONFIG.persistent,
        ignoreInitial: DEFAULT_CONFIG.ignoreInitial,
        awaitWriteFinish: DEFAULT_CONFIG.awaitWriteFinish,
        ignored: DEFAULT_CONFIG.ignored,
      });

      watcher.on("change", handleChange);
      watcher.on("error", (error) => {
        console.error("[SlideWatcher] Error:", error);
      });
    },

    stop() {
      if (watcher) {
        watcher.close();
        watcher = null;
      }
      callbacks.length = 0;
      changeContextMap.clear();
    },

    onStructureChange(callback) {
      callbacks.push(callback);
    },

    markAsSkillChange(path, phase) {
      changeContextMap.set(path, {
        source: "skill",
        timestamp: Date.now(),
        skillPhase: phase,
      });
    },

    clearChangeContext(path) {
      changeContextMap.delete(path);
    },
  };
};
