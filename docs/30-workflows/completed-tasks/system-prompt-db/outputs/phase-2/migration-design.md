# マイグレーション処理設計書

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 機能名   | システムプロンプトのデータベース永続化 |
| 作成日   | 2026-01-22                             |
| Phase    | 2                                      |
| タスクID | TASK-CHAT-SYSPROMPT-DB-001             |

---

## 1. 現在のelectron-store構造

### 1.1 ストレージ位置

```
~/.config/AIWorkflowOrchestrator/config.json
```

### 1.2 データ構造

```typescript
// electron-storeに保存されているテンプレート形式
interface ElectronStoreTemplate {
  id: string;           // "custom-{timestamp}-{random}"
  name: string;         // テンプレート名
  content: string;      // テンプレート内容
  isPreset: boolean;    // 常にfalse（カスタムのみ保存）
  createdAt: string;    // ISO8601形式の日時文字列
  updatedAt: string;    // ISO8601形式の日時文字列
}

// electron-storeのキー
{
  "systemPromptTemplates": ElectronStoreTemplate[]
}
```

### 1.3 サンプルデータ

```json
{
  "systemPromptTemplates": [
    {
      "id": "custom-1703347200000-abc123",
      "name": "カスタム翻訳",
      "content": "翻訳を行う際は...",
      "isPreset": false,
      "createdAt": "2024-12-23T12:00:00.000Z",
      "updatedAt": "2024-12-23T12:00:00.000Z"
    }
  ]
}
```

---

## 2. マイグレーションインターフェース

### 2.1 型定義

```typescript
// apps/desktop/src/main/migration/types.ts

/**
 * マイグレーション結果
 */
export interface MigrationResult {
  /** 成功したか */
  success: boolean;

  /** 移行したテンプレート数 */
  migratedCount: number;

  /** スキップしたテンプレート数（重複など） */
  skippedCount: number;

  /** 発生したエラー */
  errors: MigrationError[];
}

/**
 * マイグレーションエラー
 */
export interface MigrationError {
  /** エラーが発生したテンプレートID */
  templateId: string;

  /** エラーメッセージ */
  message: string;

  /** エラーコード */
  code: MigrationErrorCode;
}

/**
 * マイグレーションエラーコード
 */
export type MigrationErrorCode =
  | "DUPLICATE_NAME" // 名前重複
  | "VALIDATION_ERROR" // バリデーションエラー
  | "DB_ERROR" // データベースエラー
  | "UNKNOWN"; // 不明なエラー

/**
 * マイグレーションステータス
 */
export interface MigrationStatus {
  /** マイグレーション完了済みか */
  completed: boolean;

  /** 最後のマイグレーション日時 */
  lastMigratedAt: string | null;

  /** 最後のマイグレーション結果 */
  lastResult: MigrationResult | null;
}
```

### 2.2 インターフェース

```typescript
// apps/desktop/src/main/migration/types.ts

/**
 * electron-storeマイグレーションサービスインターフェース
 */
export interface IElectronStoreMigration {
  /**
   * マイグレーションが必要か確認する
   *
   * @returns 移行対象データがあり、未完了の場合true
   */
  needsMigration(): Promise<boolean>;

  /**
   * マイグレーションステータスを取得する
   *
   * @returns マイグレーションステータス
   */
  getStatus(): Promise<MigrationStatus>;

  /**
   * マイグレーションを実行する
   *
   * @param userId 移行先のユーザーID
   * @returns マイグレーション結果
   */
  migrate(userId: string): Promise<MigrationResult>;

  /**
   * バックアップを作成する
   *
   * @returns バックアップファイルパス
   */
  createBackup(): Promise<string>;

  /**
   * バックアップから復元する
   *
   * @param backupPath バックアップファイルパス
   */
  restoreFromBackup(backupPath: string): Promise<void>;

  /**
   * マイグレーション完了をマークする
   */
  markMigrationComplete(): Promise<void>;

  /**
   * マイグレーション完了マークをリセットする（リトライ用）
   */
  resetMigrationStatus(): Promise<void>;
}
```

---

## 3. マイグレーションフロー

### 3.1 フロー図

```
┌─────────────────────────────────────────────────────────────────────┐
│                          アプリ起動                                  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  needsMigration()     │
                    │  マイグレーション必要？ │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
      ┌───────────────┐                   ┌───────────────┐
      │  不要         │                   │  必要         │
      │  → 通常起動   │                   │  → 移行開始   │
      └───────────────┘                   └───────┬───────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │  ユーザーログイン確認  │
                                      │  (userId取得)         │
                                      └───────────┬───────────┘
                                                  │
                                    ┌─────────────┴─────────────┐
                                    ▼                           ▼
                            ┌───────────────┐           ┌───────────────┐
                            │  未ログイン   │           │  ログイン済み │
                            │  → 延期      │           │  → 続行      │
                            └───────────────┘           └───────┬───────┘
                                                                │
                                                                ▼
                                                    ┌───────────────────────┐
                                                    │  createBackup()       │
                                                    │  バックアップ作成     │
                                                    └───────────┬───────────┘
                                                                │
                                                                ▼
                                                    ┌───────────────────────┐
                                                    │  migrate(userId)      │
                                                    │  データ移行実行       │
                                                    └───────────┬───────────┘
                                                                │
                                              ┌─────────────────┴─────────────────┐
                                              ▼                                   ▼
                                      ┌───────────────┐                   ┌───────────────┐
                                      │  成功         │                   │  失敗         │
                                      └───────┬───────┘                   └───────┬───────┘
                                              │                                   │
                                              ▼                                   ▼
                                  ┌───────────────────────┐           ┌───────────────────────┐
                                  │  markMigrationComplete│           │  restoreFromBackup()  │
                                  │  完了マーク設定       │           │  バックアップから復元 │
                                  └───────────┬───────────┘           └───────────┬───────────┘
                                              │                                   │
                                              ▼                                   ▼
                                  ┌───────────────────────┐           ┌───────────────────────┐
                                  │  通常起動             │           │  次回リトライ予約     │
                                  │  (Turso使用)          │           │  → 通常起動           │
                                  └───────────────────────┘           └───────────────────────┘
```

### 3.2 ステップ詳細

#### Step 1: マイグレーション必要性チェック

```typescript
async needsMigration(): Promise<boolean> {
  // 1. 完了フラグ確認
  const status = await this.getStatus();
  if (status.completed) {
    return false;
  }

  // 2. electron-storeにデータがあるか確認
  const templates = this.store.get("systemPromptTemplates", []);
  return templates.length > 0;
}
```

#### Step 2: バックアップ作成

```typescript
async createBackup(): Promise<string> {
  const templates = this.store.get("systemPromptTemplates", []);
  const backupPath = path.join(
    app.getPath("userData"),
    `systemPromptTemplates.${Date.now()}.bak`
  );

  await fs.writeFile(
    backupPath,
    JSON.stringify(templates, null, 2),
    "utf-8"
  );

  return backupPath;
}
```

#### Step 3: データ移行

```typescript
async migrate(userId: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    skippedCount: 0,
    errors: [],
  };

  const templates = this.store.get("systemPromptTemplates", []);

  for (const template of templates) {
    try {
      // 重複チェック
      const exists = await this.repository.existsByUserIdAndName(
        userId,
        template.name
      );

      if (exists) {
        result.skippedCount++;
        continue;
      }

      // Tursoに挿入
      await this.repository.create(userId, {
        name: template.name,
        content: template.content,
      });

      result.migratedCount++;
    } catch (error) {
      result.success = false;
      result.errors.push({
        templateId: template.id,
        message: error.message,
        code: this.mapErrorCode(error),
      });
    }
  }

  return result;
}
```

#### Step 4: 完了処理

```typescript
async markMigrationComplete(): Promise<void> {
  // electron-storeに完了マーク
  this.store.set("migrationStatus", {
    systemPromptTemplates: {
      completed: true,
      completedAt: new Date().toISOString(),
    },
  });

  // 移行元データの削除（オプション）
  // this.store.delete("systemPromptTemplates");
}
```

---

## 4. 実装クラス設計

### 4.1 クラス構造

```typescript
// apps/desktop/src/main/migration/electronStoreMigration.ts

import Store from "electron-store";
import { app } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import type { ISystemPromptRepository } from "@repo/shared";
import type {
  IElectronStoreMigration,
  MigrationResult,
  MigrationStatus,
  MigrationError,
  MigrationErrorCode,
} from "./types.js";

/**
 * electron-storeからTursoへのマイグレーションサービス
 */
export class ElectronStoreMigration implements IElectronStoreMigration {
  private store: Store;

  constructor(
    private repository: ISystemPromptRepository,
    store?: Store,
  ) {
    this.store = store ?? new Store();
  }

  async needsMigration(): Promise<boolean> {
    const status = await this.getStatus();
    if (status.completed) {
      return false;
    }

    const templates = this.store.get("systemPromptTemplates", []) as unknown[];
    return templates.length > 0;
  }

  async getStatus(): Promise<MigrationStatus> {
    const migrationStatus = this.store.get("migrationStatus") as
      | {
          systemPromptTemplates?: {
            completed: boolean;
            completedAt: string;
            lastResult?: MigrationResult;
          };
        }
      | undefined;

    const sptStatus = migrationStatus?.systemPromptTemplates;

    return {
      completed: sptStatus?.completed ?? false,
      lastMigratedAt: sptStatus?.completedAt ?? null,
      lastResult: sptStatus?.lastResult ?? null,
    };
  }

  async migrate(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      skippedCount: 0,
      errors: [],
    };

    const templates = this.store.get("systemPromptTemplates", []) as Array<{
      id: string;
      name: string;
      content: string;
      isPreset: boolean;
      createdAt: string;
      updatedAt: string;
    }>;

    for (const template of templates) {
      try {
        // プリセットはスキップ（DBに既に存在するはず）
        if (template.isPreset) {
          result.skippedCount++;
          continue;
        }

        // 重複チェック
        const exists = await this.repository.existsByUserIdAndName(
          userId,
          template.name,
        );

        if (exists) {
          result.skippedCount++;
          continue;
        }

        // Tursoに挿入
        await this.repository.create(userId, {
          name: template.name,
          content: template.content,
        });

        result.migratedCount++;
      } catch (error) {
        result.success = false;
        result.errors.push({
          templateId: template.id,
          message: error instanceof Error ? error.message : String(error),
          code: this.mapErrorCode(error),
        });
      }
    }

    // 結果を保存
    await this.saveResult(result);

    return result;
  }

  async createBackup(): Promise<string> {
    const templates = this.store.get("systemPromptTemplates", []);
    const timestamp = Date.now();
    const backupPath = path.join(
      app.getPath("userData"),
      `systemPromptTemplates.${timestamp}.bak`,
    );

    await fs.writeFile(backupPath, JSON.stringify(templates, null, 2), "utf-8");

    return backupPath;
  }

  async restoreFromBackup(backupPath: string): Promise<void> {
    const content = await fs.readFile(backupPath, "utf-8");
    const templates = JSON.parse(content);

    this.store.set("systemPromptTemplates", templates);
  }

  async markMigrationComplete(): Promise<void> {
    const existing = this.store.get("migrationStatus", {}) as Record<
      string,
      unknown
    >;

    this.store.set("migrationStatus", {
      ...existing,
      systemPromptTemplates: {
        completed: true,
        completedAt: new Date().toISOString(),
      },
    });
  }

  async resetMigrationStatus(): Promise<void> {
    const existing = this.store.get("migrationStatus", {}) as Record<
      string,
      unknown
    >;

    this.store.set("migrationStatus", {
      ...existing,
      systemPromptTemplates: {
        completed: false,
        completedAt: null,
      },
    });
  }

  private async saveResult(result: MigrationResult): Promise<void> {
    const existing = this.store.get("migrationStatus", {}) as Record<
      string,
      unknown
    >;
    const sptStatus = (existing.systemPromptTemplates ?? {}) as Record<
      string,
      unknown
    >;

    this.store.set("migrationStatus", {
      ...existing,
      systemPromptTemplates: {
        ...sptStatus,
        lastResult: result,
      },
    });
  }

  private mapErrorCode(error: unknown): MigrationErrorCode {
    if (error instanceof Error) {
      if (error.message.includes("重複")) {
        return "DUPLICATE_NAME";
      }
      if (error.message.includes("バリデーション")) {
        return "VALIDATION_ERROR";
      }
      if (
        error.message.includes("データベース") ||
        error.message.includes("DB")
      ) {
        return "DB_ERROR";
      }
    }
    return "UNKNOWN";
  }
}
```

---

## 5. エラーハンドリング

### 5.1 エラー種別と対処

| エラー種別       | 発生条件                       | 対処                       |
| ---------------- | ------------------------------ | -------------------------- |
| DUPLICATE_NAME   | 同名テンプレートが既存         | スキップして続行           |
| VALIDATION_ERROR | 名前・内容のバリデーション失敗 | スキップして続行           |
| DB_ERROR         | データベース接続・書き込み失敗 | 全体を中断、復元実行       |
| UNKNOWN          | 予期しないエラー               | ログ記録、スキップして続行 |

### 5.2 リカバリ戦略

```typescript
// マイグレーション実行ラッパー
async function runMigrationWithRecovery(
  migration: IElectronStoreMigration,
  userId: string,
): Promise<MigrationResult> {
  let backupPath: string | null = null;

  try {
    // 1. バックアップ作成
    backupPath = await migration.createBackup();
    console.log(`Backup created: ${backupPath}`);

    // 2. マイグレーション実行
    const result = await migration.migrate(userId);

    if (result.success) {
      // 3a. 成功時: 完了マーク
      await migration.markMigrationComplete();
      console.log(
        `Migration completed: ${result.migratedCount} migrated, ${result.skippedCount} skipped`,
      );
    } else {
      // 3b. 失敗時: 部分的にでも移行は完了
      console.warn(
        `Migration partially failed: ${result.errors.length} errors`,
      );
    }

    return result;
  } catch (error) {
    // 致命的エラー: バックアップから復元
    console.error("Migration failed, restoring from backup", error);

    if (backupPath) {
      await migration.restoreFromBackup(backupPath);
    }

    throw error;
  }
}
```

---

## 6. ユーザー通知

### 6.1 通知タイミング

| タイミング           | 通知内容                                         |
| -------------------- | ------------------------------------------------ |
| マイグレーション開始 | 「データ移行を開始します...」                    |
| マイグレーション成功 | 「データ移行が完了しました」                     |
| 部分的失敗           | 「一部のデータを移行できませんでした」           |
| 致命的失敗           | 「データ移行に失敗しました。再試行してください」 |

### 6.2 通知実装

```typescript
// Main Process → Renderer への通知
mainWindow.webContents.send("migration:status", {
  type: "START" | "SUCCESS" | "PARTIAL_FAILURE" | "FAILURE",
  message: string,
  details?: MigrationResult,
});
```

---

## 7. テスト設計

### 7.1 単体テストケース

| テストカテゴリ        | テストケース                         |
| --------------------- | ------------------------------------ |
| needsMigration        | 未完了・データありでtrueを返す       |
| needsMigration        | 完了済みでfalseを返す                |
| needsMigration        | データなしでfalseを返す              |
| migrate               | 全テンプレートを正常に移行           |
| migrate               | 重複テンプレートをスキップ           |
| migrate               | エラー発生時も他のテンプレートを処理 |
| createBackup          | バックアップファイルが作成される     |
| restoreFromBackup     | バックアップから正しく復元される     |
| markMigrationComplete | 完了フラグが設定される               |

### 7.2 結合テストケース

| テストシナリオ | 検証内容                               |
| -------------- | -------------------------------------- |
| 正常移行フロー | バックアップ → 移行 → 完了マークの一連 |
| 失敗時リカバリ | 移行失敗 → バックアップ復元            |
| リトライ       | 完了マークリセット → 再移行成功        |

---

## 8. 完了条件

- [x] マイグレーションインターフェースが定義されている
- [x] マイグレーションフローが設計されている
- [x] 実装クラスが設計されている
- [x] エラーハンドリングが設計されている
- [x] ユーザー通知が設計されている
- [x] テストケースが設計されている

---

## 9. 関連ドキュメント

| ドキュメント     | パス                                             |
| ---------------- | ------------------------------------------------ |
| 機能要件定義書   | `outputs/phase-1/requirements-functional.md`     |
| Repository設計書 | `outputs/phase-2/repository-interface-design.md` |
| データフロー要件 | `outputs/phase-1/requirements-dataflow.md`       |
