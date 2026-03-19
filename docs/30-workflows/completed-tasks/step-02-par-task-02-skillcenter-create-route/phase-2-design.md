# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 2                                     |
| Phase名    | 設計                                  |
| タスクID   | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 |
| 前提Phase  | Phase 1（要件定義）                   |
| 後続Phase  | Phase 3（設計レビュー）               |
| ステータス | not_started                           |
| 作成日     | 2026-03-17                            |
| 機能名     | skillcenter-create-route              |

## 目的

ヘッダーCTA追加と JourneyPanel クリッカブル化の具体的な設計を確定する。コンポーネント変更範囲・Props 型定義・Zustand アクション設計・UI レイアウトを定義し、Phase 3 レビューゲートに通過できる水準に仕上げる。

## 実行タスク

- ヘッダーCTA設計: SkillCenterView ヘッダーへの「+ 新しいツールを作る」ボタンのレイアウト・スタイル・Props 設計を行う
- useSkillCenter 設計: `navigateToSkillCreate()` / `navigateToWorkspace()` / `navigateToSkillAnalysis()` アクションの型定義と Zustand 接続方法を設計する
- JourneyPanel CTA 設計: SkillLifecycleJourneyPanel のステップカードにボタンを追加するための Props 拡張・レンダリングロジックを設計する
- skillLifecycleJourney 設計: JOB_GUIDES の各ステップへの `onAction` コールバック型を追加する設計を行う
- モバイル対応設計: 768px未満での CTA ボタンのレイアウト折り返し・タッチターゲット（44x44px以上）設計を行う

## 設計方針

### 案4+5 採用（ヘッダーCTA + JourneyPanel CTA の組み合わせ）

**案5: ヘッダーに「+ 新しいツールを作る」ボタン（GitHub「New repository」パターン）**

```
┌─────────────────────────────────────────────┐
│ ツールを探す              [+ 新しいツールを作る] │
└─────────────────────────────────────────────┘
```

- クリック時: `useSkillCenter.navigateToSkillCreate()` → `setCurrentView("skillCreate")`
- スタイル: Apple HIG systemBlue (`#007AFF` / ダーク: `#0A84FF`)、角丸8-12px、8pxグリッド

**案4: JourneyPanel のステップカードにCTAボタン**

```
┌─ スキルを作る ────────────────────┐
│ 入口: SkillCenter で意図整理     │
│ → Skill Creator で下書きを作る   │
│                  [作成を始める →] │
└───────────────────────────────────┘
```

- 「スキルを作る」: `navigateToSkillCreate()` → `setCurrentView("skillCreate")`
- 「スキルを使う」: `navigateToWorkspace()` → `setCurrentView("workspace")`（または既存 ViewType）
- 「スキルを改善する」: `navigateToSkillAnalysis()` → `setCurrentView("skillAnalysis")`

### 責務境界（AC-6 準拠）

- 本タスクが担うのは **handoff CTA**（画面遷移のトリガー）のみ
- スキル作成ロジック本体・SkillAnalysisView の実装は扱わない（forbiddenResponsibility）
- JourneyPanel の `onAction` は画面遷移のコールバックのみを受け取る純粋関数として設計する

### Zustand アクション設計（P31/P48 対策）

- `useSkillCenter` フックに個別セレクタ形式でアクションを追加する
- `setCurrentView` は既存の Zustand Store の `useSetCurrentView()` 個別セレクタ経由で呼び出す
- アクション関数は `useEffect` の依存配列に含める可能性があるため、参照が安定するセレクタ形式にする

## コンポーネント変更設計

### 1. `SkillCenterView/index.tsx`

```typescript
// 追加: ヘッダーCTAボタン
<header className="flex items-center justify-between px-4 py-3">
  <h1 className="text-lg font-semibold">ツールを探す</h1>
  <button
    onClick={navigateToSkillCreate}
    className="flex items-center gap-1 rounded-[8px] bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
    aria-label="新しいツールを作る"
  >
    <PlusIcon className="h-4 w-4" aria-hidden="true" />
    新しいツールを作る
  </button>
</header>
```

### 2. `useSkillCenter.ts`

```typescript
// 追加アクション（個別セレクタ形式）
// useSetCurrentView() は引数なしで setCurrentView 関数を返す個別セレクタ
const setCurrentView = useSetCurrentView();
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
  // 既存のreturn に追加
  navigateToSkillCreate,
  navigateToWorkspace,
  navigateToSkillAnalysis,
};
```

### 3. `skillLifecycleJourney.ts`

```typescript
// JOB_GUIDESの各ステップに onAction を追加
export interface SkillLifecycleStep {
  id: string;
  title: string;
  description: string;
  ctaLabel?: string; // 追加
  onAction?: () => void; // 追加
}
```

### 4. `SkillLifecycleJourneyPanel`

```typescript
// Props 拡張
interface JourneyStepCardProps {
  step: SkillLifecycleStep;
  // onAction は step.onAction から取得 (Props 汚染を避ける)
}

// レンダリング: step.ctaLabel && step.onAction が存在する場合のみボタンを表示
{step.ctaLabel && step.onAction && (
  <button
    onClick={step.onAction}
    className="mt-3 self-end rounded-[8px] bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
  >
    {step.ctaLabel}
  </button>
)}
```

## UI/UX リアライズ

| 観点               | 内容                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| 画面構成           | ヘッダー右端にプライマリCTA、JourneyPanel 各カード末尾にセカンダリCTA                              |
| Primary CTA        | 「+ 新しいツールを作る」（ヘッダー右端）                                                           |
| Secondary CTAs     | 「作成を始める →」「使ってみる →」「改善する →」（各JourneyCardフッター）                          |
| カラー             | Apple HIG systemBlue（ライト: `#007AFF`、ダーク: `#0A84FF`）、テキスト: white                      |
| スペーシング       | 8pxグリッド準拠（padding: 12px/8px、gap: 8px）                                                     |
| 角丸               | `8px`（統一）                                                                                      |
| 影                 | `0 1px 3px rgba(0,0,0,0.04)`（カード）                                                             |
| モバイル（<768px） | ヘッダーCTAはラベルを省略しアイコンのみ表示（aria-label は維持）、タッチターゲット 44x44px以上     |
| アクセシビリティ   | `aria-label` で目的を明示、キーボードフォーカス（`focus:ring-2`）、アイコンに `aria-hidden="true"` |

## 参照資料

| 参照資料              | パス                                                                      | 内容                                                    |
| --------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| Phase 1（要件定義）   | `phase-1-requirements.md`                                                 | 依存する前提成果物を確認する                            |
| SkillCenterView       | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | 現在のヘッダー構造とJourneyPanel接続を確認する          |
| useSkillCenter        | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | 既存アクション定義と Zustand 接続パターンを確認する     |
| skillLifecycleJourney | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | 既存 JOB_GUIDES 型と forbiddenResponsibility を確認する |
| パック親 index        | `docs/30-workflows/skill-lifecycle-routing/index.md`                      | 実行順序・依存グラフ・共通方針の正本を確認する          |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                             | パス                                                                                        | 内容                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| ui-ux-navigation                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | GlobalNavStrip / ViewType 仕様の正本                |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter / SkillEditor / JourneyPanel 仕様の正本 |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand 個別セレクタ・setCurrentView パターン       |
| ui-ux-design-principles              | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG / WCAG 2.1 AA の一次正本                  |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store 設計・個別セレクタ命名規約の正本      |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使うコードパス・前提Phase・システム仕様を確認し、設計の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: システム仕様との整合を確認する

aiworkflow-requirements の正本と照合し、ViewType・UI・Zustand のズレを残さない。

### ステップ4: AC-6 の forbiddenResponsibility を再確認する

設計した CTA が「handoff（画面遷移）」のみを担い、スキル作成本体ロジックを持っていないことを確認する。

### ステップ5: 成果物と完了条件を確認する

成果物パス・完了条件・次の Phase への handoff を確認して記録する。

## 統合テスト連携

ViewType 遷移・JourneyPanel CTA・useSkillCenter アクション・モバイル対応の設計を Phase 3 レビューゲートに通せる水準で確定する。P31（合成Hook無限ループ）・P48（派生セレクタ無限ループ）対策を設計段階で組み込む。

## 成果物

| 成果物             | パス                                       | 内容                                                     |
| ------------------ | ------------------------------------------ | -------------------------------------------------------- |
| 設計サマリー       | `outputs/phase-2/design-summary.md`        | コンポーネント変更範囲・Props 型・Zustand アクション設計 |
| UI/UX 実体化       | `outputs/phase-2/ui-ux-realization.md`     | ヘッダーCTA・JourneyPanel CTA のレイアウト・スタイル設計 |
| 責務境界マトリクス | `outputs/phase-2/responsibility-matrix.md` | handoff CTA の責務境界と forbiddenResponsibility の整理  |

## 完了条件

- [ ] ヘッダーCTAのコンポーネント設計（レイアウト・スタイル・Props）が定義されている
- [ ] `useSkillCenter` に追加する3つのアクションの型定義が確定している
- [ ] `SkillLifecycleStep` への `ctaLabel` / `onAction` 追加の型設計が確定している
- [ ] `SkillLifecycleJourneyPanel` のボタンレンダリングロジックが設計されている
- [ ] モバイル（768px未満）での CTA ボタン表示方針が設計されている
- [ ] AC-6（forbiddenResponsibility 非違反）が設計上で保証されている
- [ ] P31 / P48 対策（個別セレクタ形式）が設計に組み込まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
