# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 5                                     |
| Phase名    | 実装                                  |
| タスクID   | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 |
| 前提Phase  | Phase 4（テスト作成）                 |
| 後続Phase  | Phase 6（テスト拡充）                 |
| ステータス | not_started                           |
| 作成日     | 2026-03-17                            |
| 機能名     | skillcenter-create-route              |

## 目的

Phase 4 で作成したテスト（RED 状態）を GREEN にする実装を行う。`skillLifecycleJourney.ts` の型拡張から始め、`useSkillCenter` アクション追加、ヘッダーCTA 実装、JourneyPanel CTA 実装の順で進める。Apple HIG 準拠（systemBlue / 8px グリッド / 角丸 8px）を維持し、AC-6 の forbiddenResponsibility を侵犯しない handoff CTA 専用実装とする。

## 実行タスク

- Step 1: `skillLifecycleJourney.ts` 型拡張: `SkillLifecycleStep` に `ctaLabel?: string` / `onAction?: () => void` を追加し、`JOB_GUIDES` の各ステップに適切な値を付与する
- Step 2: `useSkillCenter.ts` アクション追加: `navigateToSkillCreate` / `navigateToWorkspace` / `navigateToSkillAnalysis` を個別セレクタ形式で追加し、return に含める（P31 対策）
- Step 3: `SkillCenterView/index.tsx` ヘッダーCTA 実装: ヘッダー右端にプライマリ CTA ボタンを追加し、モバイル（768px 未満）でアイコンのみ表示に切り替える
- Step 4: `SkillLifecycleJourneyPanel` CTA 実装: ステップカードのフッターに `step.ctaLabel && step.onAction` の条件で CTA ボタンをレンダリングする

## 参照資料

| 参照資料                   | パス                                                                                     | 内容                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Phase 2（設計）            | `phase-2-design.md`                                                                      | 実装の詳細設計（Props 型・スタイル・Zustand 接続）を確認する  |
| Phase 4（テストファイル）  | `apps/desktop/src/renderer/views/SkillCenterView/hooks/__tests__/useSkillCenter.test.ts` | テストが期待する関数シグネチャを確認する                      |
| skillLifecycleJourney      | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                          | 既存の `SkillLifecycleStep` 型と `JOB_GUIDES` 定義を確認する  |
| useSkillCenter             | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                | 既存アクション定義のパターンを継承する                        |
| SkillCenterView            | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                              | 現在のヘッダー構造に CTA を追加する箇所を確認する             |
| SkillLifecycleJourneyPanel | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillLifecycleJourneyPanel/` | 現在のカードレンダリングに CTA ボタンを追加する箇所を確認する |
| P31 対策                   | `.claude/rules/06-known-pitfalls.md#P31`                                                 | 個別セレクタ形式で合成 Hook 無限ループを回避する              |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| ui-ux-navigation                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | ViewType 仕様・setCurrentView パターンの正本   |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter / JourneyPanel の UI 仕様の正本    |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand 個別セレクタパターンの正本             |
| ui-ux-design-principles              | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG / WCAG 2.1 AA の一次正本             |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store 設計・個別セレクタ命名規約の正本 |

## 実行手順

### ステップ1: `skillLifecycleJourney.ts` 型拡張を実装する

`SkillLifecycleStep` インターフェースに以下を追加する。

```typescript
export interface SkillLifecycleStep {
  id: string;
  title: string;
  description: string;
  ctaLabel?: string; // 追加: CTA ボタンのラベル（例: "作成を始める →"）
  onAction?: () => void; // 追加: CTA クリック時のコールバック（handoff 専用）
}
```

`JOB_GUIDES` の各ステップに `ctaLabel` を付与する（`onAction` は SkillCenterView 側から注入するため、ここでは未設定）。

| ステップ         | ctaLabel       |
| ---------------- | -------------- |
| スキルを作る     | 作成を始める → |
| スキルを使う     | 使ってみる →   |
| スキルを改善する | 改善する →     |

### ステップ2: `useSkillCenter.ts` アクションを追加する

既存の個別セレクタパターンを継承し、以下の3アクションを追加する（P31 対策）。

```typescript
// 既存の useSetCurrentView 個別セレクタを使用（参照が安定）
const navigateToSkillCreate = useCallback(
  () => setCurrentView("skillCreate"),
  [setCurrentView],
);
const navigateToWorkspace = useCallback(
  () => setCurrentView("workspace"),
  [setCurrentView],
);
const navigateToSkillAnalysis = useCallback(
  () => setCurrentView("skillAnalysis"),
  [setCurrentView],
);

return {
  // 既存の return に追加
  navigateToSkillCreate,
  navigateToWorkspace,
  navigateToSkillAnalysis,
};
```

### ステップ3: `SkillCenterView/index.tsx` ヘッダーCTA を実装する

ヘッダー右端にプライマリ CTA ボタンを追加する。

```typescript
<header className="flex items-center justify-between px-4 py-3">
  <h1 className="text-lg font-semibold">ツールを探す</h1>
  <button
    onClick={navigateToSkillCreate}
    className={[
      "flex items-center gap-1 rounded-[8px]",
      "bg-[var(--accent)] px-3 py-1.5",
      "text-sm font-medium text-white",
      "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2",
      "transition-opacity hover:opacity-90 active:opacity-80",
    ].join(" ")}
    aria-label="新しいツールを作る"
  >
    <PlusIcon className="h-4 w-4" aria-hidden="true" />
    {/* モバイル（<768px）ではラベルを非表示 */}
    <span className="hidden sm:inline">新しいツールを作る</span>
  </button>
</header>
```

- `var(--accent)`: Apple HIG systemBlue（ライト: `#007AFF` / ダーク: `#0A84FF`）にバインドされた CSS 変数。正本仕様 `ui-ux-design-principles.md` の systemBlue 定義と同一
- `sm:` ブレークポイントは Tailwind CSS の 640px。768px 未満の要件に対し、設計段階で `sm:` (640px) を採用するか `md:` (768px) を採用するかを Phase 5 実装時に確認する
- モバイルでも `aria-label` は維持してアクセシビリティを確保する

### ステップ4: `SkillLifecycleJourneyPanel` CTA を実装する

各ステップカードのフッターに条件付きで CTA ボタンをレンダリングする。

```typescript
{step.ctaLabel && step.onAction && (
  <button
    onClick={step.onAction}
    className={[
      "mt-3 self-end rounded-[8px]",
      "bg-[var(--accent)] px-3 py-1.5",
      "text-sm font-medium text-white",
      "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2",
      "transition-opacity hover:opacity-90 active:opacity-80",
    ].join(" ")}
    aria-label={step.ctaLabel}
  >
    {step.ctaLabel}
  </button>
)}
```

### ステップ5: JOB_GUIDES への onAction 注入パターンを確認する

`JOB_GUIDES` の `onAction` は `skillLifecycleJourney.ts` では空にし、`SkillCenterView` 側で `useSkillCenter` のアクションを注入する設計を採用する。

```typescript
// SkillCenterView/index.tsx 内で注入
const stepsWithActions = JOB_GUIDES.map((step) => ({
  ...step,
  onAction:
    step.id === "create"
      ? navigateToSkillCreate
      : step.id === "use"
        ? navigateToWorkspace
        : step.id === "improve"
          ? navigateToSkillAnalysis
          : undefined,
}));
```

### ステップ6: テストを GREEN にする確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/SkillCenterView/
```

全テストが GREEN になることを確認する。RED のまま残る場合は実装を修正する。

### ステップ7: 成果物と完了条件を確認する

実装したファイルの差分・型チェック通過・テスト全 GREEN を確認して記録する。

## 統合テスト連携

- Phase 4 のテスト全件が GREEN になることを本 Phase の完了条件とする
- `pnpm typecheck` が通ることで型安全性を担保する
- AC-6（forbiddenResponsibility 非違反）: 実装した CTA が `setCurrentView` 呼び出しのみを行い、スキル作成本体ロジックを持っていないことをコードレビューで確認する

## 成果物

コード成果物は `outputs/` には配置しない（直接ソースファイルを編集する）。

| 成果物                | パス                                                                                     | 内容                                                    |
| --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 型拡張                | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                          | `SkillLifecycleStep` に `ctaLabel` / `onAction` を追加  |
| アクション追加        | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                | 3つのナビゲーションアクションを個別セレクタ形式で追加   |
| ヘッダーCTA 実装      | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                              | ヘッダー右端に「+ 新しいツールを作る」ボタンを追加      |
| JourneyPanel CTA 実装 | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillLifecycleJourneyPanel/` | 各ステップカードフッターに CTA ボタンをレンダリング追加 |
| 実装サマリー          | `outputs/phase-5/implementation-summary.md`                                              | 変更ファイル一覧・主要変更内容・テスト結果サマリー      |

## 完了条件

- [ ] `SkillLifecycleStep` に `ctaLabel?: string` / `onAction?: () => void` が追加されている
- [ ] `JOB_GUIDES` の各ステップに適切な `ctaLabel` が付与されている
- [ ] `useSkillCenter` に `navigateToSkillCreate` / `navigateToWorkspace` / `navigateToSkillAnalysis` が個別セレクタ形式で追加されている（P31 対策）
- [ ] ヘッダーCTA ボタンが Apple HIG 準拠のスタイル（`var(--accent)` / 角丸 8px / `focus:ring-2`）で実装されている
- [ ] ヘッダーCTA がモバイル（768px 未満）でアイコンのみ表示になっている（AC-5）
- [ ] JourneyPanel の各ステップカードに条件付き CTA ボタンが実装されている
- [ ] Phase 4 の全テストが GREEN になっている
- [ ] `pnpm typecheck` が通っている
- [ ] AC-6（handoff CTA 専用・スキル作成ロジック本体を含まない）を遵守している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
