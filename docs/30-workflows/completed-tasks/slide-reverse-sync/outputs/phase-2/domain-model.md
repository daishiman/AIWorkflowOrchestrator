# ドメインモデル設計書 - index.html→structure.md 逆同期機能

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| 機能名   | slide-reverse-sync               |
| タスクID | task-feat-slide-reverse-sync-001 |
| 作成日   | 2026-01-10                       |
| Phase    | 2                                |
| スキル   | domain-modeling                  |

---

## 1. ドメイン概要

### 1.1 ユビキタス言語

| 用語                 | 定義                                                        |
| -------------------- | ----------------------------------------------------------- |
| スライドプロジェクト | structure.mdとindex.htmlを含むプロジェクトディレクトリ      |
| 設計図               | structure.md - スライドの構造を定義するマークダウンファイル |
| 実装                 | index.html - 実際のスライドHTMLファイル                     |
| 順方向同期           | structure.md → index.html への変換・同期                    |
| 逆同期               | index.html → structure.md への変換・同期                    |
| 差分解析             | 変更前後の内容を比較し、意味的な差分を抽出する処理          |
| 無限ループ防止       | 同期による変更が連鎖的な同期を引き起こさない仕組み          |
| 変更コンテキスト     | 変更の発生源（ユーザー or スキル）を追跡する情報            |

### 1.2 境界付けられたコンテキスト

```
┌─────────────────────────────────────────────────────────────────────┐
│                  Slide Dependency Management Context                  │
│                                                                       │
│  ┌─────────────────────┐    ┌─────────────────────┐                  │
│  │  File Watching      │    │   Synchronization   │                  │
│  │  Subdomain          │    │   Subdomain         │                  │
│  │                     │    │                     │                  │
│  │  - FileWatcher      │───▶│  - SyncManager      │                  │
│  │  - ChangeContext    │    │  - SyncDirection    │                  │
│  │                     │    │  - SyncStatus       │                  │
│  └─────────────────────┘    └──────────┬──────────┘                  │
│                                        │                              │
│                                        ▼                              │
│                            ┌─────────────────────┐                   │
│                            │   Skill Execution   │                   │
│                            │   Subdomain         │                   │
│                            │                     │                   │
│                            │  - SkillExecutor    │                   │
│                            │  - ModifierSkill    │                   │
│                            │  - HtmlSkill        │                   │
│                            └─────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Agent SDK Context (外部)                         │
│                                                                       │
│  - Claude Agent SDK                                                   │
│  - AI解析サービス                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. エンティティ（Entity）

### 2.1 SlideProject（集約ルート）

**説明**: スライドプロジェクトを表す集約ルート。structure.mdとindex.htmlの状態を管理する。

```typescript
/**
 * スライドプロジェクト集約ルート
 */
interface SlideProject {
  /** プロジェクトの一意識別子（ディレクトリパス） */
  readonly id: string;

  /** プロジェクトのパス */
  readonly path: string;

  /** structure.mdのパス */
  readonly structurePath: string;

  /** index.htmlのパス */
  readonly htmlPath: string;

  /** 現在の同期状態 */
  syncStatus: SyncStatus;

  /** 最終同期日時 */
  lastSyncedAt: Date | null;

  /** 監視状態 */
  isWatching: boolean;
}
```

**同一性**: パス（path）で識別

---

### 2.2 FileChange

**説明**: ファイルの変更を表すエンティティ。

```typescript
/**
 * ファイル変更エンティティ
 */
interface FileChange {
  /** 変更の一意識別子 */
  readonly id: string;

  /** 変更されたファイルのパス */
  readonly filePath: string;

  /** 変更の種別 */
  readonly changeType: FileChangeType;

  /** 変更発生日時 */
  readonly timestamp: Date;

  /** 変更の発生源 */
  readonly source: ChangeSource;

  /** 関連するスキルフェーズ（スキル起因の場合） */
  readonly skillPhase?: SkillPhase;
}

type FileChangeType = "structure" | "html";
type ChangeSource = "user" | "skill";
```

**同一性**: id（UUID）で識別

---

### 2.3 SyncOperation

**説明**: 同期操作を表すエンティティ。

```typescript
/**
 * 同期操作エンティティ
 */
interface SyncOperation {
  /** 操作の一意識別子 */
  readonly id: string;

  /** 対象プロジェクト */
  readonly projectPath: string;

  /** 同期方向 */
  readonly direction: SyncDirection;

  /** 操作状態 */
  status: OperationStatus;

  /** 進捗（0-100） */
  progress: number;

  /** 開始日時 */
  readonly startedAt: Date;

  /** 完了日時 */
  completedAt?: Date;

  /** エラー情報 */
  error?: OperationError;
}

type SyncDirection = "forward" | "reverse";
type OperationStatus =
  | "pending"
  | "executing"
  | "completed"
  | "failed"
  | "cancelled";

interface OperationError {
  code: string;
  message: string;
  retryCount: number;
}
```

**同一性**: id（UUID）で識別

---

## 3. 値オブジェクト（Value Object）

### 3.1 SyncStatus

**説明**: 同期状態を表す値オブジェクト。

```typescript
/**
 * 同期状態値オブジェクト
 */
type SyncStatus = "synced" | "out-of-sync" | "syncing" | "error";

/**
 * 同期状態の詳細情報
 */
interface SyncStatusDetail {
  readonly status: SyncStatus;
  readonly progress: number;
  readonly error?: string;
  readonly direction?: SyncDirection;
  readonly lastCheckedAt: Date;
}
```

**等価性**: status値で比較

---

### 3.2 ChangeContext

**説明**: 変更のコンテキスト情報を表す値オブジェクト。

```typescript
/**
 * 変更コンテキスト値オブジェクト
 */
interface ChangeContext {
  readonly source: ChangeSource;
  readonly timestamp: number;
  readonly skillPhase?: SkillPhase;
}

// 生成関数
const createChangeContext = (
  source: ChangeSource,
  skillPhase?: SkillPhase,
): ChangeContext => ({
  source,
  timestamp: Date.now(),
  skillPhase,
});
```

**等価性**: 全プロパティで比較

---

### 3.3 FilePath

**説明**: ファイルパスを表す値オブジェクト。バリデーション付き。

```typescript
/**
 * ファイルパス値オブジェクト
 */
interface FilePath {
  readonly value: string;
  readonly isAbsolute: boolean;
  readonly extension: string;
  readonly directory: string;
  readonly filename: string;
}

// 生成関数（バリデーション付き）
const createFilePath = (path: string): FilePath => {
  if (!path || typeof path !== "string") {
    throw new Error("Invalid file path");
  }

  // パストラバーサル防止
  if (path.includes("..")) {
    throw new Error("Path traversal detected");
  }

  return {
    value: path,
    isAbsolute: path.startsWith("/"),
    extension: path.split(".").pop() || "",
    directory: path.substring(0, path.lastIndexOf("/")),
    filename: path.substring(path.lastIndexOf("/") + 1),
  };
};
```

**等価性**: value値で比較

---

### 3.4 DiffResult

**説明**: 差分解析結果を表す値オブジェクト。

```typescript
/**
 * 差分解析結果値オブジェクト
 */
interface DiffResult {
  readonly changes: readonly StructureChange[];
  readonly summary: string;
  readonly analyzedAt: Date;
}

interface StructureChange {
  readonly type: "add" | "modify" | "remove";
  readonly section: string;
  readonly content: string;
  readonly lineNumber?: number;
}
```

**等価性**: 全changesで比較

---

## 4. 集約（Aggregate）

### 4.1 SlideProject集約

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SlideProject Aggregate                           │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    SlideProject (Root)                           │ │
│  │                                                                   │ │
│  │  - id: string                                                     │ │
│  │  - path: string                                                   │ │
│  │  - syncStatus: SyncStatus                                         │ │
│  │  - lastSyncedAt: Date | null                                      │ │
│  │  - isWatching: boolean                                            │ │
│  │                                                                   │ │
│  │  + startWatching(): void                                          │ │
│  │  + stopWatching(): void                                           │ │
│  │  + updateSyncStatus(status: SyncStatus): void                     │ │
│  │  + markAsSynced(): void                                           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Invariants:                                                          │
│  - structure.mdとindex.htmlが存在する場合のみ有効                      │
│  - syncStatusは定義された状態遷移に従う                                │
│  - lastSyncedAtはsyncedになった時のみ更新                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 SyncOperation集約

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SyncOperation Aggregate                           │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                   SyncOperation (Root)                           │ │
│  │                                                                   │ │
│  │  - id: string                                                     │ │
│  │  - projectPath: string                                            │ │
│  │  - direction: SyncDirection                                       │ │
│  │  - status: OperationStatus                                        │ │
│  │  - progress: number                                               │ │
│  │                                                                   │ │
│  │  + start(): void                                                  │ │
│  │  + updateProgress(progress: number): void                         │ │
│  │  + complete(): void                                               │ │
│  │  + fail(error: OperationError): void                              │ │
│  │  + cancel(): void                                                 │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Invariants:                                                          │
│  - progressは0-100の範囲                                              │
│  - statusは定義された状態遷移に従う                                    │
│  - completedAtはcompleted/failed/cancelledになった時のみ設定          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. ドメインサービス

### 5.1 SyncCoordinator

**責務**: 順方向・逆方向の同期処理を調整する

```typescript
/**
 * 同期コーディネーターサービス
 */
interface SyncCoordinator {
  /**
   * 順方向同期を実行する
   * @param projectPath プロジェクトパス
   */
  executeForwardSync(projectPath: string): Promise<SyncResult>;

  /**
   * 逆方向同期を実行する
   * @param projectPath プロジェクトパス
   */
  executeReverseSync(projectPath: string): Promise<SyncResult>;

  /**
   * 同期をキャンセルする
   */
  cancel(): void;

  /**
   * 現在の同期状態を取得する
   */
  getCurrentStatus(projectPath: string): Promise<SyncStatusDetail>;
}

interface SyncResult {
  success: boolean;
  direction: SyncDirection;
  duration: number;
  error?: string;
}
```

---

### 5.2 DiffAnalyzer

**責務**: HTMLの差分を解析し、structure.md形式に変換する

```typescript
/**
 * 差分解析サービス
 */
interface DiffAnalyzer {
  /**
   * HTML差分を解析する
   * @param previousHtml 変更前のHTML
   * @param currentHtml 変更後のHTML
   * @param currentStructure 現在のstructure.md
   */
  analyze(
    previousHtml: string,
    currentHtml: string,
    currentStructure: string,
  ): Promise<DiffResult>;
}
```

---

### 5.3 LoopPrevention

**責務**: 無限ループを防止する

```typescript
/**
 * 無限ループ防止サービス
 */
interface LoopPrevention {
  /**
   * 変更をスキル起因としてマークする
   * @param path ファイルパス
   * @param phase スキルフェーズ
   */
  markAsSkillChange(path: string, phase: SkillPhase): void;

  /**
   * 変更がスキル起因かどうかを判定する
   * @param path ファイルパス
   */
  isSkillChange(path: string): boolean;

  /**
   * コンテキストをクリアする
   * @param path ファイルパス
   */
  clearContext(path: string): void;

  /**
   * 期限切れコンテキストをクリーンアップする
   */
  cleanup(): void;
}
```

---

## 6. ドメインイベント

### 6.1 イベント一覧

```typescript
// ファイル変更検知イベント
interface FileChangeDetectedEvent {
  readonly type: "FileChangeDetected";
  readonly payload: {
    filePath: string;
    changeType: FileChangeType;
    source: ChangeSource;
    timestamp: Date;
  };
}

// 同期開始イベント
interface SyncStartedEvent {
  readonly type: "SyncStarted";
  readonly payload: {
    operationId: string;
    projectPath: string;
    direction: SyncDirection;
    timestamp: Date;
  };
}

// 同期完了イベント
interface SyncCompletedEvent {
  readonly type: "SyncCompleted";
  readonly payload: {
    operationId: string;
    projectPath: string;
    direction: SyncDirection;
    duration: number;
    timestamp: Date;
  };
}

// 同期失敗イベント
interface SyncFailedEvent {
  readonly type: "SyncFailed";
  readonly payload: {
    operationId: string;
    projectPath: string;
    direction: SyncDirection;
    error: OperationError;
    timestamp: Date;
  };
}

// 同期キャンセルイベント
interface SyncCancelledEvent {
  readonly type: "SyncCancelled";
  readonly payload: {
    operationId: string;
    projectPath: string;
    timestamp: Date;
  };
}

// 進捗更新イベント
interface ProgressUpdatedEvent {
  readonly type: "ProgressUpdated";
  readonly payload: {
    operationId: string;
    progress: number;
    timestamp: Date;
  };
}

type DomainEvent =
  | FileChangeDetectedEvent
  | SyncStartedEvent
  | SyncCompletedEvent
  | SyncFailedEvent
  | SyncCancelledEvent
  | ProgressUpdatedEvent;
```

---

## 7. リポジトリ

### 7.1 SlideProjectRepository

```typescript
/**
 * スライドプロジェクトリポジトリ
 */
interface SlideProjectRepository {
  /**
   * プロジェクトを取得する
   */
  findByPath(path: string): Promise<SlideProject | null>;

  /**
   * プロジェクトを保存する
   */
  save(project: SlideProject): Promise<void>;

  /**
   * 監視中のプロジェクト一覧を取得する
   */
  findWatching(): Promise<SlideProject[]>;
}
```

### 7.2 ChangeContextRepository

```typescript
/**
 * 変更コンテキストリポジトリ（インメモリ）
 */
interface ChangeContextRepository {
  /**
   * コンテキストを取得する
   */
  get(path: string): ChangeContext | undefined;

  /**
   * コンテキストを保存する
   */
  set(path: string, context: ChangeContext): void;

  /**
   * コンテキストを削除する
   */
  delete(path: string): void;

  /**
   * 期限切れコンテキストを削除する
   */
  cleanupExpired(ttl: number): void;
}
```

---

## 8. ドメインモデル図

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Domain Model                                  │
│                                                                       │
│  ┌──────────────────┐        ┌──────────────────┐                    │
│  │   SlideProject   │        │  SyncOperation   │                    │
│  │   <<Aggregate>>  │        │   <<Aggregate>>  │                    │
│  │                  │        │                  │                    │
│  │ - path           │        │ - id             │                    │
│  │ - syncStatus     │───────▶│ - direction      │                    │
│  │ - isWatching     │ 1    * │ - status         │                    │
│  └──────────────────┘        │ - progress       │                    │
│           │                  └──────────────────┘                    │
│           │                            │                              │
│           │                            │                              │
│           ▼                            ▼                              │
│  ┌──────────────────┐        ┌──────────────────┐                    │
│  │   FileChange     │        │   DiffResult     │                    │
│  │   <<Entity>>     │        │   <<Value>>      │                    │
│  │                  │        │                  │                    │
│  │ - filePath       │        │ - changes[]      │                    │
│  │ - changeType     │        │ - summary        │                    │
│  │ - source         │        └──────────────────┘                    │
│  └──────────────────┘                                                │
│           │                                                           │
│           │                                                           │
│           ▼                                                           │
│  ┌──────────────────┐                                                │
│  │  ChangeContext   │                                                │
│  │   <<Value>>      │                                                │
│  │                  │                                                │
│  │ - source         │                                                │
│  │ - timestamp      │                                                │
│  │ - skillPhase     │                                                │
│  └──────────────────┘                                                │
│                                                                       │
│  Services:                                                            │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐      │
│  │ SyncCoordinator  │ │  DiffAnalyzer    │ │ LoopPrevention   │      │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. 不変条件（Invariants）

### 9.1 SlideProject

1. **ファイル存在**: structure.mdとindex.htmlが存在する場合のみ有効
2. **状態遷移**: syncStatusは `synced → syncing → synced/error` の順序で遷移
3. **同期日時**: lastSyncedAtは状態が`synced`になった時のみ更新

### 9.2 SyncOperation

1. **進捗範囲**: progressは常に0-100の範囲
2. **状態遷移**: statusは `pending → executing → completed/failed/cancelled` の順序で遷移
3. **完了日時**: completedAtはcompleted/failed/cancelledになった時のみ設定
4. **排他制御**: 同一プロジェクトで同時に実行できる操作は1つのみ

### 9.3 ChangeContext

1. **TTL**: タイムスタンプから1秒（1000ms）以内のみ有効
2. **スキル起因**: skillPhaseはsourceが'skill'の場合のみ設定

---

## 10. 関連ドキュメント

| ドキュメント       | パス                                         |
| ------------------ | -------------------------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     |
| API仕様            | `outputs/phase-2/api-specification.md`       |
| IPC設計            | `outputs/phase-2/ipc-design.md`              |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` |
