# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| Phase 名   | 設計                                       |
| タスクID   | TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001 |
| 前提 Phase | Phase 1（要件定義）                        |
| 後続 Phase | Phase 3（設計レビュー）                    |
| ステータス | not_started                                |
| 作成日     | 2026-03-17                                 |
| 機能名     | lifecycle-reuse-improve-cycle              |

## 目的

Phase 1 の要件定義を受け、ReuseReady 状態の導入と ImproveReady → Running 再実行サイクルの具体的な実装設計を確定する。SkillExecutionStatus 型拡張・agentSlice アクション追加・SkillLifecyclePanel UI 設計・navigationSlice 連携設計を行う。

## 実行タスク

1. SkillExecutionStatus 型の拡張設計: agentSlice.ts に `"reuse_ready"` を追加する変更差分を設計する（既存 6 状態との後方互換性を保証する）
2. agentSlice に `acceptSkillResult()` アクション追加設計: Review → ReuseReady 遷移を実現するアクションのシグネチャ・副作用・Zustand slice への影響を設計する
3. agentSlice に `reExecuteAfterImprovement()` アクション追加設計（別アクション方式を採用。詳細は「Improve → Running 遷移の実装方式」セクションを参照）
4. SkillLifecyclePanel への「受理して再利用」CTA 追加設計: Review 状態（`skillExecutionStatus === "review"`。本タスクで SkillExecutionStatus 型に追加する新規状態）で表示する CTA のコンポーネント設計・配置・表示条件を設計する（AC-2 / AC-7）
5. SkillLifecyclePanel への「改善を適用して再実行」CTA 追加設計: ImproveReady 状態で表示する CTA のコンポーネント設計・配置・表示条件を設計する（AC-5 / AC-8）
6. ReuseReady 状態の UI 設計: `reuse_ready` 状態時に SkillLifecyclePanel に表示する再利用導線カードのレイアウト・遷移先（SkillManagementPanel または AgentView）を設計する（AC-4）
7. navigationSlice との連携設計: ReuseReady → 遷移先（Phase 1 で決定した遷移先）への navigateTo 呼び出し方式を設計する

## 設計方針

- `reuse_ready` は SkillExecutionStatus の新たな終端状態として扱う。`completed` と区別し、ユーザーが「採用した」意思表示を持つ状態として明示する
- `acceptSkillResult()` アクションは副作用なし（非同期不要）の同期アクション。skillExecutionStatus を `"reuse_ready"` に更新するのみとする
- Improve → Running 再実行の実装方式は **別アクション方式**（`reExecuteAfterImprovement` アクション）を採用する。SRP に基づき applySkillImprovements() は改善適用に専念し、再実行トリガーは呼び出し元の責務とする。詳細は「Improve → Running 遷移の実装方式」セクションを参照
- P31 パターン対策: acceptSkillResult / reExecuteAfterImprovement 等のアクション関数は個別セレクタで取得し、合成 Hook の戻り値を useEffect に渡さない
- P48 パターン対策: 派生セレクタ（filter/map）を使用する場合は useShallow を適用する

## 型拡張設計

### SkillExecutionStatus（packages/shared/src/types/skill.ts）

> **P32 準拠**: SkillExecutionStatus 型の正本は `packages/shared/src/types/skill.ts` である。agentSlice.ts はこの型を import しているだけであり、型定義の変更先は packages/shared であることに注意する。

```typescript
// 現在（6状態）— packages/shared/src/types/skill.ts
type SkillExecutionStatus =
  | "idle"
  | "running"
  | "permission_pending"
  | "completed"
  | "cancelled"
  | "error";

// 拡張後（9状態）— 本タスクで新規追加する3値（"review" / "improve_ready" / "reuse_ready"）
type SkillExecutionStatus =
  | "idle"
  | "running"
  | "permission_pending"
  | "completed"
  | "cancelled"
  | "error"
  | "review" // 新規追加: completed 後にユーザーが結果を確認している状態（existing completed 状態から分岐）
  | "improve_ready" // 新規追加: 改善提案が確定し再実行待ちの状態
  | "reuse_ready"; // 新規追加: スキル結果が採用され再利用可能な状態
```

**後方互換性**: 既存の switch 文・条件分岐に各新規 case を追加するだけで影響なし。`completed` を参照している箇所は新規状態を参照しないため、既存動作に影響しない。

**P32 準拠の同時更新対象**:

1. `packages/shared/src/types/skill.ts` — SkillExecutionStatus 型定義の変更（正本）
2. `packages/shared/src/types/__tests__/skill-import.test.ts` — テスト契約の更新
3. `apps/desktop/src/renderer/stores/agentSlice.ts` — switch 文・条件分岐への case 追加
4. exhaustive check パターン（`never` 型チェック）が使用されている箇所はコンパイルエラーで自動検出される

## アクション設計

### acceptSkillResult（Review → ReuseReady 遷移）

```typescript
// agentSlice に追加するアクション
acceptSkillResult: (state) => {
  // ガード条件: skillExecutionStatus が "review"（本タスクで SkillExecutionStatus 型に追加する新規状態）でない場合は無操作
  if (state.skillExecutionStatus !== "review") return;
  state.skillExecutionStatus = "reuse_ready";
};
```

**シグネチャ**: 引数なし、副作用なし（非同期不要）
**呼び出し元**: SkillLifecyclePanel の「受理して再利用」CTA クリックハンドラ
**個別セレクタ**: `useAcceptSkillResult()` として export する（P31 対策）

### reExecuteAfterImprovement（ImproveReady → Running 遷移）※別アクション方式の場合

```typescript
// agentSlice に追加するアクション（別アクション方式が採用された場合）
reExecuteAfterImprovement: (state) => {
  state.skillExecutionStatus = "running";
  state.isExecuting = true;
  // currentAnalysis はリセットせず維持（改善前後の比較に使用）
};
```

**シグネチャ**: 引数なし
**呼び出し元**: SkillLifecyclePanel の「改善を適用して再実行」CTA クリックハンドラ（applySkillImprovements() 完了後に呼び出す）
**個別セレクタ**: `useReExecuteAfterImprovement()` として export する（P31 対策）

## コンポーネント設計

### SkillLifecyclePanel: 「受理して再利用」CTA

```
┌─ SkillLifecyclePanel（Review 状態）──────────────────────────┐
│ 実行結果サマリー                                             │
│ quality gate: ■■■■□ (4/5)                                   │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ このスキルを採用しますか？                                │ │
│ │ [改善案を作る]              [受理して再利用 →]           │ │  ← 追加
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**表示条件**: `skillExecutionStatus === "review"`（本タスクで SkillExecutionStatus 型に追加する新規状態。completed 後にユーザーが結果を確認している状態）
**非表示条件（AC-7）**: Review 状態以外（completed / error / running 等）

### SkillLifecyclePanel: 「改善を適用して再実行」CTA

```
┌─ SkillLifecyclePanel（ImproveReady 状態）────────────────────┐
│ 改善サマリー                                                 │
│ 改善点: ...                                                  │
│                                                              │
│ [前回との差分を見る]    [改善を適用して再実行 →]            │  ← 追加
└──────────────────────────────────────────────────────────────┘
```

**表示条件**: `skillExecutionStatus === "improve_ready"`（本タスクで SkillExecutionStatus 型に追加する新規状態。改善提案が確定し再実行待ちの状態）
**非表示条件（AC-8）**: ImproveReady 状態以外

### SkillLifecyclePanel: ReuseReady 状態の再利用導線カード

```
┌─ SkillLifecyclePanel（ReuseReady 状態）──────────────────────┐
│ スキルを採用しました                                         │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ このスキルをもう一度使いますか？                          │ │
│ │ [スキル一覧に戻る]          [もう一度使う →]             │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**「もう一度使う」の遷移先**: SkillManagementPanel（ui-ux-realization.md の Reuse フェーズ「後でもう一度使いたい」→ selectSkillByName 経由で再実行導線へ）。具体的な ViewType キーは Phase 1 で ui-ux-realization.md との照合後に確定する
**「スキル一覧に戻る」**: navigationSlice の navigateTo("skillCenter") 相当

### ImproveReady → Review 逆遷移 CTA

ui-ux-diagrams.md の `ImproveReady --> Review` 遷移に対応するセカンダリ CTA を設計する。

- ラベル: 「改善内容を見直す」
- 配置: 「改善を適用して再実行」CTA の下にセカンダリボタンとして配置
- 動作: skillExecutionStatus を `"review"`（本タスクで SkillExecutionStatus 型に追加する新規状態）に戻し、改善結果の再確認画面を表示
- スタイル: セカンダリボタン（bg-transparent、border のみ）

これにより Improve → Execute → Evaluate → Improve のフィードバックループに加え、Improve → Review への見直しパスも確保する。

### Improve → Running 遷移の実装方式

**採用方式**: 別アクション方式（`reExecuteAfterImprovement` アクション）

**理由**:

- `applySkillImprovements()` は改善の適用に専念し、再実行トリガーは呼び出し元の責務とする（SRP）
- 完了コールバック方式は `applySkillImprovements` Thunk の責務を拡大し、既存テストへの波及が大きい
- 別アクション方式であれば、CTA クリック → `reExecuteAfterImprovement()` dispatch の明示的なフローとなり、テスタビリティが高い

**実装方針**:

1. `reExecuteAfterImprovement` アクションを agentSlice に追加
2. このアクションは内部で `skillExecutionStatus` を `"running"` に変更し、改善済みスキルの再実行を開始
3. CTA「改善を適用して再実行」の onClick で dispatch する

## 状態管理設計

### 個別セレクタの追加（P31 対策）

```typescript
// agentSlice の個別セレクタとして export する
export const useAcceptSkillResult = () =>
  useAgentStore((state) => state.acceptSkillResult);

export const useReExecuteAfterImprovement = () =>
  useAgentStore((state) => state.reExecuteAfterImprovement);

export const useIsReuseReady = () =>
  useAgentStore((state) => state.skillExecutionStatus === "reuse_ready");
```

### navigationSlice との連携

```typescript
// SkillLifecyclePanel: 「もう一度使う」クリック時
const navigateTo = useNavigateTo(); // 個別セレクタ（P31 対策）

const handleReuseClick = () => {
  // SkillManagementPanel への遷移（ui-ux-realization.md Reuse フェーズ準拠）
  // ViewType の正確なキーは Phase 1 で ui-ux-navigation.md と照合して確定する
  navigateTo("skillManagement"); // 暫定: Phase 1 照合後に確定
};
```

## UI/UX リアライズ

| 観点                        | 内容                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| 「受理して再利用」CTA       | Review 状態の CTA エリア右側にプライマリボタンとして配置。背景色 `systemBlue`（#007AFF） |
| 「改善を適用して再実行」CTA | ImproveReady 状態のフッター右端にプライマリボタンとして配置                              |
| 再利用導線カード            | ReuseReady 状態全体をカード形式で表示。背景色 `secondarySystemBackground` 相当           |
| アニメーション              | 各状態遷移後の CTA 表示は 200ms でフェードイン                                           |
| アクセシビリティ            | CTA ボタンに `aria-label` を付与。キーボード操作（Tab/Enter）で到達・実行可能            |
| 8px グリッド                | padding: 16px (2 units)、ボタン間余白: 8px (1 unit)                                      |

## 参照資料

| 参照資料            | パス                                                                 | 内容                                       |
| ------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| Phase 1（要件定義） | `phase-1-requirements.md`                                            | 依存する前提成果物（遷移条件・方式の決定） |
| UI/UX 状態遷移図    | `docs/30-workflows/skill-lifecycle-unification/ui-ux-diagrams.md`    | 設計の根拠となる状態遷移図                 |
| UI/UX 一次導線      | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` | Reuse フェーズ要件との整合確認             |
| agentSlice          | `apps/desktop/src/renderer/store/slices/agentSlice.ts`               | 型拡張・アクション追加の対象ファイル       |
| SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | CTA 追加・状態表示の対象ファイル           |
| navigationSlice     | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`          | 遷移先への navigateTo 設計の対象ファイル   |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                                        | 内容                                         |
| -------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| ナビゲーション正本         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | GlobalNavStrip / ViewType 仕様               |
| 機能別コンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillLifecyclePanel の UI/UX 仕様            |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand 個別セレクタパターン（P31/P48 対策） |
| 状態管理ルール             | `.claude/rules/03-state-management.md`                                                      | Zustand 設計原則・個別セレクタ使用義務       |
| arch-state-management-core | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`           | 状態管理方針、セレクタ命名規約               |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 1 の成果物・agentSlice.ts / SkillLifecyclePanel の現状コード・正本仕様を確認し、設計の前提を固める。特に Phase 1 で決定した「Improve → Re-execute の実装方式」と「もう一度使うの遷移先」を確認する。

### ステップ2: 実行タスクを上から順に実施する

型拡張設計 → acceptSkillResult 設計 → reExecuteAfterImprovement / applySkillImprovements 拡張設計 → CTA 設計 → ReuseReady UI 設計 → navigationSlice 連携設計の順に実施する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、Zustand パターン・UI 仕様のズレを残さない。P31（合成 Hook 無限ループ）・P48（派生セレクタ無限ループ）・UX 禁止事項（create/execute/improve を別アプリのように分断しない）が設計に反映されているかを確認する。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、Phase 3 レビューへの handoff を確認して記録する。

## 統合テスト連携

agentSlice の `reuse_ready` 遷移・`acceptSkillResult()` の動作設計、SkillLifecyclePanel の CTA 表示条件設計、navigationSlice との連携設計が Phase 1 の要件と整合するかを確認する。

## 多角的チェック観点

| 観点             | 適用判断                       | 仕様参照先                                                         |
| ---------------- | ------------------------------ | ------------------------------------------------------------------ |
| UI/UX            | React コンポーネント設計が対象 | `aiworkflow-requirements: ui-ux-feature-components.md`             |
| アーキテクチャ   | Zustand 状態管理の設計変更あり | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| アクセシビリティ | UI 実装の場合 WCAG 2.1 AA 必須 | `aiworkflow-requirements: ui-ux-feature-components.md`             |

**Electron デスクトップアプリ観点**:

| 層                         | 適用判断                       | 仕様参照先                                             |
| -------------------------- | ------------------------------ | ------------------------------------------------------ |
| フロントエンド（Renderer） | React コンポーネント追加・変更 | `aiworkflow-requirements: ui-ux-feature-components.md` |

## 成果物

| 成果物                | パス                                       | 内容                                                               |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| 設計ドキュメント      | `outputs/phase-2/design-document.md`       | 型拡張・アクション設計・UI 設計・navigationSlice 連携を整理する    |
| 型拡張設計            | `outputs/phase-2/type-extension-design.md` | SkillExecutionStatus 拡張差分と後方互換性の根拠を記録する          |
| アクション設計        | `outputs/phase-2/action-design.md`         | acceptSkillResult / reExecuteAfterImprovement のシグネチャと副作用 |
| UI コンポーネント設計 | `outputs/phase-2/ui-component-design.md`   | CTA・ReuseReady カード・表示条件のレイアウト設計                   |
| 状態遷移フロー設計    | `outputs/phase-2/state-transition-flow.md` | Review → ReuseReady / ImproveReady → Running の完全フロー図        |

## 完了条件

- [ ] SkillExecutionStatus 型に `"reuse_ready"` を追加する変更差分が設計されている
- [ ] `acceptSkillResult()` アクションのシグネチャ・副作用・個別セレクタ名が確定している
- [ ] ImproveReady → Running の実装方式（別アクション方式 or 完了コールバック方式）に基づく設計が確定している
- [ ] Review 状態の「受理して再利用」CTA の表示条件・配置が設計されている（AC-2 / AC-7）
- [ ] ImproveReady 状態の「改善を適用して再実行」CTA の表示条件・配置が設計されている（AC-5 / AC-8）
- [ ] ReuseReady 状態の再利用導線カードのレイアウト・遷移先が設計されている（AC-4）
- [ ] navigationSlice との連携方式（navigateTo の呼び出しパス）が設計されている
- [ ] P31 対策（個別セレクタ使用）が設計に反映されている
- [ ] UX 禁止事項「create/execute/improve を別アプリのように分断しない」に違反していないことが確認されている
- [ ] Apple HIG 準拠の UI レイアウトが設計されている（AC-9）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
