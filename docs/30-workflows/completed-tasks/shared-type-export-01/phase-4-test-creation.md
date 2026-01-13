# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 4                     |
| Phase名    | テスト作成            |
| 前提Phase  | Phase 3               |
| 後続Phase  | Phase 5               |
| ステータス | 未実施                |
| 作成日     | 2026-01-13            |
| 機能名     | shared-type-export-01 |

---

## 目的

TDDの「Red」フェーズとして、型エクスポートの検証テストを実装より先に作成する。テストは実装前に失敗する状態（Red）であることを確認する。

## 背景

型のエクスポートが正しく機能することを検証するため、型インポートテストを作成する。このテストは `index.ts` が存在しない現時点では失敗する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型インポートテストの作成

**目的**: 型が正しくエクスポートされていることを検証するテストを作成する

**実行手順**:

1. テストファイル `packages/shared/src/services/graph/__tests__/type-exports.test.ts` を作成
2. 各型のインポートテストを記述
3. テストが失敗すること（Red）を確認

**テストコード例**:

```typescript
/**
 * @file 型エクスポートテスト
 * @description services/graph/index.ts からの型エクスポートを検証
 */
import { describe, it, expect } from "vitest";

describe("services/graph type exports", () => {
  describe("Entity types", () => {
    it("should export StoredEntity type", async () => {
      const module = await import("../index");
      // 型エクスポートは実行時には存在しないため、
      // モジュール自体がインポートできることを確認
      expect(module).toBeDefined();
    });
  });

  describe("Community types", () => {
    it("should export Community type", async () => {
      const module = await import("../index");
      expect(module).toBeDefined();
    });

    it("should export CommunityErrorCode enum", async () => {
      const { CommunityErrorCode } = await import("../index");
      expect(CommunityErrorCode).toBeDefined();
      expect(CommunityErrorCode.GRAPH_LOAD_FAILED).toBe("GRAPH_LOAD_FAILED");
    });

    it("should export CommunityDetectionError class", async () => {
      const { CommunityDetectionError, CommunityErrorCode } =
        await import("../index");
      expect(CommunityDetectionError).toBeDefined();
      const error = new CommunityDetectionError(
        "test",
        CommunityErrorCode.NOT_FOUND,
      );
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe(CommunityErrorCode.NOT_FOUND);
    });
  });

  describe("Utility functions", () => {
    it("should export normalizeEntityName function", async () => {
      const { normalizeEntityName } = await import("../index");
      expect(normalizeEntityName).toBeDefined();
      expect(typeof normalizeEntityName).toBe("function");
      expect(normalizeEntityName("TypeScript 5.x")).toBe("typescript 5x");
    });
  });
});
```

**期待される成果物**:

- テストファイル（実装: `packages/shared/src/services/graph/__tests__/type-exports.test.ts`）

---

### タスク2: 型チェックテストの作成

**目的**: TypeScriptの型チェックで型が正しくインポートできることを検証する

**実行手順**:

1. 型チェック用のテストファイルを作成
2. 各型のインポートと使用を記述
3. `tsc --noEmit` で検証できる構造にする

**型チェックテストコード例**:

```typescript
/**
 * @file 型チェックテスト
 * @description コンパイル時の型チェックで検証
 * このファイルはTypeScriptコンパイラによる型チェックのみで使用
 */
import type {
  StoredEntity,
  Community,
  CommunitySummary,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
} from "../index";

// 型が正しくインポートできることを検証
// 実行時には使用しない（型チェックのみ）
type _StoredEntityCheck = StoredEntity;
type _CommunityCheck = Community;
type _CommunitySummaryCheck = CommunitySummary;
type _CommunityStructureCheck = CommunityStructure;
type _CommunityDetectionOptionsCheck = CommunityDetectionOptions;
type _CommunityDetectionResultCheck = CommunityDetectionResult;

// コンパイルエラーがなければ型エクスポートは正しい
export {};
```

**期待される成果物**:

- 型チェックファイル（実装: `packages/shared/src/services/graph/__tests__/type-check.ts`）

---

### タスク3: テスト失敗の確認（Red状態）

**目的**: テストが失敗すること（Red状態）を確認する

**実行手順**:

1. テストを実行し、失敗することを確認
2. 失敗理由が「index.ts が存在しない」であることを確認
3. 失敗結果を記録

**実行コマンド**:

```bash
pnpm --filter @repo/shared test -- --run services/graph/__tests__/type-exports.test.ts
```

**期待される成果物**:

- Red状態確認レポート（出力: `outputs/phase-4/red-state-report.md`）

---

## 参照資料

| 参照資料           | パス                                                                            | 内容                 |
| ------------------ | ------------------------------------------------------------------------------- | -------------------- |
| Phase 2設計        | `outputs/phase-2/export-structure-design.md`                                    | エクスポート構造設計 |
| テストテンプレート | `.claude/skills/task-specification-creator/assets/integration-test-template.md` | テストテンプレート   |

---

## 成果物

| 成果物               | パス                                                                | 内容             |
| -------------------- | ------------------------------------------------------------------- | ---------------- |
| 型エクスポートテスト | `packages/shared/src/services/graph/__tests__/type-exports.test.ts` | ユニットテスト   |
| 型チェックファイル   | `packages/shared/src/services/graph/__tests__/type-check.ts`        | 型検証ファイル   |
| Red状態レポート      | `outputs/phase-4/red-state-report.md`                               | 失敗確認レポート |

---

## 統合テスト連携（Phase 1〜11は必須）

### 統合テストシナリオ設計

| シナリオカテゴリ   | 検証内容                             |
| ------------------ | ------------------------------------ |
| 型インポートテスト | バレルファイルからの型インポート成功 |
| 型チェックテスト   | TypeScriptコンパイラによる型検証     |

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run services/graph/__tests__/type-exports.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）
- [ ] 失敗理由が「index.ts が存在しない」であること

---

## 完了条件

- [ ] 型エクスポートテストが作成されている
- [ ] 型チェックファイルが作成されている
- [ ] 全てのテストが失敗状態（Red）
- [ ] 失敗理由が期待通り（index.ts が存在しない）
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 4 ステータスを `completed` に更新

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-5-implementation.md`
