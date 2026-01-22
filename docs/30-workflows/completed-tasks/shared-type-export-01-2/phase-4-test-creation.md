# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 4                     |
| Phase名    | テスト作成            |
| 前提Phase  | Phase 3               |
| 後続Phase  | Phase 5               |
| ステータス | 未実施                |
| 作成日     | 2026-01-22            |
| 機能名     | shared-type-export-01 |

---

## 目的

TDD Red状態：型エクスポートを検証するテストを作成し、現時点では失敗することを確認する。

## 背景

テスト駆動開発の原則に従い、実装前にテストを作成する。型エクスポートのテストは主に型チェックで検証される。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型インポートテスト作成

**目的**: バレルファイルからの型インポートが正常に動作することを確認するテスト

**実行手順**:

1. `packages/shared/src/services/graph/index.test.ts` を作成（または更新）
2. 以下のテストを追加:

```typescript
import { describe, it, expect } from "vitest";

describe("services/graph exports", () => {
  describe("type exports", () => {
    it("should export Community type", async () => {
      const module = await import("./index");
      // 型のみのエクスポートは実行時に存在しないため、
      // TypeScriptコンパイルが成功することで検証
      expect(module).toBeDefined();
    });

    it("should export CommunityErrorCode enum", async () => {
      const { CommunityErrorCode } = await import("./index");
      expect(CommunityErrorCode).toBeDefined();
    });

    it("should export CommunityDetectionError class", async () => {
      const { CommunityDetectionError } = await import("./index");
      expect(CommunityDetectionError).toBeDefined();
    });
  });
});
```

3. テストを実行し、失敗することを確認（Red状態）

**期待される成果物**:

- `packages/shared/src/services/graph/index.test.ts`

---

### タスク2: 型互換性テスト作成

**目的**: 型の互換性を確認するテスト

**実行手順**:

1. 同じテストファイルに以下を追加:

```typescript
import type { Community, CommunitySummary, StoredEntity } from "./index";

describe("type compatibility", () => {
  it("Community type should have required properties", () => {
    // 型チェックのためのダミーオブジェクト
    const community: Community = {
      id: "c-1" as any, // CommunityId branded type
      level: 0,
      memberEntityIds: [],
      childCommunityIds: [],
      size: 0,
      internalEdges: 0,
      externalEdges: 0,
      modularity: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(community).toBeDefined();
  });
});
```

2. テストを実行し、失敗することを確認（Red状態）

**期待される成果物**:

- 型互換性テストの追加

---

### タスク3: TDD Red状態の確認

**目的**: テストが失敗することを確認

**実行手順**:

1. 以下のコマンドを実行:

```bash
pnpm --filter @repo/shared test -- --run services/graph/index.test.ts
```

2. テストが失敗することを確認
3. 失敗理由を記録（型がエクスポートされていない等）

**期待される成果物**:

- テスト実行結果（Red状態）

---

## 参照資料

| 参照資料 | パス                               | 内容             |
| -------- | ---------------------------------- | ---------------- |
| 設計書   | `outputs/phase-2/design.md`        | エクスポート構造 |
| レビュー | `outputs/phase-3/review-result.md` | レビュー結果     |

---

## 成果物

| 成果物               | パス                                               | 内容          |
| -------------------- | -------------------------------------------------- | ------------- |
| 型エクスポートテスト | `packages/shared/src/services/graph/index.test.ts` | TDD Redテスト |

---

## 統合テスト連携

**Phase 4 アクション**: 型インポートテストを作成

- バレルファイルからの型インポートテスト
- 各エクスポート対象の存在確認テスト

---

## 完了条件

- [ ] 型インポートテストを作成
- [ ] 型互換性テストを作成
- [ ] テストを実行し、失敗することを確認（Red状態）

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run services/graph/index.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること（PASS判定）
- **後続**: Phase 5 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-5-implementation.md`
