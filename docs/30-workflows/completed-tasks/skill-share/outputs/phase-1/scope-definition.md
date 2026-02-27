# Phase 1: スコープ定義書

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| タスクID   | TASK-9F          |
| Phase      | 1                |
| 成果物     | 機能スコープ定義 |
| 作成日     | 2026-02-27       |
| 機能名     | skill-share      |
| ステータス | 完了             |

---

## 1. 機能スコープ概要

TASK-9F「スキル共有・インポート機能」は、外部ソースからのスキルインポートとスキルのエクスポート（共有）機能を実装する。バックエンドサービス・IPC契約・型定義のみを対象とし、UI実装は別タスク（task-030/031/032）に移管済み。

---

## 2. インポートソース（4種）

| ソースタイプ | ShareTarget.type | 必須フィールド                     | 外部依存              |
| ------------ | ---------------- | ---------------------------------- | --------------------- |
| GitHub       | `"github"`       | `repo: string`（"owner/repo"形式） | Octokit（GitHub API） |
| Gist         | `"gist"`         | `gistId: string`                   | Octokit（Gist API）   |
| URL          | `"url"`          | `url: string`（HTTPS必須）         | Node.js https module  |
| Local        | `"local"`        | `localPath: string`（絶対パス）    | Node.js fs module     |

### GitHub リポジトリ（type: "github"）

- `repo`: "owner/repo" 形式の必須フィールド
- `branch`: オプション、デフォルト "main"
- `path`: オプション、デフォルト "/" (リポジトリルート)
- 認証: PATオプション（パブリックリポジトリはPATなしでアクセス可能、ただしrate limit制限あり）

### Gist（type: "gist"）

- `gistId`: Gist IDの必須フィールド
- 認証: PATオプション（パブリックGistはPATなしでアクセス可能）

### URL（type: "url"）

- `url`: HTTPS URLの必須フィールド
- HTTPプロトコルは拒否（NFR-1準拠）
- SKILL.md単一ファイルのインポートのみ

### Local（type: "local"）

- `localPath`: 絶対パスの必須フィールド
- パストラバーサル防止チェック必須（`..` セグメント検出 + シンボリックリンク解決後の検証）
- 読み取り権限チェック必須

---

## 3. エクスポート先（2種）

| エクスポート先 | ShareTarget.type | 必須フィールド                  | 外部依存            |
| -------------- | ---------------- | ------------------------------- | ------------------- |
| Gist           | `"gist"`         | なし（type のみ）               | Octokit（Gist API） |
| Local          | `"local"`        | `localPath: string`（絶対パス） | Node.js fs module   |

### Gist エクスポート

- PAT必須（gistスコープ）
- 作成されたGistの共有URLを `ExportResult.shareUrl` で返却
- SKILL.mdと関連ファイルをGistのファイルとして作成

### ローカルエクスポート

- 書き込み権限チェック必須
- パストラバーサル防止チェック必須
- ディスク容量チェック

---

## 4. 新規IPCチャネル（3チャネル）

| チャネル名               | 方向            | 引数型                                            | 返却型                        | 用途                 |
| ------------------------ | --------------- | ------------------------------------------------- | ----------------------------- | -------------------- |
| `skill:importFromSource` | Renderer → Main | `ShareTarget`                                     | `IpcResult<ImportResult>`     | 外部ソースインポート |
| `skill:export`           | Renderer → Main | `{ skillName: string, destination: ShareTarget }` | `IpcResult<ExportResult>`     | スキルエクスポート   |
| `skill:validateSource`   | Renderer → Main | `ShareTarget`                                     | `IpcResult<SourceValidation>` | インポート元検証     |

### プログレスイベントチャネル

| チャネル名                        | 方向            | データ型         | 用途                 |
| --------------------------------- | --------------- | ---------------- | -------------------- |
| `skill:importFromSource:progress` | Main → Renderer | `ImportProgress` | インポート進捗通知   |
| `skill:export:progress`           | Main → Renderer | `ExportProgress` | エクスポート進捗通知 |

---

## 5. 既存 skill:import との棲み分け

| チャネル                 | 引数型        | 用途                                         | 備考                      |
| ------------------------ | ------------- | -------------------------------------------- | ------------------------- |
| `skill:import`           | `string`      | ローカルスキルディレクトリ名でのインポート   | 既存機能。変更しない      |
| `skill:importFromSource` | `ShareTarget` | GitHub/Gist/URL/ローカルパスからのインポート | TASK-9F新規。別チャネル名 |

**棲み分けの根拠:**

P44（IPCインターフェース不整合）の教訓から、同一チャネル名で異なる引数型を使用すると `ipcMain.handle()` の二重登録例外が発生する。既存の `skill:import` は `string`（スキル名）を受け取るため、`ShareTarget` オブジェクトを受け取る新機能は `skill:importFromSource` として分離する。

---

## 6. ShareTarget discriminated union 型設計

```typescript
export interface ShareTargetGitHub {
  type: "github";
  repo: string; // "owner/repo" 形式
  branch?: string; // デフォルト: "main"
  path?: string; // デフォルト: "/" (ルート)
}

export interface ShareTargetGist {
  type: "gist";
  gistId: string;
}

export interface ShareTargetURL {
  type: "url";
  url: string; // HTTPS必須
}

export interface ShareTargetLocal {
  type: "local";
  localPath: string;
}

export type ShareTarget =
  | ShareTargetGitHub
  | ShareTargetGist
  | ShareTargetURL
  | ShareTargetLocal;
```

### discriminated union の利点

- `type` フィールドによるTypeScript narrowingが自動的に機能する
- 各ソースタイプ固有のフィールドに型安全にアクセスできる
- `switch (source.type)` でのパターンマッチングが可能
- 新しいソースタイプ追加時にコンパイラが未処理ケースを検出する

---

## 7. インターフェース仕様サマリー

### 結果型

```typescript
export interface ImportResult {
  success: boolean;
  skillName: string;
  skillPath: string;
  source: ShareTarget;
  importedAt: string; // ISO 8601
}

export interface ExportResult {
  success: boolean;
  destination: ShareTarget;
  exportedFiles: string[];
  shareUrl?: string; // Gistエクスポート時のみ
}

export interface ImportValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  skillMetadata?: SkillMetadata;
}

export interface SourceValidation {
  isReachable: boolean;
  hasSkillMd: boolean;
  errors: string[];
}
```

### プログレス型

```typescript
export interface ImportProgress {
  phase: "validating" | "downloading" | "copying" | "verifying";
  percentage: number; // 0-100
  message: string;
}

export interface ExportProgress {
  phase: "preparing" | "uploading" | "finalizing";
  percentage: number; // 0-100
  message: string;
}
```

### エラー型

```typescript
export interface SkillShareError {
  code: number; // 1000-5999
  message: string;
  category:
    | "validation"
    | "business"
    | "external"
    | "infrastructure"
    | "internal";
  isRetryable: boolean;
  details?: string;
}
```

### ファイルセット型

```typescript
export interface SkillFileSet {
  skillMd: string; // SKILL.md の内容
  additionalFiles: Map<string, string>; // ファイル名 → 内容
}
```

---

## 8. スコープ外（対象外事項）

| 対象外事項                            | 理由                                 |
| ------------------------------------- | ------------------------------------ |
| UI実装（インポート/エクスポート画面） | task-030/031/032 に移管済み          |
| OAuth認証フロー                       | オプション機能。PAT認証を必須とする  |
| スキルのバージョン管理                | 別機能として検討中                   |
| スキルの自動アップデート検知          | 別機能として検討中                   |
| `~/.claude/skills/` への書き込み      | Claude CLIが管理する領域のため対象外 |

---

## 9. インポート先ディレクトリ

| パス                    | 説明                                         |
| ----------------------- | -------------------------------------------- |
| `~/.aiworkflow/skills/` | インポートしたスキルの保存先（読み書き可能） |

`~/.claude/skills/` はClaude CLIが管理するため、本アプリからのインポート先としては使用しない。
