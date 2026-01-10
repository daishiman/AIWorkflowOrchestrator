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
  /** index.html変更時のコールバックを登録（逆同期用） */
  onHtmlChange(callback: (path: string) => void): void;
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
  const structureCallbacks: Array<(path: string) => void> = [];
  const htmlCallbacks: Array<(path: string) => void> = [];
  const changeContextMap = new Map<string, ChangeContext>();

  /**
   * スキル起因の変更かどうかをチェックする
   */
  const isSkillOriginatedChange = (filePath: string): boolean => {
    const context = changeContextMap.get(filePath);
    const now = Date.now();

    const isSkillChange =
      context?.source === "skill" &&
      now - context.timestamp < CHANGE_CONTEXT_TTL;

    if (isSkillChange) {
      // スキル起因の変更は無視（無限ループ防止）
      changeContextMap.delete(filePath);
      return true;
    }

    return false;
  };

  /**
   * 変更イベントを処理する
   * 無限ループ防止のため、スキル起因の変更は無視する
   */
  const handleChange = (filePath: string): void => {
    // スキル起因の変更かどうかをチェック
    if (isSkillOriginatedChange(filePath)) {
      return;
    }

    // ファイルの種類に応じてコールバックを実行
    if (filePath.endsWith("structure.md")) {
      structureCallbacks.forEach((cb) => cb(filePath));
    } else if (filePath.endsWith("index.html")) {
      htmlCallbacks.forEach((cb) => cb(filePath));
    }
  };

  return {
    projectPath,

    get watcher() {
      return watcher;
    },

    start() {
      const structurePath = `${projectPath}/structure.md`;
      const htmlPath = `${projectPath}/index.html`;

      // structure.mdとindex.html両方を監視
      watcher = chokidar.watch([structurePath, htmlPath], {
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
      structureCallbacks.length = 0;
      htmlCallbacks.length = 0;
      changeContextMap.clear();
    },

    onStructureChange(callback) {
      structureCallbacks.push(callback);
    },

    onHtmlChange(callback) {
      htmlCallbacks.push(callback);
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
