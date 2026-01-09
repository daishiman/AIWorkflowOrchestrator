/**
 * スライドプロジェクト操作
 * @module slide/slide-project
 */

import { SlideProject, SyncStatus } from "./types";
import path from "path";

/**
 * スライドプロジェクトを作成する
 * @param projectPath プロジェクトのルートパス
 * @returns 新規SlideProjectオブジェクト
 */
export const createSlideProject = (projectPath: string): SlideProject => {
  return {
    path: projectPath,
    structurePath: path.join(projectPath, "structure.md"),
    htmlPath: path.join(projectPath, "index.html"),
    syncStatus: "synced",
    lastSyncAt: null,
  };
};

/**
 * 同期状態を取得する
 * @param project スライドプロジェクト
 * @returns 同期状態
 */
export const getSyncStatus = (project: SlideProject): SyncStatus => {
  return project.syncStatus;
};

/**
 * 同期状態を更新する
 * @param project スライドプロジェクト
 * @param status 新しい同期状態
 * @returns 更新されたSlideProject
 */
export const updateSyncStatus = (
  project: SlideProject,
  status: SyncStatus,
): SlideProject => {
  return {
    ...project,
    syncStatus: status,
    lastSyncAt: status === "synced" ? new Date() : project.lastSyncAt,
  };
};

/**
 * プロジェクトパスが有効かどうかを検証する
 * @param projectPath プロジェクトパス
 * @returns 有効な場合true
 */
export const isValidProjectPath = (projectPath: string): boolean => {
  if (!projectPath || typeof projectPath !== "string") {
    return false;
  }
  // 絶対パスであることを確認
  return path.isAbsolute(projectPath);
};
