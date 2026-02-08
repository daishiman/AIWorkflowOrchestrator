# 修正設計書: インポートスキルの永続化消失バグ修正

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| 作成日     | 2026-02-07                           |
| バージョン | 1.0                                  |
| 依存       | Phase 1 要件定義, アーキテクチャ設計 |

---

## 1. 修正対象ファイル一覧

| ファイルパス                                                 | 修正タイプ | 修正内容                                   | 優先度 |
| ------------------------------------------------------------ | ---------- | ------------------------------------------ | ------ |
| `apps/desktop/src/main/infrastructure/logger.ts`             | 新規作成   | Loggerクラスの実装                         | 高     |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts` | 修正       | 型検証追加、ミューテックス追加、Logger導入 | 高     |
| `apps/desktop/src/main/services/skill/SkillService.ts`       | 修正       | 孤立ID処理追加、DEBUGログ削除、Logger導入  | 高     |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                 | 修正       | DEBUGログ削除、Logger導入、エラー形式統一  | 高     |

---

## 2. 問題別修正設計

### 2.1 P1: スキャンキャッシュとインポートIDの不整合

#### 現在の実装（SkillService.ts L110-118）

```typescript
async getImportedSkills(): Promise<Skill[]> {
  // ...
  const result = importedIds
    .map((id) => this.cache.get(id))
    .filter((skill): skill is Skill => skill !== undefined);
  // 孤立IDはsilentに消失
  return result;
}
```

#### 修正後の実装

```typescript
async getImportedSkills(): Promise<Skill[]> {
  this.logger.debug("getImportedSkills - START");
  const importedIds = this.importManager.getImportedSkillIds();
  this.logger.debug("importedIds:", importedIds.length, "items");

  if (this.cache.size === 0) {
    this.logger.debug("Cache is empty, calling scanAvailableSkills...");
    await this.scanAvailableSkills();
    this.logger.debug("scanAvailableSkills completed, cache size:", this.cache.size);
  }

  const result: Skill[] = [];
  const orphanedIds: string[] = [];

  for (const id of importedIds) {
    const skill = this.cache.get(id);
    if (skill) {
      result.push(skill);
    } else {
      orphanedIds.push(id);
    }
  }

  // 孤立IDがある場合はWARNログ出力（自動削除はしない）
  if (orphanedIds.length > 0) {
    this.logger.warn(
      "Orphaned import IDs detected (not in scan results):",
      orphanedIds,
    );
  }

  this.logger.debug("getImportedSkills - DONE, returning", result.length, "skills");
  return result;
}
```

#### 設計判断

- **孤立IDを自動削除しない理由**:
  - スキルディレクトリが一時的に読み込めない場合にデータロスが発生する
  - ユーザーの意図しない削除を防ぐ
  - 将来的にUIから「孤立ID削除」機能を提供する余地を残す

---

### 2.2 P2: 並列アクセスでのキャッシュ競合

#### 現在の実装（SkillImportManager.ts）

```typescript
async importSkills(skillIds: string[]): Promise<ImportResult> {
  // 排他制御なし
  for (const id of skillIds) {
    this.importedIds.add(id);
  }
  this.persist(); // 同期呼び出し
  return result;
}
```

#### 修正後の実装

```typescript
import { Mutex } from "async-mutex";

export class SkillImportManager {
  private persistMutex = new Mutex();

  async importSkills(skillIds: string[]): Promise<ImportResult> {
    return this.persistMutex.runExclusive(async () => {
      this.logger.debug("importSkills - acquired mutex, skillIds:", skillIds);
      const errors: string[] = [];
      let importedCount = 0;

      for (const id of skillIds) {
        if (!this.importedIds.has(id)) {
          this.importedIds.add(id);
          importedCount++;
        }
      }

      if (importedCount > 0) {
        await this.persistAsync();
      }

      this.logger.debug(
        "importSkills - releasing mutex, imported:",
        importedCount,
      );
      return {
        success: errors.length === 0,
        importedCount,
        errors,
      };
    });
  }

  async removeSkill(skillId: string): Promise<RemoveResult> {
    return this.persistMutex.runExclusive(async () => {
      this.logger.debug("removeSkill - acquired mutex, skillId:", skillId);
      const removed = this.importedIds.has(skillId);

      if (removed) {
        this.importedIds.delete(skillId);
        await this.persistAsync();
      }

      this.logger.debug("removeSkill - releasing mutex, removed:", removed);
      return {
        success: true,
        removed,
      };
    });
  }

  private async persistAsync(): Promise<void> {
    try {
      const data = Array.from(this.importedIds);
      this.logger.info("Persisting:", data.length, "items");
      this.store.set(STORE_KEY, data);
      this.logger.debug("Persist successful");
    } catch (error) {
      this.logger.error("Failed to persist:", error);
      throw error; // 上位で処理可能にするため再スロー
    }
  }
}
```

---

### 2.3 P3: store初期化での予期しない型返却

#### 現在の実装（SkillImportManager.ts L32）

```typescript
const stored = this.store.get(STORE_KEY, []) as string[];
```

#### 修正後の実装

```typescript
import { z } from "zod";

const ImportedSkillIdsSchema = z.array(z.string());

export class SkillImportManager {
  constructor(store: SkillStore, logger?: Logger) {
    this.store = store;
    this.logger = logger ?? createLogger("SkillImportManager");

    this.logger.debug("Store path:", store.path ?? "unknown");

    try {
      const rawData = this.store.get(STORE_KEY, []);
      const parseResult = ImportedSkillIdsSchema.safeParse(rawData);

      if (parseResult.success) {
        this.importedIds = new Set(parseResult.data);
        this.logger.info(
          "Loaded:",
          parseResult.data.length,
          "imported skill IDs",
        );
      } else {
        this.logger.error(
          "Invalid data format in store:",
          parseResult.error.message,
        );
        this.logger.warn("Falling back to empty set and repairing store");
        this.importedIds = new Set();
        // 破損データを修復（空配列で上書き）
        this.store.set(STORE_KEY, []);
      }
    } catch (error) {
      this.logger.error("Failed to load from store:", error);
      this.importedIds = new Set();
    }
  }
}
```

#### Zodスキーマの詳細

```typescript
const ImportedSkillIdsSchema = z.array(z.string());

// 検証例
ImportedSkillIdsSchema.safeParse(["id1", "id2"]); // { success: true, data: ["id1", "id2"] }
ImportedSkillIdsSchema.safeParse(null); // { success: false, error: ... }
ImportedSkillIdsSchema.safeParse({}); // { success: false, error: ... }
ImportedSkillIdsSchema.safeParse(["id1", 123]); // { success: false, error: ... }
```

---

### 2.4 P4: DEBUGログ形式の問題

#### 新規作成: Logger（infrastructure/logger.ts）

```typescript
/**
 * Logger - 環境変数ベースのログレベル制御
 *
 * @see docs/30-workflows/TASK-FIX-4-2-SKILL-STORE-PERSISTENCE/outputs/phase-2/architecture-design.md
 */

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Loggerを作成する
 * @param prefix ログのプレフィックス（コンポーネント名など）
 * @returns Logger instance
 */
export function createLogger(prefix: string): Logger {
  const isDebug =
    process.env.NODE_ENV === "development" || process.env.DEBUG === "true";

  return {
    debug: (msg: string, ...args: unknown[]) => {
      if (isDebug) {
        console.log(`[${prefix}][DEBUG]`, msg, ...args);
      }
    },
    info: (msg: string, ...args: unknown[]) => {
      console.log(`[${prefix}][INFO]`, msg, ...args);
    },
    warn: (msg: string, ...args: unknown[]) => {
      console.warn(`[${prefix}][WARN]`, msg, ...args);
    },
    error: (msg: string, ...args: unknown[]) => {
      console.error(`[${prefix}][ERROR]`, msg, ...args);
    },
  };
}
```

#### 既存ログの置換パターン

| 置換前                                                | 置換後                          |
| ----------------------------------------------------- | ------------------------------- |
| `console.log("[SkillImportManager] ...", ...)`        | `this.logger.info("...", ...)`  |
| `console.log("[SkillImportManager][DEBUG] ...", ...)` | `this.logger.debug("...", ...)` |
| `console.error("[SkillImportManager] ...", ...)`      | `this.logger.error("...", ...)` |
| `console.log("[SkillService][DEBUG] ...", ...)`       | `this.logger.debug("...", ...)` |
| `console.log("[skillHandlers][DEBUG] ...", ...)`      | `this.logger.debug("...", ...)` |

---

### 2.5 P5: エラーレスポンスの一貫性問題

#### 現在の実装（skillHandlers.ts）

```typescript
// パターン1: throw
if (!Array.isArray(args?.skillIds)) {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillIds must be an array",
  };
}

// パターン2: return
return {
  success: false,
  error: error instanceof Error ? error.message : "スキャンに失敗しました",
};
```

#### 修正後の実装（統一形式）

```typescript
// すべてIPCResult形式で返却
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPORT, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      return {
        success: false,
        error: {
          code: "IPC_VALIDATION_ERROR",
          message: validation.error || "IPC validation failed",
        },
      };
    }

    // 引数バリデーション
    if (!Array.isArray(args?.skillIds)) {
      return {
        success: false,
        error: {
          code: "SKILL_IDS_REQUIRED",
          message: "skillIds must be an array",
        },
      };
    }

    try {
      const result = await skillService.importSkills(args.skillIds);
      return { success: true, data: result };
    } catch (error) {
      logger.error("skill:import error:", error);
      return {
        success: false,
        error: {
          code: "SKILL_IMPORT_ERROR",
          message:
            error instanceof Error ? error.message : "インポートに失敗しました",
        },
      };
    }
  },
);
```

---

## 3. 修正手順

### Step 1: Logger の作成

1. `apps/desktop/src/main/infrastructure/logger.ts` を新規作成
2. `Logger` インターフェースと `createLogger` 関数を実装
3. ユニットテストを追加

### Step 2: SkillImportManager の修正

1. `async-mutex` パッケージを追加
2. `zod` スキーマを追加
3. コンストラクタに型検証を追加
4. `importSkills()` と `removeSkill()` にミューテックスを追加
5. 既存の `console.log` を Logger に置換
6. ユニットテストを追加/更新

### Step 3: SkillService の修正

1. Logger を追加
2. `getImportedSkills()` に孤立ID検出ロジックを追加
3. 既存の `console.log` を Logger に置換
4. ユニットテストを追加/更新

### Step 4: skillHandlers の修正

1. Logger を追加
2. 全ハンドラーのエラーレスポンスを IPCResult 形式に統一
3. 既存の DEBUGログ を Logger.debug() に置換
4. バリデーションエラーで throw していた箇所を return に変更
5. 統合テストを追加/更新

---

## 4. 依存パッケージの追加

### pnpm コマンド

```bash
pnpm --filter @repo/desktop add async-mutex
```

### package.json への追加

```json
{
  "dependencies": {
    "async-mutex": "^0.4.0"
  }
}
```

---

## 5. テストファイル一覧

| テストファイル                                                              | 対象               | 新規/既存 |
| --------------------------------------------------------------------------- | ------------------ | --------- |
| `apps/desktop/src/main/infrastructure/__tests__/logger.test.ts`             | Logger             | 新規      |
| `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | SkillImportManager | 既存拡張  |
| `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`       | SkillService       | 既存拡張  |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                 | skillHandlers      | 既存拡張  |

---

## 6. 完了確認チェックリスト

- [ ] Logger が環境変数に応じてDEBUGログを制御する
- [ ] SkillImportManager がZodで型検証を行う
- [ ] SkillImportManager がミューテックスで排他制御を行う
- [ ] SkillService が孤立IDを検出してWARNログを出力する
- [ ] skillHandlers のエラーレスポンスが IPCResult 形式で統一されている
- [ ] 全ての console.log が Logger に置換されている
- [ ] 各コンポーネントのテストがPASSする

---

## 7. 参照

- アーキテクチャ設計: `outputs/phase-2/architecture-design.md`
- Phase 1 要件定義: `outputs/phase-1/requirements-definition.md`
- Phase 1 受入基準: `outputs/phase-1/acceptance-criteria.md`
