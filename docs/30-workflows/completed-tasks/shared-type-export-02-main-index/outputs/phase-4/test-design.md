# Phase 4: テスト設計書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| タスクID   | SHARED-TYPE-EXPORT-02 |
| Phase      | 4                     |
| 作成日     | 2026-01-14            |
| ステータス | 完了                  |

---

## 1. 既存テストパターンの確認

### 1.1 既存のテストファイル

`packages/shared/src/services/graph/__tests__/type-exports.test.ts` を確認。

### 1.2 テストパターン

```typescript
// 動的インポートを使用したエクスポート検証
const module = await import("../index");
expect(module).toBeDefined();

// enum 値の検証
const { CommunityErrorCode } = await import("../index");
expect(CommunityErrorCode.DETECTION_FAILED).toBe("DETECTION_FAILED");

// class のインスタンス検証
const { CommunityDetectionError, CommunityErrorCode } =
  await import("../index");
const error = new CommunityDetectionError("Test", CommunityErrorCode.NOT_FOUND);
expect(error).toBeInstanceOf(Error);

// function の検証
const { normalizeEntityName } = await import("../index");
expect(typeof normalizeEntityName).toBe("function");
```

---

## 2. テストケース設計

### 2.1 テストケース一覧

| テストケース | 検証内容                                          |
| ------------ | ------------------------------------------------- |
| 型インポート | `@repo/shared` から必要な型がインポートできること |
| 値インポート | enum, class, 関数がインポートできること           |
| 型の整合性   | インポートした型が期待される構造を持つこと        |

### 2.2 テストファイルの配置場所

`packages/shared/__tests__/type-exports-main.test.ts`

---

## 3. テストコード設計

### 3.1 テストコードの擬似コード

```typescript
// packages/shared/__tests__/type-exports-main.test.ts

import { describe, it, expect } from "vitest";

/**
 * メインエントリポイント（@repo/shared）からの型エクスポートテスト
 *
 * このテストは、@repo/shared のメインindex.tsから
 * Community関連型が正しくエクスポートされていることを検証する。
 */
describe("@repo/shared main exports", () => {
  describe("Module export", () => {
    it("should export module from index", async () => {
      const module = await import("../index");
      expect(module).toBeDefined();
    });
  });

  describe("Graph Service exports", () => {
    it("should export CommunityErrorCode enum", async () => {
      const { CommunityErrorCode } = await import("../index");
      expect(CommunityErrorCode).toBeDefined();
      expect(CommunityErrorCode.DETECTION_FAILED).toBe("DETECTION_FAILED");
    });

    it("should export CommunityDetectionError class", async () => {
      const { CommunityDetectionError, CommunityErrorCode } =
        await import("../index");
      expect(CommunityDetectionError).toBeDefined();

      const error = new CommunityDetectionError(
        "Test error",
        CommunityErrorCode.NOT_FOUND,
      );
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe(CommunityErrorCode.NOT_FOUND);
    });

    it("should export CommunitySummarizationErrorCode enum", async () => {
      const { CommunitySummarizationErrorCode } = await import("../index");
      expect(CommunitySummarizationErrorCode).toBeDefined();
      expect(CommunitySummarizationErrorCode.LLM_GENERATION_FAILED).toBe(
        "LLM_GENERATION_FAILED",
      );
    });

    it("should export CommunitySummarizationError class", async () => {
      const { CommunitySummarizationError, CommunitySummarizationErrorCode } =
        await import("../index");
      expect(CommunitySummarizationError).toBeDefined();

      const error = new CommunitySummarizationError(
        "Test error",
        CommunitySummarizationErrorCode.LLM_GENERATION_FAILED,
      );
      expect(error).toBeInstanceOf(Error);
    });

    it("should export normalizeEntityName function", async () => {
      const { normalizeEntityName } = await import("../index");
      expect(normalizeEntityName).toBeDefined();
      expect(typeof normalizeEntityName).toBe("function");
      expect(normalizeEntityName("TypeScript 5.x")).toBe("typescript 5x");
    });
  });

  describe("RAG types exports", () => {
    it("should export CommunityId type helper", async () => {
      const { createCommunityId } = await import("../index");
      expect(createCommunityId).toBeDefined();
      expect(typeof createCommunityId).toBe("function");

      const id = createCommunityId("test-id");
      expect(id).toBe("test-id");
    });

    it("should export EntityId type helper", async () => {
      const { createEntityId } = await import("../index");
      expect(createEntityId).toBeDefined();
      expect(typeof createEntityId).toBe("function");

      const id = createEntityId("test-id");
      expect(id).toBe("test-id");
    });

    it("should export generateCommunityId function", async () => {
      const { generateCommunityId } = await import("../index");
      expect(generateCommunityId).toBeDefined();
      expect(typeof generateCommunityId).toBe("function");
    });

    it("should export generateEntityId function", async () => {
      const { generateEntityId } = await import("../index");
      expect(generateEntityId).toBeDefined();
      expect(typeof generateEntityId).toBe("function");
    });

    it("should export Result type helpers", async () => {
      const { ok, err, isOk, isErr } = await import("../index");
      expect(ok).toBeDefined();
      expect(err).toBeDefined();
      expect(isOk).toBeDefined();
      expect(isErr).toBeDefined();
    });
  });
});
```

---

## 4. Red状態の確認方法

### 4.1 現時点でのテスト失敗

現時点では `@repo/shared` から以下がインポートできないため、テストは失敗する:

- Graph Service の型・値（`CommunityErrorCode`, `CommunityDetectionError` など）
- RAG 型（`CommunityId`, `EntityId`, `createCommunityId` など）

### 4.2 確認コマンド

```bash
# メインindex.tsからのインポートを試行（失敗するはず）
pnpm --filter @repo/shared typecheck
```

---

## 5. 完了確認

- [x] 既存のテストパターンが把握されている
- [x] テストケースが設計されている
- [x] テストコードの擬似コードが作成されている
- [x] テスト設計書が出力されている
- [x] テストが失敗状態（Red）であることが確認されている

---

## 6. 次のアクション

Phase 5（実装）へ進む。

設計したエクスポートを実装し、テストを通過させる（Green状態）。
