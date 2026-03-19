# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 4                                     |
| Phase名    | テスト作成                            |
| タスクID   | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 |
| 前提Phase  | Phase 3（設計レビュー）               |
| 後続Phase  | Phase 5（実装）                       |
| ステータス | not_started                           |
| 作成日     | 2026-03-17                            |
| 機能名     | skillcenter-create-route              |

## 目的

テストファーストの原則に従い、実装前にテストコードを作成する。受入基準 AC-1〜AC-8 を網羅するテストケースを設計し、実装の正確性を担保する。P39 準拠（happy-dom 環境では fireEvent を使用）、P31 対策（個別セレクタ形式の検証）を含む。

## 実行タスク

- useSkillCenter ユニットテスト作成: `navigateToSkillCreate` / `navigateToWorkspace` / `navigateToSkillAnalysis` の3アクションが正しく ViewType を遷移させることをテストする
- ヘッダーCTA テスト作成: SkillCenterView ヘッダーに「+ 新しいツールを作る」ボタンが描画され、クリックで `navigateToSkillCreate` が呼ばれることをテストする
- JourneyPanel CTA テスト作成: SkillLifecycleJourneyPanel の各ステップカードに `ctaLabel` / `onAction` があるとき CTA ボタンが描画され、クリックで `onAction` が呼ばれることをテストする
- モバイルレスポンシブテスト作成: 768px 未満のビューポートでヘッダー CTA がアイコンのみ表示になることをテストする
- P31 対策検証テスト作成: `useSkillCenter` が合成 Hook（`useSkillCenterStore()` 等）を直接使用しておらず、個別セレクタ形式で実装されていることを確認するテストを追加する

## 参照資料

| 参照資料            | パス                                                                                     | 内容                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Phase 2（設計）     | `phase-2-design.md`                                                                      | 各コンポーネントの Props 型・Zustand 接続方法を確認する  |
| Phase 3（レビュー） | `phase-3-design-review.md`                                                               | 設計レビューで確定した仕様を確認する                     |
| SkillCenterView     | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                              | 現在の実装構造を確認し、テスト対象を特定する             |
| useSkillCenter      | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                | 既存のアクション定義パターンを確認する                   |
| JourneyPanel        | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillLifecycleJourneyPanel/` | 既存のレンダリングロジックと Props 契約を確認する        |
| P39 対策            | `.claude/rules/06-known-pitfalls.md#P39`                                                 | happy-dom 環境では fireEvent を使用する                  |
| P31 対策            | `.claude/rules/06-known-pitfalls.md#P31`                                                 | Zustand 個別セレクタ形式で合成 Hook 無限ループを回避する |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand 個別セレクタ・P31/P48 対策パターン                 |
| ui-ux-design-principles              | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG / WCAG 2.1 AA の一次正本（AC-7/AC-8 テスト対象） |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 2 設計・Phase 3 レビュー報告・現状コードを確認し、テスト対象と期待値を把握する。

### ステップ2: useSkillCenter ユニットテストを作成する

```typescript
// apps/desktop/src/renderer/views/SkillCenterView/hooks/__tests__/useSkillCenter.test.ts

import { renderHook, act } from "@testing-library/react";
import { useSkillCenter } from "../useSkillCenter";

// Zustand store のモック
vi.mock("../../../../../../store", () => ({
  useSetCurrentView: vi.fn(() => vi.fn()),
}));

describe("useSkillCenter - ナビゲーションアクション", () => {
  it("navigateToSkillCreate が setCurrentView('skillCreate') を呼ぶ", () => {
    // 実装後に詳細化
  });

  it("navigateToWorkspace が setCurrentView('workspace') を呼ぶ", () => {
    // 実装後に詳細化
  });

  it("navigateToSkillAnalysis が setCurrentView('skillAnalysis') を呼ぶ", () => {
    // 実装後に詳細化
  });

  it("P31対策: 個別セレクタ形式で実装されており合成Hookを使用していない", () => {
    // useSetCurrentView 個別セレクタが呼ばれることを確認
    // useSkillCenterStore() 等の合成Hookが呼ばれていないことを確認
  });
});
```

### ステップ3: ヘッダーCTA テストを作成する

```typescript
// apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.header.test.tsx

import { render, fireEvent } from "@testing-library/react";
import SkillCenterView from "../index";

describe("SkillCenterView - ヘッダーCTA (AC-1)", () => {
  it("「+ 新しいツールを作る」ボタンが描画される", () => {
    // ボタンが存在することを確認
  });

  it("ボタンクリックで navigateToSkillCreate が呼ばれる (AC-3)", () => {
    // P39準拠: fireEvent.click を使用
    // userEvent は happy-dom 環境で使用禁止
  });

  it("aria-label='新しいツールを作る' が設定されている (AC-7)", () => {
    // アクセシビリティ確認
  });
});
```

### ステップ4: JourneyPanel CTA テストを作成する

```typescript
// apps/desktop/src/renderer/views/SkillCenterView/components/SkillLifecycleJourneyPanel/__tests__/SkillLifecycleJourneyPanel.cta.test.tsx

import { render, fireEvent } from "@testing-library/react";
import SkillLifecycleJourneyPanel from "../index";

describe("SkillLifecycleJourneyPanel - CTAボタン (AC-2)", () => {
  it("ctaLabel と onAction がある場合にボタンが描画される", () => {
    // ボタンが描画されることを確認
  });

  it("ctaLabel または onAction が未定義の場合にボタンが描画されない", () => {
    // 条件付きレンダリングを確認
  });

  it("「作成を始める」クリックで navigateToSkillCreate が呼ばれる (AC-3)", () => {
    // P39準拠: fireEvent.click を使用
  });

  it("「改善する」クリックで navigateToSkillAnalysis が呼ばれる (AC-4)", () => {
    // P39準拠: fireEvent.click を使用
  });
});
```

### ステップ5: モバイルレスポンシブテストを作成する

```typescript
describe("SkillCenterView - モバイルレスポンシブ (AC-5)", () => {
  it("768px 未満でヘッダー CTA がアイコンのみ表示になる", () => {
    // window.innerWidth を 767px にモック
    // ラベルテキストが非表示 (sr-only または hidden) で、
    // アイコンが表示されることを確認
  });

  it("モバイル表示でも aria-label が維持されている", () => {
    // アクセシビリティが損なわれないことを確認
  });
});
```

### ステップ6: テストファイルの配置と実行確認

テストファイルを配置し、`pnpm --filter @repo/desktop exec vitest run` で全テストが RED（未実装のため失敗）することを確認する。

### ステップ7: 成果物と完了条件を確認する

テストファイルのパス・テストケース数・完了条件を確認して記録する。

## 統合テスト連携

- useSkillCenter の3アクションが ViewType 遷移 Store と正しく接続していることを単体テストで確認する
- SkillCenterView と JourneyPanel の CTA クリックが期待する Store アクションを呼び出すことを統合テストで確認する
- AC-3（skillCreate 遷移）・AC-4（skillAnalysis 遷移）・AC-5（モバイル）・AC-7/AC-8（HIG 準拠）を各テストケースと 1:1 に対応付ける

## 成果物

| 成果物                             | パス                                                                                                                                      | 内容                                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| テスト設計サマリー                 | `outputs/phase-4/test-design-summary.md`                                                                                                  | テストケース一覧・カバレッジ見込み・受入基準との対応表                                 |
| useSkillCenter テストファイル      | `apps/desktop/src/renderer/views/SkillCenterView/hooks/__tests__/useSkillCenter.test.ts`                                                  | navigateToSkillCreate / navigateToWorkspace / navigateToSkillAnalysis のユニットテスト |
| ヘッダーCTA テストファイル         | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.header.test.tsx`                                               | 描画・クリック・aria-label・遷移テスト                                                 |
| JourneyPanel CTA テストファイル    | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillLifecycleJourneyPanel/__tests__/SkillLifecycleJourneyPanel.cta.test.tsx` | 条件付きレンダリング・クリック・遷移テスト                                             |
| モバイルレスポンシブテストファイル | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.mobile.test.tsx`                                               | 768px 未満でのアイコン専用表示テスト                                                   |

## 完了条件

- [ ] useSkillCenter の3アクション（navigateToSkillCreate / navigateToWorkspace / navigateToSkillAnalysis）のユニットテストが作成されている
- [ ] ヘッダーCTA の描画・クリック・aria-label テストが作成されている
- [ ] JourneyPanel CTA の条件付きレンダリング・クリック・遷移テストが作成されている
- [ ] モバイルレスポンシブテスト（768px 未満でアイコンのみ）が作成されている
- [ ] P31 対策検証テスト（個別セレクタ形式の確認）が含まれている
- [ ] 全テストケースが happy-dom 環境で `fireEvent` を使用している（P39 準拠）
- [ ] テスト設計サマリー（受入基準 AC-1〜AC-8 との対応表）が作成されている
- [ ] 全テストが RED（実装前のため失敗）することが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
