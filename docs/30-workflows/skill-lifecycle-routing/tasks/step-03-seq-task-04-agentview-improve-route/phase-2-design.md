# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 2                                    |
| Phase 名   | 設計                                 |
| タスクID   | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| 前提 Phase | Phase 1（要件定義）                  |
| 後続 Phase | Phase 3（設計レビュー）              |
| ステータス | not_started                          |
| 作成日     | 2026-03-17                           |
| 機能名     | agentview-improve-route              |

## 目的

AgentView の改善 CTA 追加と SkillAnalysisView の戻り導線追加の具体的な実装設計を確定する。コンポーネント prop 設計・Zustand 状態管理・遷移フロー・UI レイアウトを決定する。

## 実行タスク

- コンポーネント prop 設計: SkillAnalysisView に追加する `onNavigateBack` / `onNavigateToAgent` prop の型・挙動・オプション性を設計する
- 遷移フロー設計: AgentView → SkillAnalysis → AgentView の遷移フロー全体（状態引き渡し含む）を設計する
- 状態管理設計: スキル選択状態を遷移をまたいで維持する方法（navigationSlice 拡張 or 既存 selectedSkill 活用）を設計する
- UI レイアウト設計: AgentView の改善 CTA バナーと SkillAnalysisView のナビゲーションリンク・再実行ボタンのレイアウトを設計する

## 設計方針

- AgentView はスキル選択状態（selectedSkillName 等）を既に持つ想定のため、実行完了フラグと組み合わせて CTA 表示条件を決定する
- `onNavigateBack` / `onNavigateToAgent` は SkillAnalysisView の既存 `onClose` と共存し、App.tsx 側で遷移先を注入する（SkillAnalysisView は遷移先を知らない設計を維持する）
- navigationSlice に `sourceView` フィールドを追加するか既存の `previousView` を活用するかは Phase 1 の調査結果に基づいて決定する
- P31 パターン対策: setCurrentView 等のアクション関数は個別セレクタで取得する

## コンポーネント設計

### AgentView 実行完了後 UI

```
┌─ AgentView ─────────────────────────────────────────────────┐
│ [実行完了]                                                   │
│                                                              │
│ 結果: ...                                                    │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ このスキルの精度を上げたいですか？                        ││
│ │                    [スキルを分析・改善する →]             ││  ← 追加
│ └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**表示条件**: `isExecutionComplete === true && selectedSkillName !== null`

**非表示条件（AC-6 対応）**: スキル未実行 / 実行結果がない場合

### SkillAnalysisView 戻り導線

```
┌─ SkillAnalysisView ──────────────────────────────────────────┐
│ [← エージェントに戻る]  スキル分析                           │  ← 追加
│                                                              │
│ スコア: 85/100                                               │
│ 改善提案: ...                                                │
│                                                              │
│ [改善を適用]    [エージェントで再実行 →]                     │  ← 追加
└──────────────────────────────────────────────────────────────┘
```

### SkillAnalysisView prop 拡張

```typescript
interface SkillAnalysisViewProps {
  skillName: string;
  onClose: () => void; // 既存（維持）
  onNavigateBack?: () => void; // 追加: AgentView に戻る
  onNavigateToAgent?: () => void; // 追加: AgentView で再実行
}
```

**設計判断**: `onNavigateBack` と `onNavigateToAgent` はオプション prop にする。渡されない場合（SkillCenter から開いた場合など）はナビゲーションボタンを非表示にする。これにより既存の呼び出し元との後方互換性を維持する。

## 状態管理設計

### 遷移元情報の管理

```typescript
// navigationSlice の拡張案（Phase 1 調査結果に基づいて確定）
interface NavigationState {
  currentView: ViewType;
  previousView?: ViewType; // 既存または追加
  selectedSkillName?: string; // AgentView → SkillAnalysis で引き継ぐスキル名
  isExecutionComplete: boolean; // AgentView でのスキル実行完了フラグ
}
```

**代替案**: navigationSlice を変更せず、AgentView の内部 state で `isExecutionComplete` を管理し、スキル名はすでに AgentView が持つ `selectedSkillName` を流用する。遷移時は `setCurrentView("skillAnalysis", { skillName })` のペイロード方式を検討する。

### 個別セレクタの使用（P31 対策）

```typescript
// 合成 Hook 使用禁止（P31）
// NG: const { setCurrentView } = useNavigationStore();

// 個別セレクタを使用
const setCurrentView = useSetCurrentView();
const selectedSkillName = useSelectedSkillName();
const isExecutionComplete = useIsExecutionComplete();
```

## 遷移フロー設計

```
[AgentView]
  ユーザーがスキルを実行
    ↓ 実行完了
  isExecutionComplete = true
  改善 CTA バナーを表示
    ↓ CTA クリック
  setCurrentView("skillAnalysis") + selectedSkillName を state に保持
    ↓
[SkillAnalysisView] (onNavigateBack / onNavigateToAgent 注入済み)
  ← エージェントに戻るクリック → setCurrentView("agent") + selectedSkillName 維持
  エージェントで再実行クリック → setCurrentView("agent") + isExecutionComplete = false（再実行準備）
```

### App.tsx での注入設計

```typescript
// App.tsx の renderView 内（skillAnalysis case）
case "skillAnalysis":
  return (
    <SkillAnalysisView
      skillName={selectedSkillName}
      onClose={() => setCurrentView("skillCenter")}
      onNavigateBack={previousView === "agent" ? () => setCurrentView("agent") : undefined}
      onNavigateToAgent={previousView === "agent" ? () => {
        setIsExecutionComplete(false);
        setCurrentView("agent");
      } : undefined}
    />
  );
```

## UI/UX リアライズ

| 観点             | 内容                                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| 改善 CTA バナー  | 実行結果エリアの下部に配置。背景色は `secondarySystemBackground` 相当のカード形式   |
| CTA ラベル       | 「スキルを分析・改善する →」（chevron.right アイコン付き）                          |
| 戻るリンク       | SkillAnalysisView ヘッダー左に `← エージェントに戻る` テキストリンク                |
| 再実行ボタン     | フッター右端に配置。`[エージェントで再実行 →]` ボタン                               |
| 表示条件         | `onNavigateBack` / `onNavigateToAgent` が注入された場合のみ表示（後方互換性維持）   |
| アニメーション   | 改善 CTA バナーは実行完了後 200ms でフェードイン                                    |
| アクセシビリティ | CTA ボタンに `aria-label="スキルを分析・改善する"` を付与。キーボード操作で到達可能 |

## 参照資料

| 参照資料            | パス                                                               | 内容                                         |
| ------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                                          | 依存する前提成果物を確認する                 |
| パック index        | `docs/30-workflows/skill-lifecycle-routing/index.md`               | 依存タスクとの補助 Codepath 所有表を確認する |
| AgentView           | `apps/desktop/src/renderer/views/AgentView/index.tsx`              | 実行完了後 UI の現状コードを確認する         |
| SkillAnalysisView   | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` | 既存 prop を確認し拡張点を確定する           |
| App.tsx             | `apps/desktop/src/renderer/App.tsx`                                | renderView の skillAnalysis case 設計に使う  |
| navigationSlice     | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`        | 状態管理の拡張設計に使う                     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                                        | 内容                                     |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| ナビゲーション正本         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | GlobalNavStrip / ViewType 仕様           |
| 機能別コンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter / AgentView の UI/UX 仕様    |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand 個別セレクタパターン（P31 対策） |
| 状態管理ルール             | `.claude/rules/03-state-management.md`                                                      | Zustand 設計原則・個別セレクタ使用義務   |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 1 の成果物・AgentView/SkillAnalysisView のコード・正本仕様を確認し、設計の前提を固める。

### ステップ2: 実行タスクを上から順に実施する

コンポーネント prop 設計 → 遷移フロー設計 → 状態管理設計 → UI レイアウト設計の順に実施する。状態管理の拡張範囲は Phase 1 の調査結果（navigationSlice の現状）に基づいて確定する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、ViewType 追加・Zustand パターン・UI 仕様のズレを残さない。特に P31（合成 Hook 無限ループ）と P48（派生セレクタ無限ループ）の対策が設計に反映されているかを確認する。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、Phase 3 レビューへの handoff を確認して記録する。

## 統合テスト連携

AgentView の実行完了状態検出・CTA 表示・遷移アクション、SkillAnalysisView の prop 注入・戻り導線の UI 設計が Phase 1 の要件と整合するかを確認する。

## 多角的チェック観点

| 観点             | 適用判断                       | 仕様参照先                                                         |
| ---------------- | ------------------------------ | ------------------------------------------------------------------ |
| UI/UX            | React コンポーネント設計が対象 | `aiworkflow-requirements: ui-ux-navigation.md`                     |
| アーキテクチャ   | Zustand 状態管理の設計変更あり | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| アクセシビリティ | UI 実装の場合 WCAG 2.1 AA 必須 | `aiworkflow-requirements: ui-ux-feature-components.md`             |

**Electron デスクトップアプリ観点**:

| 層                         | 適用判断                       | 仕様参照先                                             |
| -------------------------- | ------------------------------ | ------------------------------------------------------ |
| フロントエンド（Renderer） | React コンポーネント追加・変更 | `aiworkflow-requirements: ui-ux-feature-components.md` |

## 成果物

| 成果物             | パス                                         | 内容                                                       |
| ------------------ | -------------------------------------------- | ---------------------------------------------------------- |
| 設計サマリー       | `outputs/phase-2/design-summary.md`          | prop 設計・遷移フロー・状態管理方針を整理する              |
| コンポーネント設計 | `outputs/phase-2/component-design.md`        | SkillAnalysisView props 拡張・AgentView CTA 設計を記録する |
| 状態遷移設計       | `outputs/phase-2/state-transition-design.md` | navigationSlice 変更内容・遷移フロー全体を記録する         |
| UI/UX 設計         | `outputs/phase-2/ui-ux-realization.md`       | CTA バナー・戻るリンク・再実行ボタンのレイアウトを記録する |

## 完了条件

- [ ] SkillAnalysisView の prop 拡張設計（`onNavigateBack` / `onNavigateToAgent`）が確定している
- [ ] AgentView の改善 CTA 表示条件（`isExecutionComplete && selectedSkillName`）が設計されている
- [ ] 遷移フロー（AgentView → SkillAnalysis → AgentView）全体が設計されている
- [ ] 状態管理の拡張方針（navigationSlice 変更 or 内部 state）が確定している
- [ ] P31 対策（個別セレクタ使用）が設計に反映されている
- [ ] AC-6（スキル未実行時は CTA 非表示）の実装方針が設計されている
- [ ] Apple HIG 準拠の UI レイアウトが設計されている（AC-7）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
