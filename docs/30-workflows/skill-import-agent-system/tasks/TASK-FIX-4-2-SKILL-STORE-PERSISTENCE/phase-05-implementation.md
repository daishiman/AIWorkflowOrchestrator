# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 5                                    |
| タスク | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| 名称   | インポートスキルの永続化消失バグ修正 |
| 分類   | バグ修正                             |
| 作成日 | 2026-02-07                           |

## 目的

Phase 4で作成したテストをすべてパスさせる最小限の実装を行う（Green状態）。

## 実行タスク

- TDD原則適用: テストを通過する最小限の実装
- 型バリデーション追加: store.get()結果の型検証
- エラーハンドリング強化: 不正データへのフォールバック
- DEBUGログ整理: 本番コード品質への改善

## 参照資料

| 資料名           | パス                                                                   | 説明               |
| ---------------- | ---------------------------------------------------------------------- | ------------------ |
| Phase 4成果物    | `tasks/TASK-FIX-4-2-SKILL-STORE-PERSISTENCE/phase-04-test-creation.md` | テスト仕様         |
| 現行実装         | `apps/desktop/src/main/services/skill/SkillImportManager.ts`           | 修正対象ファイル   |
| 設計書           | `docs/30-workflows/skill-import-agent-system/technical-decisions.md`   | 永続化設計         |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                     | エラーハンドリング |

## 実行手順

### 1. 問題箇所の特定と修正計画

**修正対象ファイル**: `apps/desktop/src/main/services/skill/SkillImportManager.ts`

| 問題箇所            | 現状コード                             | 修正方針                   |
| ------------------- | -------------------------------------- | -------------------------- |
| L32 型キャスト      | `store.get(STORE_KEY, []) as string[]` | 型バリデーション関数を追加 |
| L27-29 デバッグ     | `console.log` 直接使用                 | 条件付きログまたは削除     |
| L33-37 デバッグ     | `console.log` 直接使用                 | 条件付きログまたは削除     |
| L49, 64-68 デバッグ | `console.log` 直接使用                 | 条件付きログまたは削除     |
| L115-118 デバッグ   | `console.log` 直接使用                 | 条件付きログまたは削除     |

### 2. 型バリデーション関数の実装

```typescript
// apps/desktop/src/main/services/skill/SkillImportManager.ts

/**
 * ストアから取得した値をstring[]として検証・変換する
 *
 * @param value ストアから取得した値（型不明）
 * @returns 検証済みのstring[]（不正な場合は空配列）
 */
function validateStoredSkillIds(value: unknown): string[] {
  // null/undefined チェック
  if (value == null) {
    return [];
  }

  // 配列チェック
  if (!Array.isArray(value)) {
    console.warn(
      "[SkillImportManager] Invalid stored data type, expected array:",
      typeof value,
    );
    return [];
  }

  // 配列内の各要素をフィルタリング（string以外を除外）
  const validIds = value.filter((item): item is string => {
    if (typeof item !== "string") {
      console.warn(
        "[SkillImportManager] Filtered out non-string element:",
        typeof item,
      );
      return false;
    }
    return true;
  });

  return validIds;
}
```

### 3. SkillImportManager修正実装

```typescript
// apps/desktop/src/main/services/skill/SkillImportManager.ts

/**
 * SkillImportManager - スキルのインポート状態を管理する
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import type { ImportResult, RemoveResult } from "@repo/shared";

const STORE_KEY = "importedSkillIds";

/**
 * electron-store互換のストアインターフェース
 */
interface SkillStore {
  get(key: string, defaultValue: string[]): unknown; // 戻り値をunknownに変更
  set(key: string, value: string[]): void;
  path?: string;
}

/**
 * ストアから取得した値をstring[]として検証・変換する
 *
 * @param value ストアから取得した値（型不明）
 * @returns 検証済みのstring[]（不正な場合は空配列）
 */
function validateStoredSkillIds(value: unknown): string[] {
  // null/undefined チェック
  if (value == null) {
    return [];
  }

  // 配列チェック
  if (!Array.isArray(value)) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[SkillImportManager] Invalid stored data type, expected array:",
        typeof value,
      );
    }
    return [];
  }

  // 配列内の各要素をフィルタリング（string以外を除外）
  const validIds = value.filter((item): item is string => {
    if (typeof item !== "string") {
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          "[SkillImportManager] Filtered out non-string element:",
          typeof item,
        );
      }
      return false;
    }
    return true;
  });

  return validIds;
}

export class SkillImportManager {
  private importedIds: Set<string>;
  private store: SkillStore;
  private readonly debug: boolean;

  constructor(store: SkillStore, options?: { debug?: boolean }) {
    this.store = store;
    this.debug = options?.debug ?? process.env.NODE_ENV === "development";

    // デバッグログ: ストアパスの出力（開発環境のみ）
    if (this.debug) {
      console.log("[SkillImportManager] Store path:", store.path ?? "unknown");
    }

    try {
      // 型バリデーション付きでストアから読み込み
      const rawValue = this.store.get(STORE_KEY, []);
      const stored = validateStoredSkillIds(rawValue);

      if (this.debug) {
        console.log(
          "[SkillImportManager] Loaded imported IDs:",
          stored.length,
          "items",
        );
      }

      this.importedIds = new Set(stored);
    } catch (error) {
      console.error("[SkillImportManager] Failed to load from store:", error);
      this.importedIds = new Set();
    }
  }

  /**
   * スキルをインポートする
   */
  async importSkills(skillIds: string[]): Promise<ImportResult> {
    if (this.debug) {
      console.log("[SkillImportManager] importSkills called with:", skillIds);
    }

    const errors: string[] = [];
    let importedCount = 0;

    for (const id of skillIds) {
      if (!this.importedIds.has(id)) {
        this.importedIds.add(id);
        importedCount++;
      }
    }

    if (importedCount > 0) {
      this.persist();
    }

    if (this.debug) {
      console.log(
        "[SkillImportManager] importSkills result:",
        importedCount,
        "new imports",
      );
    }

    return {
      success: errors.length === 0,
      importedCount,
      errors,
    };
  }

  /**
   * スキルを削除する
   */
  async removeSkill(skillId: string): Promise<RemoveResult> {
    if (this.debug) {
      console.log("[SkillImportManager] removeSkill called with:", skillId);
    }

    const removed = this.importedIds.has(skillId);

    if (removed) {
      this.importedIds.delete(skillId);
      this.persist();
    }

    if (this.debug) {
      console.log("[SkillImportManager] removeSkill result:", removed);
    }

    return {
      success: true,
      removed,
    };
  }

  /**
   * インポート済みスキルIDの一覧を取得する
   */
  getImportedSkillIds(): string[] {
    return Array.from(this.importedIds);
  }

  /**
   * スキルがインポート済みかどうかを確認する
   */
  isImported(skillId: string): boolean {
    return this.importedIds.has(skillId);
  }

  /**
   * インポート状態をストアに永続化する
   */
  private persist(): void {
    try {
      const data = Array.from(this.importedIds);

      if (this.debug) {
        console.log("[SkillImportManager] Persisting:", data.length, "items");
      }

      this.store.set(STORE_KEY, data);

      if (this.debug) {
        console.log("[SkillImportManager] Persist successful");
      }
    } catch (error) {
      console.error("[SkillImportManager] Failed to persist:", error);
    }
  }
}
```

### 4. SkillStoreインターフェース型修正

**変更点**:

- `get()` の戻り値を `unknown` に変更（型安全性向上）
- 呼び出し側で `validateStoredSkillIds()` を使用

### 5. DEBUGログの整理方針

| 現状                              | 修正後                | 理由                   |
| --------------------------------- | --------------------- | ---------------------- |
| 無条件 `console.log`              | `this.debug` 条件付き | 本番環境でのログ抑制   |
| `process.env.NODE_ENV !== "test"` | `this.debug` フラグ   | 一貫性のある制御方法   |
| エラーログ                        | `console.error` 維持  | エラーは常に記録すべき |

### 6. 修正差分サマリー

```diff
// SkillImportManager.ts

+ /**
+  * ストアから取得した値をstring[]として検証・変換する
+  */
+ function validateStoredSkillIds(value: unknown): string[] {
+   if (value == null) return [];
+   if (!Array.isArray(value)) return [];
+   return value.filter((item): item is string => typeof item === "string");
+ }

  interface SkillStore {
-   get(key: string, defaultValue: string[]): string[];
+   get(key: string, defaultValue: string[]): unknown;
    set(key: string, value: string[]): void;
    path?: string;
  }

  export class SkillImportManager {
    private importedIds: Set<string>;
    private store: SkillStore;
+   private readonly debug: boolean;

-   constructor(store: SkillStore) {
+   constructor(store: SkillStore, options?: { debug?: boolean }) {
      this.store = store;
+     this.debug = options?.debug ?? process.env.NODE_ENV === "development";

-     if (process.env.NODE_ENV !== "test") {
+     if (this.debug) {
        console.log("[SkillImportManager] Store path:", store.path ?? "unknown");
      }

      try {
-       const stored = this.store.get(STORE_KEY, []) as string[];
+       const rawValue = this.store.get(STORE_KEY, []);
+       const stored = validateStoredSkillIds(rawValue);
        // ...
```

## 成果物

| 成果物                      | パス                                                         | 説明                   |
| --------------------------- | ------------------------------------------------------------ | ---------------------- |
| 修正済み SkillImportManager | `apps/desktop/src/main/services/skill/SkillImportManager.ts` | 型バリデーション追加版 |

## 実装チェックリスト

### 機能要件

- [ ] `validateStoredSkillIds()` 関数が追加されている
- [ ] `store.get()` の戻り値が `unknown` 型になっている
- [ ] 不正な型（null, undefined, string, object）でフォールバックする
- [ ] 配列内の非string要素がフィルタリングされる
- [ ] DEBUGログが `this.debug` フラグで制御されている

### 品質要件

- [ ] Phase 4のテストがすべてパスする
- [ ] 既存のユニットテストが壊れていない
- [ ] 統合テストがすべてパスする
- [ ] TypeScript型エラーがない

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "TASK-FIX-4-2"

# 全テスト実行（既存テストの回帰確認）
pnpm --filter @repo/desktop test

# 型チェック
pnpm --filter @repo/desktop typecheck

# 確認項目
# - [ ] 型バリデーションテストがすべてパス（Green状態）
# - [ ] 永続化サイクルテストがすべてパス（Green状態）
# - [ ] 既存テストが壊れていない
```

## 次のPhase

Phase 6: テスト拡充
