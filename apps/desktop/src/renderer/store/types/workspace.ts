/**
 * Workspace Domain Model Types
 *
 * このファイルは、ワークスペースマネージャー機能のドメインモデル型定義を提供します。
 * 設計書: docs/30-workflows/workspace-manager/task-step01-1-data-model.md (DM-WS-001)
 *
 * @module workspace
 */

import type { StateCreator } from "zustand";
import type { FileNode } from "../types";

// ============================================
// 値オブジェクト（Value Objects）
// ============================================

/**
 * ワークスペースの一意識別子
 * @description 単一ワークスペースのため、固定値 "default" を使用
 */
export type WorkspaceId = "default";

export const DEFAULT_WORKSPACE_ID: WorkspaceId = "default";

/**
 * フォルダエントリーの一意識別子
 * @description UUID v4形式、追加時に生成
 */
export type FolderId = string & { readonly __brand: "FolderId" };

/**
 * フォルダの絶対パス
 * @description macOSの絶対パス形式、正規化済み
 * @invariant "/" で始まる
 * @invariant 連続する "/" を含まない
 * @invariant パストラバーサル ("..") を含まない
 */
export type FolderPath = string & { readonly __brand: "FolderPath" };

/**
 * ファイルの一意識別子
 * @description ファイルの絶対パスをIDとして使用（既存FileNode互換）
 */
export type FileId = string & { readonly __brand: "FileId" };

// ============================================
// エンティティ（Entities）
// ============================================

/**
 * ワークスペースに追加されたフォルダのエントリー
 * @description フォルダの参照情報と表示状態を管理
 */
export interface FolderEntry {
  /** フォルダエントリーの一意識別子 */
  readonly id: FolderId;

  /** フォルダの絶対パス */
  readonly path: FolderPath;

  /** サイドバーに表示する名前（フォルダ名） */
  readonly displayName: string;

  /** フォルダが展開されているかどうか */
  isExpanded: boolean;

  /** 展開されているサブフォルダのパス一覧 */
  expandedPaths: Set<string>;

  /** ワークスペースへの追加日時 */
  readonly addedAt: Date;
}

// ============================================
// 集約（Aggregates）
// ============================================

/**
 * ワークスペース集約
 * @description 複数のフォルダエントリーを管理する集約ルート
 * @invariant 同一パスのフォルダは重複して追加できない
 */
export interface Workspace {
  /** ワークスペースID（単一ワークスペースのため固定値） */
  readonly id: WorkspaceId;

  /** 追加されたフォルダ一覧 */
  folders: FolderEntry[];

  /** 最後に選択されていたファイルのID */
  lastSelectedFileId: FileId | null;

  /** 作成日時 */
  readonly createdAt: Date;

  /** 更新日時 */
  updatedAt: Date;
}

// ============================================
// 永続化用シリアライズ形式
// ============================================

/**
 * ワークスペース状態の永続化形式
 * @description localStorage/electron-storeに保存する形式
 */
export interface PersistedWorkspaceState {
  /** スキーマバージョン（マイグレーション用） */
  version: 1;

  /** 追加されたフォルダ一覧 */
  folders: PersistedFolderEntry[];

  /** 最後に選択されていたファイルパス */
  lastSelectedFilePath: string | null;

  /** 最終更新日時 */
  updatedAt: string; // ISO 8601形式
}

export interface PersistedFolderEntry {
  /** フォルダID */
  id: string;

  /** フォルダの絶対パス */
  path: string;

  /** 表示名 */
  displayName: string;

  /** 展開状態 */
  isExpanded: boolean;

  /** 展開されているサブフォルダのパス一覧 */
  expandedPaths: string[];

  /** 追加日時 */
  addedAt: string; // ISO 8601形式
}

// ============================================
// WorkspaceSlice（Zustand スライス）
// ============================================

/**
 * ワークスペーススライスの状態とアクション
 */
export interface WorkspaceSlice {
  // State
  workspace: Workspace;
  folderFileTrees: Map<FolderId, FileNode[]>;
  workspaceIsLoading: boolean;
  workspaceError: string | null;

  // Actions
  loadWorkspace: () => Promise<void>;
  saveWorkspace: () => Promise<void>;
  addFolder: () => Promise<void>;
  removeFolder: (folderId: FolderId) => void;
  toggleFolderExpansion: (folderId: FolderId) => void;
  toggleSubfolder: (folderId: FolderId, subfolderPath: string) => void;
  setWorkspaceSelectedFile: (fileId: FileId | null) => void;
  loadFolderTree: (folderId: FolderId, folderPath: FolderPath) => Promise<void>;
}

/**
 * Zustand StateCreator型
 */
export type WorkspaceSliceCreator = StateCreator<
  WorkspaceSlice,
  [],
  [],
  WorkspaceSlice
>;

// ============================================
// ドメインエラー
// ============================================

/**
 * 無効なパスエラー
 */
export class InvalidPathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPathError";
  }
}

/**
 * 重複フォルダエラー
 */
export class DuplicateFolderError extends Error {
  constructor(path: FolderPath | string) {
    super(`フォルダは既に追加されています: ${path}`);
    this.name = "DuplicateFolderError";
  }
}

/**
 * フォルダ未検出エラー
 */
export class FolderNotFoundError extends Error {
  constructor(id: FolderId | string) {
    super(`フォルダが見つかりません: ${id}`);
    this.name = "FolderNotFoundError";
  }
}

// ============================================
// ファクトリ関数
// ============================================

/**
 * FolderIdを生成する
 * @returns UUID v4形式のFolderId
 */
export function createFolderId(): FolderId {
  return crypto.randomUUID() as FolderId;
}

/**
 * 文字列がFolderIdかどうかを検証する
 */
export function isFolderId(value: string): value is FolderId {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * パスを正規化する
 * @param path 正規化前のパス
 * @returns 正規化されたパス
 */
function normalizePath(path: string): string {
  // 連続スラッシュを単一に、末尾スラッシュを除去
  return path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

/**
 * FolderPathを作成する
 * @param rawPath 生のパス文字列
 * @returns 正規化されたFolderPath
 * @throws InvalidPathError パスが無効な場合
 */
export function createFolderPath(rawPath: string): FolderPath {
  const normalized = normalizePath(rawPath);

  // 絶対パスチェック
  if (!normalized.startsWith("/")) {
    throw new InvalidPathError(
      `パスは絶対パスである必要があります: ${rawPath}`,
    );
  }

  // パストラバーサルチェック
  if (normalized.includes("..")) {
    throw new InvalidPathError(
      `パストラバーサルは許可されていません: ${rawPath}`,
    );
  }

  return normalized as FolderPath;
}

/**
 * FileIdを作成する
 * @param filePath ファイルパス
 * @returns FileId
 */
export function createFileId(filePath: string): FileId {
  return filePath as FileId;
}

/**
 * 空のワークスペースを作成する
 * @returns 新しいWorkspace
 */
export function createWorkspace(): Workspace {
  const now = new Date();
  return {
    id: DEFAULT_WORKSPACE_ID,
    folders: [],
    lastSelectedFileId: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * フォルダエントリーを作成する
 * @param path フォルダパス
 * @returns 新しいFolderEntry
 */
export function createFolderEntry(path: FolderPath): FolderEntry {
  const displayName = path.split("/").pop() || path;
  return {
    id: createFolderId(),
    path,
    displayName,
    isExpanded: false,
    expandedPaths: new Set(),
    addedAt: new Date(),
  };
}

/**
 * ワークスペースにフォルダを追加する
 * @param workspace 現在のワークスペース
 * @param folderPath 追加するフォルダのパス
 * @returns 更新されたWorkspace
 * @throws DuplicateFolderError 同一パスが既に存在する場合
 */
export function addFolderToWorkspace(
  workspace: Workspace,
  folderPath: FolderPath,
): Workspace {
  // 重複チェック
  if (workspace.folders.some((f) => f.path === folderPath)) {
    throw new DuplicateFolderError(folderPath);
  }

  const newEntry = createFolderEntry(folderPath);
  return {
    ...workspace,
    folders: [...workspace.folders, newEntry],
    updatedAt: new Date(),
  };
}

/**
 * ワークスペースからフォルダを削除する
 * @param workspace 現在のワークスペース
 * @param folderId 削除するフォルダのID
 * @returns 更新されたWorkspace
 * @throws FolderNotFoundError フォルダが見つからない場合
 */
export function removeFolderFromWorkspace(
  workspace: Workspace,
  folderId: FolderId,
): Workspace {
  const filtered = workspace.folders.filter((f) => f.id !== folderId);
  if (filtered.length === workspace.folders.length) {
    throw new FolderNotFoundError(folderId);
  }

  return {
    ...workspace,
    folders: filtered,
    updatedAt: new Date(),
  };
}

// ============================================
// シリアライズ/デシリアライズ関数
// ============================================

/**
 * Workspaceを永続化形式に変換
 * @param workspace ワークスペース
 * @returns 永続化用のDTO
 */
export function serializeWorkspace(
  workspace: Workspace,
): PersistedWorkspaceState {
  return {
    version: 1,
    folders: workspace.folders.map((f) => ({
      id: f.id,
      path: f.path,
      displayName: f.displayName,
      isExpanded: f.isExpanded,
      expandedPaths: Array.from(f.expandedPaths),
      addedAt: f.addedAt.toISOString(),
    })),
    lastSelectedFilePath: workspace.lastSelectedFileId,
    updatedAt: workspace.updatedAt.toISOString(),
  };
}

/**
 * 永続化形式からWorkspaceを復元
 * @param persisted 永続化された状態
 * @returns ワークスペースと警告メッセージ
 */
export function deserializeWorkspace(persisted: PersistedWorkspaceState): {
  workspace: Workspace;
  warnings: string[];
} {
  const warnings: string[] = [];
  const folders: FolderEntry[] = [];

  for (const pf of persisted.folders) {
    try {
      const path = createFolderPath(pf.path);
      folders.push({
        id: pf.id as FolderId,
        path,
        displayName: pf.displayName,
        isExpanded: pf.isExpanded,
        expandedPaths: new Set(pf.expandedPaths),
        addedAt: new Date(pf.addedAt),
      });
    } catch {
      warnings.push(`無効なパスをスキップしました: ${pf.path}`);
    }
  }

  const workspace: Workspace = {
    id: DEFAULT_WORKSPACE_ID,
    folders,
    lastSelectedFileId: persisted.lastSelectedFilePath as FileId | null,
    createdAt: new Date(),
    updatedAt: new Date(persisted.updatedAt),
  };

  return { workspace, warnings };
}
