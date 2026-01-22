# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 6                     |
| Phase名    | テスト拡充            |
| 前提Phase  | Phase 5               |
| 後続Phase  | Phase 7               |
| ステータス | 未実施                |
| 作成日     | 2026-01-22            |
| 機能名     | shared-type-export-01 |

---

## 目的

テストカバレッジを向上させるために、追加テストを作成する。

## 背景

Phase 4 で作成した基本テストに加え、より網羅的なテストを追加してカバレッジ目標を達成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エクスポート網羅性テスト

**目的**: 全てのエクスポートが正しく行われていることを確認

**実行手順**:

1. `packages/shared/src/services/graph/index.test.ts` に以下を追加:

```typescript
describe("complete export verification", () => {
  it("should export all Community-related types", async () => {
    // 型のみのエクスポートはTypeScriptコンパイル時に検証
    // ここでは値のエクスポートを検証
    const module = await import("./index");

    // 値のエクスポート確認
    expect(module.CommunityErrorCode).toBeDefined();
    expect(module.CommunityDetectionError).toBeDefined();
    expect(module.CommunitySummarizationErrorCode).toBeDefined();
    expect(module.CommunitySummarizationError).toBeDefined();
    expect(module.normalizeEntityName).toBeDefined();
  });

  it("should export CommunityErrorCode with correct values", async () => {
    const { CommunityErrorCode } = await import("./index");
    expect(CommunityErrorCode.GRAPH_LOAD_FAILED).toBeDefined();
    expect(CommunityErrorCode.DETECTION_FAILED).toBeDefined();
  });

  it("normalizeEntityName should be a function", async () => {
    const { normalizeEntityName } = await import("./index");
    expect(typeof normalizeEntityName).toBe("function");
  });
});
```

**期待される成果物**:

- 拡充されたテストファイル

---

### タスク2: 型インポート互換性テスト

**目的**: 実際の使用パターンでのインポートが動作することを確認

**実行手順**:

1. 同じテストファイルに以下を追加:

```typescript
describe("import compatibility", () => {
  it("should support named type imports", async () => {
    // この形式のインポートが動作することを確認
    // import type { Community } from "@repo/shared/services/graph";
    const module = await import("./index");
    expect(module).toBeDefined();
  });

  it("should support named value imports", async () => {
    // この形式のインポートが動作することを確認
    // import { CommunityErrorCode } from "@repo/shared/services/graph";
    const { CommunityErrorCode } = await import("./index");
    expect(CommunityErrorCode).toBeDefined();
  });
});
```

**期待される成果物**:

- インポート互換性テスト

---

### タスク3: テスト実行と結果確認

**目的**: 全テストがパスすることを確認

**実行手順**:

1. 以下のコマンドを実行:

```bash
pnpm --filter @repo/shared test -- --run services/graph/index.test.ts
```

2. 全テストがパスすることを確認

**期待される成果物**:

- テスト実行結果

---

## 参照資料

| 参照資料       | パス                                               | 内容       |
| -------------- | -------------------------------------------------- | ---------- |
| Phase 4 テスト | `packages/shared/src/services/graph/index.test.ts` | 基本テスト |

---

## 成果物

| 成果物             | パス                                               | 内容         |
| ------------------ | -------------------------------------------------- | ------------ |
| 拡充テストファイル | `packages/shared/src/services/graph/index.test.ts` | テスト拡充版 |

---

## 統合テスト連携

**Phase 6 アクション**: 各型のインポートテストを拡充

- 全エクスポート対象の存在確認
- 実際の使用パターンでのインポート確認

---

## 完了条件

- [ ] エクスポート網羅性テストを追加
- [ ] 型インポート互換性テストを追加
- [ ] 全テストがパス

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-7-coverage-check.md`
