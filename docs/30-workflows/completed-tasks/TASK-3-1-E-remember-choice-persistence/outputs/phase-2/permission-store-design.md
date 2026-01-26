# PermissionStore クラス設計

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-3-1-E                             |
| Phase    | 2                                      |
| 作成日   | 2026-01-25                             |
| 機能名   | task-3-1-e-remember-choice-persistence |

---

## 概要

PermissionStoreは、ユーザーが「次回から確認しない」を選択したツールの許可設定を永続化するクラスです。electron-storeを使用してJSONファイルに保存し、アプリ再起動後も設定を維持します。

---

## クラス設計

### クラス図

```
┌─────────────────────────────────────────────────────┐
│              PermissionStore                        │
├─────────────────────────────────────────────────────┤
│ - store: ElectronStore<PermissionStoreSchema>       │
│ - toolCache: Map<string, AllowedToolEntry>          │
├─────────────────────────────────────────────────────┤
│ + constructor()                                     │
│ + isToolAllowed(toolName: string): boolean          │
│ + allowTool(toolName: string): void                 │
│ + revokeTool(toolName: string): void                │
│ + getAllowedTools(): string[]                       │
│ + getAllowedToolEntries(): AllowedToolEntry[]       │
│ + clearAll(): void                                  │
│ - initializeCache(): void                           │
│ - updateStore(): void                               │
│ - validateSchema(data: unknown): boolean            │
└─────────────────────────────────────────────────────┘
```

### コード設計

```typescript
import ElectronStore from "electron-store";
import type {
  AllowedToolEntry,
  IPermissionStore,
  PermissionStoreSchema,
} from "@repo/shared";

/**
 * スキーマのデフォルト値
 */
const DEFAULT_SCHEMA: PermissionStoreSchema = {
  version: 1,
  allowedTools: [],
  updatedAt: new Date().toISOString(),
};

/**
 * PermissionStore - 権限設定永続化ストア
 *
 * ユーザーが「次回から確認しない」を選択したツールの許可設定を
 * electron-storeで永続化する。
 */
export class PermissionStore implements IPermissionStore {
  /** electron-store インスタンス */
  private store: ElectronStore<PermissionStoreSchema>;

  /** ツール許可のインメモリキャッシュ（高速アクセス用） */
  private toolCache: Map<string, AllowedToolEntry>;

  /**
   * コンストラクタ
   */
  constructor() {
    this.store = new ElectronStore<PermissionStoreSchema>({
      name: "permission-store",
      defaults: DEFAULT_SCHEMA,
    });

    this.toolCache = new Map();
    this.initializeCache();
  }

  /**
   * ツールが許可済みかどうかを確認（O(1)）
   */
  isToolAllowed(toolName: string): boolean {
    return this.toolCache.has(toolName);
  }

  /**
   * ツールを許可リストに追加
   */
  allowTool(toolName: string): void {
    const entry: AllowedToolEntry = {
      toolName,
      allowedAt: new Date().toISOString(),
    };

    this.toolCache.set(toolName, entry);
    this.updateStore();

    console.info(`[PermissionStore] Tool permission added: ${toolName}`);
  }

  /**
   * ツールの許可を取り消し
   */
  revokeTool(toolName: string): void {
    if (!this.toolCache.has(toolName)) {
      return;
    }

    this.toolCache.delete(toolName);
    this.updateStore();

    console.info(`[PermissionStore] Tool permission revoked: ${toolName}`);
  }

  /**
   * 許可済みツール名の一覧を取得
   */
  getAllowedTools(): string[] {
    return Array.from(this.toolCache.keys());
  }

  /**
   * 許可済みツールの詳細情報を取得
   */
  getAllowedToolEntries(): AllowedToolEntry[] {
    return Array.from(this.toolCache.values());
  }

  /**
   * 全ての許可設定をクリア
   */
  clearAll(): void {
    const count = this.toolCache.size;
    this.toolCache.clear();
    this.updateStore();

    console.warn(`[PermissionStore] All permissions cleared (${count} tools)`);
  }

  /**
   * キャッシュを初期化（起動時に呼び出し）
   */
  private initializeCache(): void {
    try {
      const data = this.store.store;

      // スキーマバリデーション
      if (!this.validateSchema(data)) {
        console.warn("[PermissionStore] Invalid schema, resetting to defaults");
        this.store.clear();
        this.store.set(DEFAULT_SCHEMA);
        return;
      }

      // キャッシュを構築
      for (const entry of data.allowedTools) {
        this.toolCache.set(entry.toolName, entry);
      }

      console.info(
        `[PermissionStore] Loaded ${this.toolCache.size} allowed tools`,
      );
    } catch (error) {
      console.warn(
        "[PermissionStore] Failed to load store, using defaults:",
        error,
      );
    }
  }

  /**
   * キャッシュからストアを更新
   */
  private updateStore(): void {
    try {
      const schema: PermissionStoreSchema = {
        version: 1,
        allowedTools: Array.from(this.toolCache.values()),
        updatedAt: new Date().toISOString(),
      };

      this.store.set(schema);
    } catch (error) {
      console.error("[PermissionStore] Failed to save store:", error);
    }
  }

  /**
   * スキーマをバリデーション
   */
  private validateSchema(data: unknown): data is PermissionStoreSchema {
    if (typeof data !== "object" || data === null) {
      return false;
    }

    const schema = data as PermissionStoreSchema;

    if (typeof schema.version !== "number") {
      return false;
    }

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

    if (typeof schema.updatedAt !== "string") {
      return false;
    }

    return true;
  }
}
```

---

## シングルトンパターン

### 採用判定

**採用しない**

理由:

1. SkillExecutorに依存性注入でPermissionStoreを渡す設計を採用
2. テスト時にモックを注入しやすくする
3. 将来的にユーザー別設定等への拡張を考慮

### 代替案: ファクトリパターン

```typescript
// 将来的な拡張用
export function createPermissionStore(): IPermissionStore {
  return new PermissionStore();
}
```

---

## electron-store 設定

### 設定オプション

| オプション | 値                 | 説明                         |
| ---------- | ------------------ | ---------------------------- |
| name       | 'permission-store' | 設定ファイル名（拡張子なし） |
| defaults   | DEFAULT_SCHEMA     | 初期値                       |

### 保存先

```
{userData}/permission-store.json
```

---

## インメモリキャッシュ

### 目的

- `isToolAllowed()` の高速化（O(1) アクセス）
- electron-storeへのディスクI/Oを最小化

### 同期戦略

1. **読み込み**: 起動時にストアからキャッシュを構築
2. **書き込み**: キャッシュ更新後、非同期でストアを更新
3. **整合性**: キャッシュが正（ストアはバックアップ）

---

## エラーハンドリング

### 読み込みエラー

```typescript
try {
  const data = this.store.store;
  // ...
} catch (error) {
  console.warn(
    "[PermissionStore] Failed to load store, using defaults:",
    error,
  );
  // 空のキャッシュで動作継続
}
```

### 書き込みエラー

```typescript
try {
  this.store.set(schema);
} catch (error) {
  console.error("[PermissionStore] Failed to save store:", error);
  // キャッシュは維持（次回の保存で再試行）
}
```

### スキーマバリデーションエラー

```typescript
if (!this.validateSchema(data)) {
  console.warn("[PermissionStore] Invalid schema, resetting to defaults");
  this.store.clear();
  this.store.set(DEFAULT_SCHEMA);
}
```

---

## ファイル配置

```
apps/desktop/src/main/services/skill/
├── PermissionStore.ts        # 本実装
├── PermissionResolver.ts     # 既存
└── SkillExecutor.ts          # 既存（連携追加）
```

---

## 関連ドキュメント

- [SkillExecutor連携設計](./skillexecutor-integration-design.md)
- [IPCチャネル設計](./ipc-channel-design.md)
- [Phase 1: インターフェース定義](../phase-1/interface-definition.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
