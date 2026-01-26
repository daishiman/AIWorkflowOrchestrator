# データスキーマ定義 - PermissionStore

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-3-1-E                             |
| Phase    | 1                                      |
| 作成日   | 2026-01-25                             |
| 機能名   | task-3-1-e-remember-choice-persistence |

---

## 概要

PermissionStoreは、ユーザーが「次回から確認しない」を選択したツールの許可設定を永続化するためのデータストアです。electron-storeを使用してJSONファイルに保存します。

---

## スキーマ定義

### PermissionStoreSchema

```typescript
/**
 * PermissionStore のスキーマ定義
 * electron-store で永続化されるデータ構造
 */
interface PermissionStoreSchema {
  /**
   * スキーマバージョン
   * 将来のマイグレーション対応用
   */
  version: number;

  /**
   * 許可済みツールのリスト
   */
  allowedTools: AllowedToolEntry[];

  /**
   * 最終更新日時（ISO8601形式）
   */
  updatedAt: string;
}

/**
 * 許可済みツールエントリ
 */
interface AllowedToolEntry {
  /**
   * ツール名
   * 例: "Read", "Write", "Bash", "Glob"
   */
  toolName: string;

  /**
   * 許可日時（ISO8601形式）
   */
  allowedAt: string;
}
```

### デフォルト値

```typescript
const DEFAULT_SCHEMA: PermissionStoreSchema = {
  version: 1,
  allowedTools: [],
  updatedAt: new Date().toISOString(),
};
```

---

## 保存先

### ファイルパス

```
{userData}/permission-store.json
```

- Windows: `%APPDATA%/AIWorkflowOrchestrator/permission-store.json`
- macOS: `~/Library/Application Support/AIWorkflowOrchestrator/permission-store.json`
- Linux: `~/.config/AIWorkflowOrchestrator/permission-store.json`

### 名前空間

electron-storeの`name`オプションで独自の名前空間を設定し、他の設定と分離します：

```typescript
const store = new ElectronStore<PermissionStoreSchema>({
  name: "permission-store",
  defaults: DEFAULT_SCHEMA,
});
```

---

## データ例

### 空の状態（初期状態）

```json
{
  "version": 1,
  "allowedTools": [],
  "updatedAt": "2026-01-25T12:00:00.000Z"
}
```

### ツール許可後

```json
{
  "version": 1,
  "allowedTools": [
    {
      "toolName": "Read",
      "allowedAt": "2026-01-25T12:30:00.000Z"
    },
    {
      "toolName": "Glob",
      "allowedAt": "2026-01-25T12:35:00.000Z"
    },
    {
      "toolName": "Grep",
      "allowedAt": "2026-01-25T12:40:00.000Z"
    }
  ],
  "updatedAt": "2026-01-25T12:40:00.000Z"
}
```

---

## バージョン管理

### バージョン番号の意味

| バージョン | 変更内容                      |
| ---------- | ----------------------------- |
| 1          | 初版 - 基本的なツール許可設定 |

### マイグレーション方針

将来のスキーマ変更時のマイグレーション対応：

1. 読み込み時にバージョンをチェック
2. 古いバージョンの場合はマイグレーション関数を実行
3. マイグレーション不能な場合はデフォルト値で初期化

```typescript
function migrateSchema(data: unknown): PermissionStoreSchema {
  const version = (data as any)?.version ?? 0;

  if (version === 1) {
    return data as PermissionStoreSchema;
  }

  // 未知のバージョンはデフォルト値で初期化
  console.warn(
    `Unknown permission store version: ${version}, resetting to defaults`,
  );
  return DEFAULT_SCHEMA;
}
```

---

## バリデーション

### 読み込み時のバリデーション

```typescript
function validateSchema(data: unknown): data is PermissionStoreSchema {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const schema = data as PermissionStoreSchema;

  // version チェック
  if (typeof schema.version !== "number") {
    return false;
  }

  // allowedTools チェック
  if (!Array.isArray(schema.allowedTools)) {
    return false;
  }

  for (const entry of schema.allowedTools) {
    if (
      typeof entry.toolName !== "string" ||
      typeof entry.allowedAt !== "string"
    ) {
      return false;
    }
  }

  // updatedAt チェック
  if (typeof schema.updatedAt !== "string") {
    return false;
  }

  return true;
}
```

### エラーハンドリング

| エラーケース               | 対応                               |
| -------------------------- | ---------------------------------- |
| ファイル読み込みエラー     | デフォルト値で初期化、警告ログ出力 |
| JSON パースエラー          | デフォルト値で初期化、警告ログ出力 |
| スキーマバリデーション失敗 | デフォルト値で初期化、警告ログ出力 |
| 書き込みエラー             | エラーログ出力、次回再試行         |

---

## 拡張性

### 将来の拡張候補

以下のフィールドは将来追加される可能性がある（現時点ではスコープ外）：

```typescript
interface AllowedToolEntryExtended extends AllowedToolEntry {
  /**
   * 有効期限（ISO8601形式）
   * 省略時は無期限
   */
  expiresAt?: string;

  /**
   * 許可したスキル名
   * どのスキル実行時に許可されたかの記録
   */
  grantedBySkill?: string;

  /**
   * 許可回数（統計用）
   */
  useCount?: number;
}
```

---

## 関連ドキュメント

- [インターフェース定義](./interface-definition.md)
- [セキュリティ考慮事項](./security-considerations.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
