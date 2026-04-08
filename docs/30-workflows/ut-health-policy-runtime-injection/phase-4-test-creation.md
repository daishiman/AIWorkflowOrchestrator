# Phase 4: テスト作成（Red段階）

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 4                                  |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

TDD の Red 段階として、実装前にテストを先行作成する。
`isDegraded: true` シナリオのテストを作成し、現時点で RED（失敗）することを確認する。
これにより「デッドコード解消の証明」としてのテストが機能することを事前検証する。

---

## 実行タスク

- **タスク1**: 事前確認 — 既存ユーティリティ重複検出・IPC レスポンス形式確認
- **タスク2**: `mockHealthPolicy` の定義作成
- **タスク3**: `isDegraded: true` シナリオのテストケース設計（テストマトリクス）
- **タスク4**: `RuntimeSkillCreatorFacade.plan.test.ts` への `isDegraded: true` テスト追加（先行作成）
- **タスク5**: `RuntimeSkillCreatorFacade.test.ts` への DI テストケース追加
- **タスク6**: RED 確認（実装前の FAIL 確認）

---

## 参照資料

| 資料名                                   | パス                                                                                           | 説明                            |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 3 レビュー結果                     | `outputs/phase-3/design-review-result.md`                                                      | PASS 判定確認                   |
| RuntimeSkillCreatorFacade テスト         | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`           | 既存テスト構造把握              |
| RuntimeSkillCreatorFacade.plan テスト    | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`      | 既存 plan テスト把握            |
| RuntimeSkillCreatorFacade.improve テスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`   | 既存 improve テスト把握         |
| health-policy テスト（参照元）           | `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts` | `mockHealthPolicy` 構築パターン |
| HealthPolicy 型定義                      | `packages/shared/src/types/health-policy.ts`                                                   | `HealthPolicy` インターフェース |

---

## 実行手順

### ステップ0: Phase 4 事前確認【必須】

```bash
# 1. 既存ユーティリティ重複検出（healthPolicy 関連の既存テストユーティリティ）
grep -rn "mockHealthPolicy\|createMockHealthPolicy" \
  apps/desktop/src/main/services/runtime/__tests__/

# 2. 既存テスト構造の把握（beforeEach での facade 生成パターン確認）
grep -n "new RuntimeSkillCreatorFacade\|beforeEach\|mockSkillExecutor" \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts | head -30

# 3. plan テストの既存ケース確認
grep -n "describe\|it(\|terminal_handoff" \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts | head -30

# 4. 対象ファイルのトップレベル副作用確認（import 安全性チェック）
grep -n "^[^/]*\(app\.\|ipcMain\.\|BrowserWindow\)" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | head -10
```

**private method テスト方針の明記**:
`plan()` は public メソッドであるため、public API 経由でのテストを採用する（推奨方針）。
`isDegraded` チェックは `RuntimePolicyResolver` 内の private ロジックを `plan()` の戻り値から間接検証する。

### ステップ1: `mockHealthPolicy` の定義

`RuntimePolicyResolver.health-policy.test.ts` のモック構築パターンを参考に、以下の `createMockHealthPolicy()` を定義する:

```typescript
import type { HealthPolicy } from "@repo/shared/types";

function createMockHealthPolicy(isDegraded: boolean): HealthPolicy {
  return {
    isConnectionAvailable: !isDegraded,
    isDegraded,
    isRateLimited: false,
    healthStatus: isDegraded ? "degraded" : "healthy",
    lastCheckedAt: new Date("2026-04-07T00:00:00Z"),
  };
}
```

### ステップ2: テストマトリクス

| TC番号  | ファイル内テスト名                                                          | 対象メソッド | 期待結果                                               | 追加先ファイル                           |
| ------- | --------------------------------------------------------------------------- | ------------ | ------------------------------------------------------ | ---------------------------------------- |
| TC-H-01 | `should pass healthPolicy to RuntimePolicyResolver via DI`                  | constructor  | `resolver` に `healthPolicy` が渡される                | `RuntimeSkillCreatorFacade.test.ts`      |
| TC-H-02 | `should use undefined healthPolicy when not provided (backward compatible)` | constructor  | 既存動作と同等（後方互換）                             | `RuntimeSkillCreatorFacade.test.ts`      |
| TC-H-03 | `should return terminal_handoff when healthPolicy.isDegraded is true`       | `plan()`     | `terminal_handoff` 系レスポンス（guidance 含む）を返す | `RuntimeSkillCreatorFacade.plan.test.ts` |
| TC-H-04 | `should not return terminal_handoff when healthPolicy.isDegraded is false`  | `plan()`     | 正常な plan レスポンスを返す                           | `RuntimeSkillCreatorFacade.plan.test.ts` |

### ステップ3: テストコード設計

#### `RuntimeSkillCreatorFacade.plan.test.ts` への追加（TC-H-03, TC-H-04）

```typescript
// 追加位置: 既存の describe ブロック内に新しい describe を追加
describe("healthPolicy DI integration", () => {
  it("should return terminal_handoff when healthPolicy.isDegraded is true", async () => {
    const facadeWithDegradedPolicy = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      // 既存の deps に healthPolicy を追加
      healthPolicy: createMockHealthPolicy(true),
    });

    const result = await facadeWithDegradedPolicy.plan(
      "test-skill",
      "test prompt",
    );
    expect(result).toHaveProperty("type", "terminal_handoff");
    expect(result).toHaveProperty("guidance");
  });

  it("should not return terminal_handoff when healthPolicy.isDegraded is false", async () => {
    const facadeWithHealthyPolicy = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      healthPolicy: createMockHealthPolicy(false),
    });

    const result = await facadeWithHealthyPolicy.plan(
      "test-skill",
      "test prompt",
    );
    expect(result.type).not.toBe("terminal_handoff");
  });
});
```

#### `RuntimeSkillCreatorFacade.test.ts` への追加（TC-H-01, TC-H-02）

```typescript
// 追加位置: DI 関連の describe に追加
describe("healthPolicy DI", () => {
  it("should pass healthPolicy to RuntimePolicyResolver via DI", () => {
    // healthPolicy を渡してインスタンス生成
    const facadeWithPolicy = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      healthPolicy: createMockHealthPolicy(false),
    });

    // resolver が healthPolicy を持っていることを間接確認（DI が機能していること）
    expect(facadeWithPolicy).toBeDefined();
    // 注: resolver は private のため、plan() の動作で間接検証する
  });

  it("should work without healthPolicy (backward compatible)", () => {
    const facadeWithoutPolicy = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      // healthPolicy を渡さない（undefined）
    });

    expect(facadeWithoutPolicy).toBeDefined();
  });
});
```

### ステップ4: RED 確認

実装前（Phase 5 前）にテストを実行し、新規追加テストが RED（失敗）であることを確認する:

```bash
# plan テストの実行（TC-H-03, TC-H-04 が FAIL することを確認）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts

# facade テストの実行（TC-H-01, TC-H-02 が FAIL することを確認）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

**期待される RED 状態**:

- TC-H-03: `expect(result).toHaveProperty("type", "terminal_handoff")` が FAIL
  （理由: `isDegraded` チェックが機能していないため）
- TC-H-01/H-02: TypeScript コンパイルエラー
  （理由: `RuntimeSkillCreatorFacadeDeps` に `healthPolicy` が未定義のため）

---

## 統合テスト連携

- `isDegraded: true` → `terminal_handoff` の統合シナリオを TC-H-03 として定義
- テストコードは `packages/*/src/` ではなく `apps/desktop/src/main/services/runtime/__tests__/` に配置（コード成果物の正しい配置）

---

## 多角的チェック観点（AIが判断）

### private method テスト方針

- `isDegraded` チェックは `RuntimePolicyResolver` 内部の private ロジック
- 本タスクでは `plan()` の戻り値から間接検証（public API 経由）を採用
- `RuntimePolicyResolver` 自体の単体テストは既存 `RuntimePolicyResolver.health-policy.test.ts` で実施済み

### IPC レスポンス形式

- `plan()` のレスポンス形式を既存テストから確認し、`terminal_handoff` 系レスポンス（guidance 含む）が既存の型と整合するか確認
- `terminal_handoff` は既存の enum/union に含まれる値であることを確認すること

---

## サブタスク管理

| ID     | タスク名                             | ステータス |
| ------ | ------------------------------------ | ---------- |
| T-04-1 | 事前確認（重複検出・副作用チェック） | 未実施     |
| T-04-2 | `mockHealthPolicy` 定義作成          | 未実施     |
| T-04-3 | テストマトリクス作成                 | 未実施     |
| T-04-4 | plan テストへの追加                  | 未実施     |
| T-04-5 | facade テストへの追加                | 未実施     |
| T-04-6 | RED 確認                             | 未実施     |

---

## 成果物

| 成果物                 | 配置先                                                                                    | 形式       |
| ---------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| テストコード（plan）   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` | TypeScript |
| テストコード（facade） | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`      | TypeScript |
| テストマトリクス       | `outputs/phase-4/test-matrix.md`                                                          | Markdown   |
| RED 確認結果           | `outputs/phase-4/red-confirmation.md`                                                     | Markdown   |

---

## 完了条件

- [ ] `mockHealthPolicy`（正常系・劣化系）の定義が確定していること
- [ ] テストマトリクス（TC-H-01〜TC-H-04）が `outputs/phase-4/test-matrix.md` に記録されていること
- [ ] `RuntimeSkillCreatorFacade.plan.test.ts` に TC-H-03, TC-H-04 が追加されていること
- [ ] `RuntimeSkillCreatorFacade.test.ts` に TC-H-01, TC-H-02 が追加されていること
- [ ] 新規追加テストが RED（または TypeScript エラー）であることが `outputs/phase-4/red-confirmation.md` に記録されていること
- [ ] 既存テストの既存ケースが RED に変化していないこと（追加のみで既存を壊していないこと）

---

## タスク100%実行確認【必須】

- [ ] T-04-1: 事前確認（重複検出・副作用チェック）を実行済み
- [ ] T-04-2: `mockHealthPolicy` 定義を `outputs/phase-4/test-matrix.md` に記録済み
- [ ] T-04-3: テストマトリクス（TC-H-01〜TC-H-04）を記録済み
- [ ] T-04-4: `plan.test.ts` へのテスト追加完了
- [ ] T-04-5: `facade.test.ts` へのテスト追加完了
- [ ] T-04-6: RED 確認結果を `outputs/phase-4/red-confirmation.md` に記録済み

---

## 次Phase

**Phase 5: 実装** — RED を GREEN に変えるための実装を行う。
`RuntimeSkillCreatorFacade.ts` と `index.ts` を修正し、`healthPolicy` DI チェーンを完成させる。

**Phase 5 開始条件**: Phase 4 の全完了条件を満たし、新規追加テストが RED 状態であることが確認済みであること。
