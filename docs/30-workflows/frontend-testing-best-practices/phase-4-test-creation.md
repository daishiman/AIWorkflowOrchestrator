# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| Phase名    | テスト作成（TDD: Red）          |
| 前提Phase  | Phase 3                         |
| 後続Phase  | Phase 5                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-04                      |
| 機能名     | frontend-testing-best-practices |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 背景

TDDサイクルの最初のフェーズとして、まず失敗するテストを作成する。これにより、実装の目標が明確になる。

---

## 使用エージェント

| エージェント | パス                            | 選定理由                  |
| ------------ | ------------------------------- | ------------------------- |
| unit-tester  | `.claude/agents/unit-tester.md` | テスト作成・TDD実践に特化 |

**代替候補**: `.claude/agents/frontend-tester.md`

---

## 使用スキル

| スキル名                | パス                                              | 活用方法             | 選定理由              |
| ----------------------- | ------------------------------------------------- | -------------------- | --------------------- |
| tdd-principles          | `.claude/skills/tdd-principles/SKILL.md`          | TDD原則適用          | Red-Green-Refactor    |
| frontend-testing        | `.claude/skills/frontend-testing/SKILL.md`        | フロントエンドテスト | React Testing Library |
| boundary-value-analysis | `.claude/skills/boundary-value-analysis/SKILL.md` | 境界値テスト         | エッジケース網羅      |

---

## 参照資料

| 参照資料           | パス                                      | 内容          |
| ------------------ | ----------------------------------------- | ------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`  | Phase 2成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Phase 3成果物 |

---

## 実行手順

### ステップ1: MSWハンドラーのテスト作成

```typescript
// apps/desktop/src/test/mocks/handlers.test.ts
import { describe, it, expect } from "vitest";
import { server } from "./server";

describe("MSW Handlers", () => {
  it("Supabase Auth APIがモックされる", async () => {
    const response = await fetch("https://xxx.supabase.co/auth/v1/token", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "test" }),
    });
    const data = await response.json();
    expect(data.access_token).toBeDefined();
  });

  it("Anthropic Messages APIがモックされる", async () => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] }),
    });
    const data = await response.json();
    expect(data.content).toBeDefined();
  });
});
```

### ステップ2: テストユーティリティのテスト作成

```typescript
// apps/desktop/src/test/utils.test.tsx
import { describe, it, expect } from 'vitest';
import { renderWithRouter, renderWithProviders } from './utils';

describe('Test Utilities', () => {
  it('renderWithRouterがRouter込みでレンダリングする', () => {
    // このテストは現時点では失敗する（Red）
    const { getByText } = renderWithRouter(<div>Test</div>);
    expect(getByText('Test')).toBeInTheDocument();
  });

  it('mockStoreがZustandストアを正しくモックする', () => {
    // このテストは現時点では失敗する（Red）
  });
});
```

### ステップ3: E2Eテストのスケルトン作成

```typescript
// apps/desktop/e2e/critical-flows.spec.ts
import { test, expect } from "@playwright/test";

test.describe("クリティカルフロー", () => {
  test("初回セットアップ → チャット送信", async ({ page }) => {
    // このテストは現時点では失敗する（Red）
    await page.goto("/");
    await expect(page.getByRole("button", { name: "設定" })).toBeVisible();
  });

  test("ワークスペース検索", async ({ page }) => {
    // このテストは現時点では失敗する（Red）
  });

  test("チャット履歴エクスポート", async ({ page }) => {
    // このテストは現時点では失敗する（Red）
  });
});
```

### ステップ4: カバレッジ閾値テスト

```bash
# 閾値設定後、テスト実行で失敗することを確認（Red）
pnpm test:coverage
# Expected: 閾値未達で失敗
```

---

## 成果物

| 成果物               | パス                                    | 内容                 |
| -------------------- | --------------------------------------- | -------------------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md` | テスト設計           |
| テストケース一覧     | `outputs/phase-4/test-cases.md`         | ケース一覧           |
| MSWテスト            | `apps/desktop/src/test/mocks/*.test.ts` | モックテストコード   |
| ユーティリティテスト | `apps/desktop/src/test/*.test.ts`       | ヘルパーテストコード |
| E2Eスケルトン        | `apps/desktop/e2e/*.spec.ts`            | E2Eテストスケルトン  |

---

## 完了条件

- [ ] MSWハンドラーのテストが作成されている（失敗状態）
- [ ] テストユーティリティのテストが作成されている（失敗状態）
- [ ] E2Eテスト10本以上のスケルトンが作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標（80%）が設定されている

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## スキルフィードバック記録

| スキル                  | 結果 | 備考 |
| ----------------------- | ---- | ---- |
| tdd-principles          | -    | -    |
| frontend-testing        | -    | -    |
| boundary-value-analysis | -    | -    |

---

## 次のPhase

`docs/30-workflows/frontend-testing-best-practices/phase-5-implementation.md`
