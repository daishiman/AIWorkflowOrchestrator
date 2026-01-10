/**
 * スライド依存関係管理システム - 公開API
 * @module slide
 */

// 型定義のエクスポート
export type {
  SlideProject,
  SyncStatus,
  SyncDirection,
  StructureChange,
  SkillPhase,
  SkillExecutionResult,
  WatcherConfig,
  ChangeContext,
  SlideErrorCode,
  SlideError,
  SlideResponse,
} from "./types";

// スライドプロジェクト操作のエクスポート
export {
  createSlideProject,
  getSyncStatus,
  updateSyncStatus,
  isValidProjectPath,
} from "./slide-project";

// 依存関係管理のエクスポート
export {
  calculateHash,
  checkDependency,
  fileExists,
  bothFilesExist,
} from "./dependency-manager";
