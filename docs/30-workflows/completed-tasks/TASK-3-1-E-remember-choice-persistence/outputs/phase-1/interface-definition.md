# インターフェース定義 - PermissionStore

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-3-1-E                             |
| Phase    | 1                                      |
| 作成日   | 2026-01-25                             |
| 機能名   | task-3-1-e-remember-choice-persistence |

---

## 概要

PermissionStoreクラスの公開APIを定義します。このインターフェースは、ツール許可設定の永続化・取得・削除を提供します。

---

## インターフェース定義

### IPermissionStore

````typescript
/**
 * 権限設定永続化ストアのインターフェース
 *
 * ユーザーが「次回から確認しない」を選択したツールの許可設定を
 * 永続化・取得・削除するためのAPI。
 */
interface IPermissionStore {
  /**
   * ツールが許可済みかどうかを確認
   *
   * @param toolName - ツール名（例: "Read", "Write", "Bash"）
   * @returns 許可済みの場合 true
   *
   * @example
   * ```typescript
   * if (permissionStore.isToolAllowed("Read")) {
   *   // 自動許可
   * }
   * ```
   */
  isToolAllowed(toolName: string): boolean;

  /**
   * ツールを許可リストに追加
   *
   * @param toolName - ツール名
   *
   * @example
   * ```typescript
   * if (response.rememberChoice && response.approved) {
   *   permissionStore.allowTool(response.toolName);
   * }
   * ```
   */
  allowTool(toolName: string): void;

  /**
   * ツールの許可を取り消し
   *
   * @param toolName - ツール名
   *
   * @example
   * ```typescript
   * // 設定画面から削除
   * permissionStore.revokeTool("Bash");
   * ```
   */
  revokeTool(toolName: string): void;

  /**
   * 許可済みツール名の一覧を取得
   *
   * @returns 許可済みツール名の配列
   *
   * @example
   * ```typescript
   * const tools = permissionStore.getAllowedTools();
   * // => ["Read", "Glob", "Grep"]
   * ```
   */
  getAllowedTools(): string[];

  /**
   * 許可済みツールの詳細情報を取得
   *
   * @returns 許可済みツールの詳細情報の配列
   *
   * @example
   * ```typescript
   * const entries = permissionStore.getAllowedToolEntries();
   * // => [{ toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" }]
   * ```
   */
  getAllowedToolEntries(): AllowedToolEntry[];

  /**
   * 全ての許可設定をクリア
   *
   * @example
   * ```typescript
   * // 設定画面から全クリア
   * permissionStore.clearAll();
   * ```
   */
  clearAll(): void;
}
````

### AllowedToolEntry

```typescript
/**
 * 許可済みツールのエントリ
 */
interface AllowedToolEntry {
  /** ツール名 */
  toolName: string;

  /** 許可日時（ISO8601形式） */
  allowedAt: string;
}
```

---

## メソッド詳細

### isToolAllowed(toolName: string): boolean

ツールが許可済みかどうかを同期的に確認します。

| 項目           | 内容                              |
| -------------- | --------------------------------- |
| 引数           | `toolName: string` - ツール名     |
| 戻り値         | `boolean` - 許可済みの場合 `true` |
| 例外           | なし                              |
| パフォーマンス | 1ms以内（メモリ内Map検索）        |

**使用シーン**:

- `sendPermissionRequest()` の前に呼び出し
- 許可済みの場合はダイアログをスキップ

### allowTool(toolName: string): void

ツールを許可リストに追加します。既に許可済みの場合は日時を更新します。

| 項目   | 内容                          |
| ------ | ----------------------------- |
| 引数   | `toolName: string` - ツール名 |
| 戻り値 | なし                          |
| 例外   | なし（エラーはログ出力のみ）  |
| 副作用 | electron-storeに自動保存      |

**使用シーン**:

- `handlePermissionResponse()` で `rememberChoice=true` かつ `approved=true` の場合

### revokeTool(toolName: string): void

ツールの許可を取り消します。許可リストに存在しない場合は何もしません。

| 項目   | 内容                          |
| ------ | ----------------------------- |
| 引数   | `toolName: string` - ツール名 |
| 戻り値 | なし                          |
| 例外   | なし                          |
| 副作用 | electron-storeに自動保存      |

**使用シーン**:

- 設定画面から個別ツールの許可を取り消す

### getAllowedTools(): string[]

許可済みツール名の一覧を取得します。

| 項目   | 内容                        |
| ------ | --------------------------- |
| 引数   | なし                        |
| 戻り値 | `string[]` - ツール名の配列 |
| 例外   | なし                        |

**使用シーン**:

- 設定画面で許可済みツール一覧を表示

### getAllowedToolEntries(): AllowedToolEntry[]

許可済みツールの詳細情報（許可日時を含む）を取得します。

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| 引数   | なし                                  |
| 戻り値 | `AllowedToolEntry[]` - 詳細情報の配列 |
| 例外   | なし                                  |

**使用シーン**:

- 設定画面で許可日時を表示

### clearAll(): void

全ての許可設定をクリアします。

| 項目   | 内容                     |
| ------ | ------------------------ |
| 引数   | なし                     |
| 戻り値 | なし                     |
| 例外   | なし                     |
| 副作用 | electron-storeに自動保存 |

**使用シーン**:

- 設定画面から全ての許可をクリア

---

## エラーハンドリング方針

### 基本方針

1. **読み込みエラー**: デフォルト値で初期化、警告ログ出力
2. **書き込みエラー**: エラーログ出力、メソッドはエラーをスローしない
3. **バリデーションエラー**: デフォルト値で初期化、警告ログ出力

### ログ出力

```typescript
// 読み込みエラー時
console.warn("[PermissionStore] Failed to load store, using defaults:", error);

// 書き込みエラー時
console.error("[PermissionStore] Failed to save store:", error);

// バリデーションエラー時
console.warn("[PermissionStore] Invalid schema, resetting to defaults");
```

---

## TypeScript 型定義ファイル

### 配置場所

```
packages/shared/src/types/permission-store.ts
```

### エクスポート

```typescript
// packages/shared/src/types/permission-store.ts

export interface AllowedToolEntry {
  toolName: string;
  allowedAt: string;
}

export interface PermissionStoreSchema {
  version: number;
  allowedTools: AllowedToolEntry[];
  updatedAt: string;
}

export interface IPermissionStore {
  isToolAllowed(toolName: string): boolean;
  allowTool(toolName: string): void;
  revokeTool(toolName: string): void;
  getAllowedTools(): string[];
  getAllowedToolEntries(): AllowedToolEntry[];
  clearAll(): void;
}
```

---

## IPCチャネル定義

### チャネル一覧

| チャネル名                   | 方向            | リクエスト型 | レスポンス型         |
| ---------------------------- | --------------- | ------------ | -------------------- |
| `permission:getAllowedTools` | Renderer → Main | なし         | `AllowedToolEntry[]` |
| `permission:revokeTool`      | Renderer → Main | `string`     | `void`               |
| `permission:clearAll`        | Renderer → Main | なし         | `void`               |

### チャネル定義追加

```typescript
// packages/shared/src/ipc/channels.ts

export const PERMISSION_CHANNELS = {
  GET_ALLOWED_TOOLS: "permission:getAllowedTools",
  REVOKE_TOOL: "permission:revokeTool",
  CLEAR_ALL: "permission:clearAll",
} as const;
```

---

## 関連ドキュメント

- [データスキーマ定義](./data-schema.md)
- [セキュリティ考慮事項](./security-considerations.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
