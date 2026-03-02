# IPC API 仕様書 - TASK-UI-05A-SKILL-EDITOR-VIEW

## メタ情報

| 項目       | 値                            |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW |
| 作成日     | 2026-03-02                    |
| 前提 Phase | Phase 1: 要件定義             |
| 後続 Phase | Phase 3: 設計レビュー         |

---

## 1. IPC チャネル一覧

SkillEditorView が使用する 7 つの IPC チャネルの概要を示す。

| #   | IPC チャネル          | 定数名                              | 操作概要           | 実装状態                            |
| --- | --------------------- | ----------------------------------- | ------------------ | ----------------------------------- |
| 1   | `skill:getFileTree`   | (未定義: 新規追加必要)              | ファイルツリー取得 | 未実装（UT-UI-05A-GETFILETREE-001） |
| 2   | `skill:readFile`      | `IPC_CHANNELS.SKILL_READ_FILE`      | ファイル読み込み   | 実装済み（TASK-9A-B）               |
| 3   | `skill:writeFile`     | `IPC_CHANNELS.SKILL_WRITE_FILE`     | ファイル書き込み   | 実装済み（TASK-9A-B）               |
| 4   | `skill:createFile`    | `IPC_CHANNELS.SKILL_CREATE_FILE`    | 新規ファイル作成   | 実装済み（TASK-9A-B）               |
| 5   | `skill:deleteFile`    | `IPC_CHANNELS.SKILL_DELETE_FILE`    | ファイル削除       | 実装済み（TASK-9A-B）               |
| 6   | `skill:listBackups`   | `IPC_CHANNELS.SKILL_LIST_BACKUPS`   | バックアップ一覧   | 実装済み（TASK-9A-B）               |
| 7   | `skill:restoreBackup` | `IPC_CHANNELS.SKILL_RESTORE_BACKUP` | バックアップ復元   | 実装済み（TASK-9A-B）               |

---

## 2. 型定義

### 2.1 FileNode（ファイルツリーノード）

```typescript
/**
 * ファイルツリーのノードを表す型
 *
 * skill:getFileTree の戻り値として使用される。
 * ディレクトリの場合は children にサブツリーを持つ。
 */
interface FileNode {
  /** ファイル/ディレクトリ名（例: "SKILL.md", "agents"） */
  name: string;
  /** スキルディレクトリからの相対パス（例: "agents/code-review.md"） */
  path: string;
  /** ノード種別 */
  type: "file" | "directory";
  /** 子ノード配列（ディレクトリの場合のみ。ファイルの場合は undefined） */
  children?: FileNode[];
}
```

### 2.2 BackupEntry（バックアップエントリ）

```typescript
/**
 * バックアップファイルの情報を表す型
 *
 * skill:listBackups の戻り値配列の要素として使用される。
 * SkillFileManager の BackupInfo 型を Renderer 向けに変換したもの。
 */
interface BackupEntry {
  /** バックアップファイルの相対パス（復元時の引数として使用） */
  path: string;
  /** バックアップ作成日時（ISO 8601 形式: "2026-03-01T12:00:00.000Z"） */
  timestamp: string;
  /** バックアップファイルサイズ（バイト単位） */
  size: number;
  /** 元ファイルの相対パス（表示用） */
  originalPath: string;
  /** バックアップ種別（"backup": 上書き保存時, "deleted": 削除時） */
  type: "backup" | "deleted";
}
```

### 2.3 IPC レスポンスラッパー型

```typescript
/**
 * Main Process IPC ハンドラの共通レスポンス形式
 *
 * Preload の safeInvokeUnwrap() がこのラッパーを展開し、
 * success = true の場合は data を返し、
 * success = false の場合は Error をスローする。
 */
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## 3. IPC チャネル詳細仕様

### 3.1 skill:getFileTree

> **注記**: このチャネルは未実装。UT-UI-05A-GETFILETREE-001 で実装予定。
> 指示書: `docs/30-workflows/skill-editor-view/unassigned-task/UT-UI-05A-GETFILETREE-001.md`

| 項目                           | 値                                              |
| ------------------------------ | ----------------------------------------------- |
| チャネル名                     | `skill:getFileTree`                             |
| 方向                           | Renderer → Main                                 |
| 引数形式                       | `{ skillName: string }`                         |
| 戻り値形式                     | `IpcResult<{ tree: FileNode[] }>`               |
| セキュリティ                   | validateIpcSender + P42 準拠 3 段バリデーション |
| 対応 SkillFileManager メソッド | `listSkillFiles()` をベースにツリー構造を構築   |

#### 引数バリデーション（P42 準拠 3 段バリデーション）

```typescript
// 1. 型チェック
if (typeof args?.skillName !== "string") {
  return { success: false, error: "skillName must be a string" };
}
// 2. 空文字列チェック
if (args.skillName === "") {
  return { success: false, error: "skillName must be a non-empty string" };
}
// 3. トリム空文字列チェック
if (args.skillName.trim() === "") {
  return { success: false, error: "skillName must be a non-empty string" };
}
```

#### 成功レスポンス例

```json
{
  "success": true,
  "data": {
    "tree": [
      {
        "name": "SKILL.md",
        "path": "SKILL.md",
        "type": "file"
      },
      {
        "name": "agents",
        "path": "agents",
        "type": "directory",
        "children": [
          {
            "name": "code-review.md",
            "path": "agents/code-review.md",
            "type": "file"
          }
        ]
      },
      {
        "name": "references",
        "path": "references",
        "type": "directory",
        "children": [
          {
            "name": "api-spec.md",
            "path": "references/api-spec.md",
            "type": "file"
          }
        ]
      }
    ]
  }
}
```

#### エラーレスポンス例

```json
{
  "success": false,
  "error": "Skill not found: unknown-skill"
}
```

---

### 3.2 skill:readFile

| 項目                           | 値                                              |
| ------------------------------ | ----------------------------------------------- |
| チャネル名                     | `skill:readFile`                                |
| 定数名                         | `IPC_CHANNELS.SKILL_READ_FILE`                  |
| 方向                           | Renderer → Main                                 |
| 引数形式                       | `{ skillName: string, relativePath: string }`   |
| 戻り値形式                     | `IpcResult<string>`                             |
| セキュリティ                   | validateIpcSender + P42 準拠 3 段バリデーション |
| 対応 SkillFileManager メソッド | `readFile(skillName, relativePath)`             |

#### 引数バリデーション（P42 準拠 3 段バリデーション）

```typescript
// skillName バリデーション
// 1. 型チェック
if (typeof args?.skillName !== "string") {
  return { success: false, error: "skillName must be a string" };
}
// 2-3. 空文字列 + トリム空文字列チェック
if (args.skillName.trim() === "") {
  return { success: false, error: "skillName must be a non-empty string" };
}

// relativePath バリデーション
// 1. 型チェック
if (typeof args?.relativePath !== "string") {
  return { success: false, error: "relativePath must be a string" };
}
// 2-3. 空文字列 + トリム空文字列チェック
if (args.relativePath.trim() === "") {
  return { success: false, error: "relativePath must be a non-empty string" };
}
```

#### 成功レスポンス例

```json
{
  "success": true,
  "data": "# My Skill\n\nThis is the SKILL.md content..."
}
```

#### エラーレスポンス例

| エラー種別       | error メッセージ                    | 発生条件                               |
| ---------------- | ----------------------------------- | -------------------------------------- |
| スキル未検出     | `"Skill not found: {skillName}"`    | 指定スキルが両ディレクトリに存在しない |
| ファイル未検出   | `"File not found: {relativePath}"`  | 指定パスのファイルが存在しない         |
| パストラバーサル | `"Path traversal detected: {path}"` | `..` 等を含む不正パス                  |
| 内部エラー       | `"Internal error"`                  | 予期しないファイルシステムエラー       |

---

### 3.3 skill:writeFile

| 項目                           | 値                                                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| チャネル名                     | `skill:writeFile`                                                                                                          |
| 定数名                         | `IPC_CHANNELS.SKILL_WRITE_FILE`                                                                                            |
| 方向                           | Renderer → Main                                                                                                            |
| 引数形式                       | `{ skillName: string, relativePath: string, content: string }`                                                             |
| 戻り値形式                     | `IpcResult<void>`（success: true のみ。data は含まない）                                                                   |
| セキュリティ                   | validateIpcSender + P42 準拠 3 段バリデーション + パストラバーサル検証                                                     |
| 対応 SkillFileManager メソッド | `writeFile(skillName, relativePath, content)`                                                                              |
| 副作用                         | 既存ファイルがある場合、自動的にバックアップを作成してから上書き。書き込み後に `skillService.scanAvailableSkills()` を実行 |

#### 引数バリデーション（P42 準拠 3 段バリデーション）

```typescript
// skillName バリデーション
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  return { success: false, error: "skillName must be a non-empty string" };
}

// relativePath バリデーション
if (typeof args?.relativePath !== "string" || args.relativePath.trim() === "") {
  return { success: false, error: "relativePath must be a non-empty string" };
}

// content バリデーション（空文字列は許可: ファイルの内容を空にする操作は正当）
if (typeof args?.content !== "string") {
  return { success: false, error: "content must be a string" };
}
```

#### エラーレスポンス例

| エラー種別       | error メッセージ                    | 発生条件                                     |
| ---------------- | ----------------------------------- | -------------------------------------------- |
| スキル未検出     | `"Skill not found: {skillName}"`    | 指定スキルが両ディレクトリに存在しない       |
| 読み取り専用     | `"Skill is readonly: {skillName}"`  | `~/.claude/skills/` 配下のスキルへの書き込み |
| パストラバーサル | `"Path traversal detected: {path}"` | `..` 等を含む不正パス                        |
| 内部エラー       | `"Internal error"`                  | 予期しないファイルシステムエラー             |

---

### 3.4 skill:createFile

| 項目                           | 値                                                                     |
| ------------------------------ | ---------------------------------------------------------------------- |
| チャネル名                     | `skill:createFile`                                                     |
| 定数名                         | `IPC_CHANNELS.SKILL_CREATE_FILE`                                       |
| 方向                           | Renderer → Main                                                        |
| 引数形式                       | `{ skillName: string, relativePath: string, content: string }`         |
| 戻り値形式                     | `IpcResult<void>`（success: true のみ）                                |
| セキュリティ                   | validateIpcSender + P42 準拠 3 段バリデーション + パストラバーサル検証 |
| 対応 SkillFileManager メソッド | `createFile(skillName, relativePath, content)`                         |
| 副作用                         | 親ディレクトリが存在しない場合は自動作成（recursive: true）            |

#### 引数バリデーション（P42 準拠 3 段バリデーション）

```typescript
// skillName バリデーション
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  return { success: false, error: "skillName must be a non-empty string" };
}

// relativePath バリデーション
if (typeof args?.relativePath !== "string" || args.relativePath.trim() === "") {
  return { success: false, error: "relativePath must be a non-empty string" };
}

// content バリデーション（空文字列は許可: 空ファイルの新規作成は正当な操作）
if (typeof args?.content !== "string") {
  return { success: false, error: "content must be a string" };
}
```

#### エラーレスポンス例

| エラー種別       | error メッセージ                        | 発生条件                                 |
| ---------------- | --------------------------------------- | ---------------------------------------- |
| スキル未検出     | `"Skill not found: {skillName}"`        | 指定スキルが両ディレクトリに存在しない   |
| 読み取り専用     | `"Skill is readonly: {skillName}"`      | `~/.claude/skills/` 配下のスキルへの作成 |
| ファイル重複     | `"File already exists: {relativePath}"` | 同名ファイルが既に存在する               |
| パストラバーサル | `"Path traversal detected: {path}"`     | `..` 等を含む不正パス                    |
| 内部エラー       | `"Internal error"`                      | 予期しないファイルシステムエラー         |

---

### 3.5 skill:deleteFile

| 項目                           | 値                                                                     |
| ------------------------------ | ---------------------------------------------------------------------- |
| チャネル名                     | `skill:deleteFile`                                                     |
| 定数名                         | `IPC_CHANNELS.SKILL_DELETE_FILE`                                       |
| 方向                           | Renderer → Main                                                        |
| 引数形式                       | `{ skillName: string, relativePath: string }`                          |
| 戻り値形式                     | `IpcResult<void>`（success: true のみ）                                |
| セキュリティ                   | validateIpcSender + P42 準拠 3 段バリデーション + パストラバーサル検証 |
| 対応 SkillFileManager メソッド | `deleteFile(skillName, relativePath)`                                  |
| 副作用                         | 削除前に自動的にバックアップ（`.deleted.{timestamp}` 形式）を作成      |

#### 引数バリデーション（P42 準拠 3 段バリデーション）

```typescript
// skillName バリデーション
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  return { success: false, error: "skillName must be a non-empty string" };
}

// relativePath バリデーション
if (typeof args?.relativePath !== "string" || args.relativePath.trim() === "") {
  return { success: false, error: "relativePath must be a non-empty string" };
}
```

#### エラーレスポンス例

| エラー種別       | error メッセージ                    | 発生条件                                 |
| ---------------- | ----------------------------------- | ---------------------------------------- |
| スキル未検出     | `"Skill not found: {skillName}"`    | 指定スキルが両ディレクトリに存在しない   |
| 読み取り専用     | `"Skill is readonly: {skillName}"`  | `~/.claude/skills/` 配下のスキルへの削除 |
| ファイル未検出   | `"File not found: {relativePath}"`  | 指定パスのファイルが存在しない           |
| パストラバーサル | `"Path traversal detected: {path}"` | `..` 等を含む不正パス                    |
| 内部エラー       | `"Internal error"`                  | 予期しないファイルシステムエラー         |

---

### 3.6 skill:listBackups

| 項目                           | 値                                              |
| ------------------------------ | ----------------------------------------------- |
| チャネル名                     | `skill:listBackups`                             |
| 定数名                         | `IPC_CHANNELS.SKILL_LIST_BACKUPS`               |
| 方向                           | Renderer → Main                                 |
| 引数形式                       | `{ skillName: string }`                         |
| 戻り値形式                     | `IpcResult<BackupEntry[]>`                      |
| セキュリティ                   | validateIpcSender + P42 準拠 3 段バリデーション |
| 対応 SkillFileManager メソッド | `listBackups(skillName)`                        |
| ソート順                       | タイムスタンプ降順（最新のバックアップが先頭）  |

#### 引数バリデーション（P42 準拠 3 段バリデーション）

```typescript
// skillName バリデーション
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  return { success: false, error: "skillName must be a non-empty string" };
}
```

#### 成功レスポンス例

```json
{
  "success": true,
  "data": [
    {
      "path": "SKILL.md.backup.1709312400000",
      "timestamp": "2026-03-01T15:00:00.000Z",
      "size": 2048,
      "originalPath": "SKILL.md",
      "type": "backup"
    },
    {
      "path": "agents/old-agent.md.deleted.1709226000000",
      "timestamp": "2026-02-28T15:00:00.000Z",
      "size": 512,
      "originalPath": "agents/old-agent.md",
      "type": "deleted"
    }
  ]
}
```

#### エラーレスポンス例

| エラー種別   | error メッセージ                 | 発生条件                               |
| ------------ | -------------------------------- | -------------------------------------- |
| スキル未検出 | `"Skill not found: {skillName}"` | 指定スキルが両ディレクトリに存在しない |
| 内部エラー   | `"Internal error"`               | 予期しないファイルシステムエラー       |

---

### 3.7 skill:restoreBackup

| 項目                           | 値                                                                     |
| ------------------------------ | ---------------------------------------------------------------------- |
| チャネル名                     | `skill:restoreBackup`                                                  |
| 定数名                         | `IPC_CHANNELS.SKILL_RESTORE_BACKUP`                                    |
| 方向                           | Renderer → Main                                                        |
| 引数形式                       | `{ skillName: string, backupPath: string }`                            |
| 戻り値形式                     | `IpcResult<void>`（success: true のみ）                                |
| セキュリティ                   | validateIpcSender + P42 準拠 3 段バリデーション + パストラバーサル検証 |
| 対応 SkillFileManager メソッド | `restoreBackup(skillName, backupPath)`                                 |
| 動作                           | バックアップファイルの内容を元ファイルパスにコピー（上書き）           |

#### 引数バリデーション（P42 準拠 3 段バリデーション）

```typescript
// skillName バリデーション
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  return { success: false, error: "skillName must be a non-empty string" };
}

// backupPath バリデーション
if (typeof args?.backupPath !== "string" || args.backupPath.trim() === "") {
  return { success: false, error: "backupPath must be a non-empty string" };
}
```

#### エラーレスポンス例

| エラー種別         | error メッセージ                    | 発生条件                                      |
| ------------------ | ----------------------------------- | --------------------------------------------- |
| スキル未検出       | `"Skill not found: {skillName}"`    | 指定スキルが両ディレクトリに存在しない        |
| 読み取り専用       | `"Skill is readonly: {skillName}"`  | `~/.claude/skills/` 配下のスキルへの復元      |
| バックアップ未検出 | `"File not found: {backupPath}"`    | 指定バックアップファイルが存在しない          |
| 不正パス           | `"File not found: {backupPath}"`    | backupPath がバックアップパターンに一致しない |
| パストラバーサル   | `"Path traversal detected: {path}"` | `..` 等を含む不正パス                         |
| 内部エラー         | `"Internal error"`                  | 予期しないファイルシステムエラー              |

---

## 4. エラーハンドリング戦略

### 4.1 エラーカテゴリとコード対応

| カテゴリ             | エラークラス       | HTTP 相当 | リトライ | Renderer 側の処理                      |
| -------------------- | ------------------ | --------- | -------- | -------------------------------------- |
| バリデーションエラー | (IPC ハンドラ内)   | 400       | 不可     | インラインエラーメッセージ表示         |
| スキル未検出         | SkillNotFoundError | 404       | 不可     | エラーダイアログ + onClose()           |
| ファイル未検出       | FileNotFoundError  | 404       | 不可     | エラーダイアログ + refreshTree()       |
| 読み取り専用         | ReadonlySkillError | 403       | 不可     | トースト通知（3 秒間）                 |
| ファイル重複         | FileExistsError    | 409       | 不可     | エラーダイアログ（ファイル名変更促し） |
| パストラバーサル     | PathTraversalError | 403       | 不可     | エラーダイアログ（操作拒否）           |
| 内部エラー           | (予期しないエラー) | 500       | 可能     | エラーダイアログ（再試行ボタン付き）   |

### 4.2 エラーレスポンスのサニタイズ

Main Process から Renderer に送信するエラーメッセージは以下の原則でサニタイズする。

| エラー種別            | サニタイズ方針                                                                    |
| --------------------- | --------------------------------------------------------------------------------- |
| 既知エラー（Known）   | `error.message` をそのまま返す（ビジネスロジックのエラーメッセージ）              |
| 未知エラー（Unknown） | `"Internal error"` を返す。スタックトレース、ファイルパス等の内部情報を漏洩しない |

```typescript
// skillFileHandlers.ts のエラーハンドリングパターン
try {
  // SkillFileManager の操作
} catch (error) {
  if (isKnownSkillFileError(error)) {
    return { success: false, error: error.message };
  }
  // 未知エラー: 内部情報を漏洩しない
  return { success: false, error: "Internal error" };
}
```

### 4.3 Renderer 側のエラーハンドリングフロー

```
Renderer が IPC レスポンスを受信
  │
  ├─ success: true → 正常処理（content 更新、ツリー再構築等）
  │
  └─ success: false → safeInvokeUnwrap が Error をスロー
      │
      ├─ Hook の catch ブロックでキャッチ
      │   └─ error state にメッセージを設定
      │
      └─ SkillEditorView がエラー種別に応じた UI を表示
          ├─ "Skill not found" → エラーダイアログ + onClose()
          ├─ "File not found"  → エラーダイアログ + refreshTree()
          ├─ "readonly"        → トースト通知
          └─ その他            → エラーダイアログ（再試行ボタン）
```

---

## 5. Preload API マッピング

### 5.1 SkillPreloadAPI インターフェース

SkillEditorView が使用する Preload API のサブセットを定義する。これらのメソッドは既存の `skillAPI` オブジェクト（`apps/desktop/src/preload/skill-api.ts`）に実装済み（skill:getFileTree を除く）。

```typescript
/**
 * SkillEditorView が使用する Preload API のサブセット
 *
 * 実際の呼び出しは window.electronAPI.skill 経由で行う。
 * skill:getFileTree は UT-UI-05A-GETFILETREE-001 で追加予定。
 */
interface SkillEditorPreloadAPI {
  /**
   * ファイルツリーを取得する
   * @param skillName スキル名
   * @returns ツリーノード配列
   * @throws Error IPC 通信エラーまたはスキル未検出
   * @note 未実装。UT-UI-05A-GETFILETREE-001 で追加予定
   */
  getFileTree: (skillName: string) => Promise<{ tree: FileNode[] }>;

  /**
   * ファイル内容を読み込む
   * @param skillName スキル名
   * @param relativePath スキルディレクトリからの相対パス
   * @returns ファイル内容（UTF-8 文字列）
   * @throws Error IPC 通信エラー、スキル未検出、ファイル未検出
   */
  readFile: (skillName: string, relativePath: string) => Promise<string>;

  /**
   * ファイル内容を書き込む（既存ファイルの場合は自動バックアップ後に上書き）
   * @param skillName スキル名
   * @param relativePath スキルディレクトリからの相対パス
   * @param content 書き込む内容
   * @throws Error IPC 通信エラー、スキル未検出、読み取り専用、パストラバーサル
   */
  writeFile: (
    skillName: string,
    relativePath: string,
    content: string,
  ) => Promise<void>;

  /**
   * 新規ファイルを作成する（同名ファイルが存在する場合はエラー）
   * @param skillName スキル名
   * @param relativePath スキルディレクトリからの相対パス
   * @param content 初期内容
   * @throws Error IPC 通信エラー、スキル未検出、読み取り専用、ファイル重複
   */
  createFile: (
    skillName: string,
    relativePath: string,
    content: string,
  ) => Promise<void>;

  /**
   * ファイルを削除する（自動バックアップ後に削除）
   * @param skillName スキル名
   * @param relativePath スキルディレクトリからの相対パス
   * @throws Error IPC 通信エラー、スキル未検出、読み取り専用、ファイル未検出
   */
  deleteFile: (skillName: string, relativePath: string) => Promise<void>;

  /**
   * バックアップ一覧を取得する（タイムスタンプ降順）
   * @param skillName スキル名
   * @returns バックアップエントリ配列
   * @throws Error IPC 通信エラー、スキル未検出
   */
  listBackups: (skillName: string) => Promise<BackupEntry[]>;

  /**
   * バックアップからファイルを復元する
   * @param skillName スキル名
   * @param backupPath バックアップファイルの相対パス
   * @throws Error IPC 通信エラー、スキル未検出、読み取り専用、バックアップ未検出
   */
  restoreBackup: (skillName: string, backupPath: string) => Promise<void>;
}
```

### 5.2 Preload API 実装マッピング

| Preload メソッド  | IPC チャネル           | safeInvoke 方式    | 引数形式                               |
| ----------------- | ---------------------- | ------------------ | -------------------------------------- |
| `readFile()`      | `SKILL_READ_FILE`      | `safeInvokeUnwrap` | `{ skillName, relativePath }`          |
| `writeFile()`     | `SKILL_WRITE_FILE`     | `safeInvokeUnwrap` | `{ skillName, relativePath, content }` |
| `createFile()`    | `SKILL_CREATE_FILE`    | `safeInvokeUnwrap` | `{ skillName, relativePath, content }` |
| `deleteFile()`    | `SKILL_DELETE_FILE`    | `safeInvokeUnwrap` | `{ skillName, relativePath }`          |
| `listBackups()`   | `SKILL_LIST_BACKUPS`   | `safeInvokeUnwrap` | `{ skillName }`                        |
| `restoreBackup()` | `SKILL_RESTORE_BACKUP` | `safeInvokeUnwrap` | `{ skillName, backupPath }`            |
| `getFileTree()`   | (新規チャネル)         | `safeInvokeUnwrap` | `{ skillName }`                        |

> **重要**: 全メソッドが `safeInvokeUnwrap` を使用する。これにより `IpcResult` ラッパーが自動的に展開され、`success: false` の場合は Error がスローされる。Renderer 側では try/catch でエラーをキャッチする。

---

## 6. IPC 呼び出しフロー図

### 6.1 全体フロー

```
┌─────────────────────────────────────────────────────────────────┐
│ Renderer Process                                                │
│                                                                  │
│  SkillEditorView                                                │
│    │                                                             │
│    ├── useFileTree.refreshTree()                                │
│    │     └── window.electronAPI.skill.getFileTree(skillName)    │
│    │                                                             │
│    ├── useSkillEditor.loadFile(path)                            │
│    │     └── window.electronAPI.skill.readFile(skillName, path) │
│    │                                                             │
│    ├── useSkillEditor.save()                                    │
│    │     └── window.electronAPI.skill.writeFile(...)            │
│    │                                                             │
│    ├── useFileTree.createFile(parentPath, fileName)             │
│    │     └── window.electronAPI.skill.createFile(...)           │
│    │                                                             │
│    ├── useFileTree.deleteFile(path)                             │
│    │     └── window.electronAPI.skill.deleteFile(...)           │
│    │                                                             │
│    └── BackupMenu                                               │
│          ├── window.electronAPI.skill.listBackups(skillName)    │
│          └── window.electronAPI.skill.restoreBackup(...)        │
│                                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ ipcRenderer.invoke (via safeInvokeUnwrap)
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│ Preload (skill-api.ts)    │                                     │
│                           │                                     │
│  safeInvokeUnwrap()       │                                     │
│    ├── ホワイトリスト検証 │ (ALLOWED_INVOKE_CHANNELS)           │
│    ├── ipcRenderer.invoke │                                     │
│    └── IpcResult 展開     │ (success チェック + data 抽出)      │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            │ IPC Channel
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│ Main Process              │                                     │
│                           ▼                                     │
│  skillFileHandlers.ts                                           │
│    │                                                             │
│    ├── 1. validateIpcSender()  ← 送信元ウィンドウ検証          │
│    │                                                             │
│    ├── 2. P42 準拠 3 段バリデーション                           │
│    │     ├── typeof チェック                                     │
│    │     ├── 空文字列チェック                                    │
│    │     └── .trim() 空文字列チェック                            │
│    │                                                             │
│    ├── 3. SkillFileManager メソッド呼び出し                     │
│    │     ├── findSkillDir() ← スキルディレクトリ解決            │
│    │     ├── validatePath() ← パストラバーサル検証              │
│    │     └── ファイルシステム操作                                │
│    │                                                             │
│    └── 4. IpcResult レスポンス返却                              │
│          ├── 成功: { success: true, data: ... }                 │
│          └── 失敗: { success: false, error: "..." }             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ File System                                                      │
│                                                                  │
│  ~/.aiworkflow/skills/{skillName}/   ← 編集可能（readonly=false）│
│    ├── SKILL.md                                                  │
│    ├── agents/                                                   │
│    ├── references/                                               │
│    └── *.backup.{timestamp}          ← バックアップファイル      │
│                                                                  │
│  ~/.claude/skills/{skillName}/       ← 読み取り専用（readonly=true）│
│    ├── SKILL.md                                                  │
│    ├── agents/                                                   │
│    └── references/                                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 セキュリティ多層防御

```
Layer 1: Preload ホワイトリスト
  └── ALLOWED_INVOKE_CHANNELS に含まれるチャネルのみ通過

Layer 2: IPC ハンドラ送信元検証
  └── validateIpcSender() で送信元ウィンドウが mainWindow であることを確認

Layer 3: IPC ハンドラ引数バリデーション
  └── P42 準拠 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）

Layer 4: SkillFileManager 内部検証
  ├── findSkillDir() → スキル存在確認
  ├── readonly チェック → 読み取り専用スキルへの書き込み防止
  └── validatePath() → パストラバーサル防止
```

---

## 7. IPC 契約チェックリスト（ipc-contract-checklist.md 準拠）

### 7.1 既存チャネル（6 チャネル）

| チェック項目                            | skill:readFile | skill:writeFile | skill:createFile | skill:deleteFile | skill:listBackups | skill:restoreBackup |
| --------------------------------------- | -------------- | --------------- | ---------------- | ---------------- | ----------------- | ------------------- |
| チャネル定数が IPC_CHANNELS に定義      | OK             | OK              | OK               | OK               | OK                | OK                  |
| ALLOWED_INVOKE_CHANNELS に登録          | OK             | OK              | OK               | OK               | OK                | OK                  |
| ハンドラ引数形式と Preload 呼び出し一致 | OK             | OK              | OK               | OK               | OK                | OK                  |
| P42 準拠 3 段バリデーション実装         | OK             | OK              | OK               | OK               | OK                | OK                  |
| validateIpcSender 実装                  | OK             | OK              | OK               | OK               | OK                | OK                  |
| エラーサニタイズ実装                    | OK             | OK              | OK               | OK               | OK                | OK                  |

### 7.2 新規チャネル（skill:getFileTree）

| チェック項目                       | 状態   | 備考                             |
| ---------------------------------- | ------ | -------------------------------- |
| チャネル定数が IPC_CHANNELS に定義 | 未実装 | UT-UI-05A-GETFILETREE-001 で対応 |
| ALLOWED_INVOKE_CHANNELS に登録     | 未実装 | 同上                             |
| Main Process ハンドラ実装          | 未実装 | 同上                             |
| Preload API メソッド実装           | 未実装 | 同上                             |
| P42 準拠 3 段バリデーション実装    | 未実装 | 同上                             |
| validateIpcSender 実装             | 未実装 | 同上                             |
| エラーサニタイズ実装               | 未実装 | 同上                             |
| テスト作成                         | 未実装 | 同上                             |

---

## 8. Hook から IPC への呼び出しマッピング

| Hook           | メソッド       | IPC チャネル        | タイミング                           |
| -------------- | -------------- | ------------------- | ------------------------------------ |
| useFileTree    | refreshTree()  | skill:getFileTree   | マウント時 + ファイル操作後          |
| useFileTree    | createFile()   | skill:createFile    | ファイル作成ダイアログ確定時         |
| useFileTree    | deleteFile()   | skill:deleteFile    | ファイル削除確認ダイアログ確定時     |
| useSkillEditor | loadFile()     | skill:readFile      | ファイル選択時                       |
| useSkillEditor | save()         | skill:writeFile     | 保存ボタン押下時 / Cmd+S 押下時      |
| BackupMenu     | (メニュー表示) | skill:listBackups   | バックアップメニュー開閉時           |
| BackupMenu     | onRestore()    | skill:restoreBackup | バックアップ復元確認ダイアログ確定時 |
