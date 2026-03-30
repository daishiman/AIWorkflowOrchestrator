# Phase 2: 設計

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 2                           |
| 機能名 | skill-creation-result-panel |
| 作成日 | 2026-03-29                  |

## 目的

`PlanResultDetailPanel` と `ExecuteResultDetailPanel` のコンポーネント設計、props interface、内部レイアウト構造、SkillLifecyclePanel 統合方式、state 連動パターンを設計する。`terminal_handoff` は既存導線に残し、detail panel は integrated_api の raw response に閉じる。

## 実行タスク

- `PlanResultDetailPanel` の props interface とレイアウトを設計する
- `ExecuteResultDetailPanel` の props interface とレイアウトを設計する
- エラー状態表示のコンポーネント設計をする
- SkillLifecyclePanel への統合パターンを設計する
- state 連動とリアクティブ更新の設計をする

## 参照資料

| 資料名              | パス                                                                      | 説明               |
| ------------------- | ------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件        | `phase-1-requirements.md`                                                 | 表示対象フィールド |
| SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | 統合先             |
| ImprovementPanel    | `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` | UI パターン参考    |
| 型定義              | `packages/shared/src/types/skillCreator.ts`                               | PlanResult 型      |

### 現行コードアンカー

| ファイル                                                                  | 設計観点                                                                     |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | ワークフロー state による条件分岐パターン（currentPhase, awaitingUserInput） |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` | パネルの card layout、heading、list rendering の Tailwind CSS パターン       |
| `packages/shared/src/types/skillCreator.ts`                               | props 型の直接参照元                                                         |

### データ供給の責務

| データ                      | 保持先                            | 役割                                                    |
| --------------------------- | --------------------------------- | ------------------------------------------------------- |
| plan detail raw response    | `SkillLifecyclePanel` local state | `PlanResultDetailPanel` の source of truth              |
| execute detail raw response | `SkillLifecyclePanel` local state | `ExecuteResultDetailPanel` の source of truth           |
| normalized plan result      | 既存 store の currentPlanResult   | 既存の workflow 分岐と execute 起動に利用               |
| workflow snapshot           | 既存 store の workflowSnapshot    | `currentPhase` / `awaitingUserInput` の visibility gate |
| terminal handoff            | 既存 handoff card                 | detail panel の非対象                                   |

## 実行手順

### ステップ1: PlanResultDetailPanel を設計する

**Props Interface**:

```typescript
interface PanelError {
  code?: string;
  message: string;
  retryable?: boolean;
}

interface PlanResultDetailPanelProps {
  planResult: RuntimeSkillCreatorPlanResult | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
}
```

**レイアウト構造**:

```
┌──────────────────────────────────────────────────────────────┐
│ [Plan 結果]                           [estimatedSteps badge] │
│ skillName (H3)                                               │
│ description (サブテキスト)                                   │
├──────────────────────────────────────────────────────────────┤
│ Agents                                                        │
│ ├─ agentName — role                                           │
│ └─ agentName — role                                           │
├──────────────────────────────────────────────────────────────┤
│ Scripts                                                       │
│ ├─ scriptName — purpose                                       │
│ └─ scriptName — purpose                                       │
├──────────────────────────────────────────────────────────────┤
│ Triggers        [tag] [tag] [tag]                             │
├──────────────────────────────────────────────────────────────┤
│ Anchors         [tag] [tag] [tag]                             │
├──────────────────────────────────────────────────────────────┤
│ ▶ Skill Spec（折りたたみ）                                   │
│   skillSpec の全文表示                                        │
├──────────────────────────────────────────────────────────────┤
│ Plan ID: planId                                   (フッター) │
└──────────────────────────────────────────────────────────────┘
```

**状態別表示**:

- `isLoading: true` — スケルトンローダーを表示
- `planResult: null, error: null` — 非表示（何も返さない）
- `planResult: null, error: {..}` — ErrorBanner を表示
- `planResult: {..}` — 通常の結果パネルを表示

### ステップ2: ExecuteResultDetailPanel を設計する

**Props Interface**:

```typescript
interface ExecuteResultDetailPanelProps {
  executeResult: RuntimeSkillCreatorExecuteResult | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
}
```

**レイアウト構造**:

```
┌──────────────────────────────────────────────────────────────┐
│ [Execute 結果]                         [成功/失敗 badge]     │
│ skillName (H3)                                               │
├──────────────────────────────────────────────────────────────┤
│ ✓ スキルが正常に作成されました（成功時）                    │
│ ✗ スキルの作成に失敗しました（失敗時）                      │
│   error メッセージ表示                                        │
│   sessionId / resultSubtype / stopReason                      │
│   permissionDenials / sdkEvents / sourceProvenance            │
│   [再試行] ボタン                                             │
├──────────────────────────────────────────────────────────────┤
│ Execute ID: executeId                                (フッター) │
└──────────────────────────────────────────────────────────────┘
```

**状態別表示**:

- `isLoading: true` — プログレスインジケーターを表示
- `executeResult: null, error: null` — 非表示
- `executeResult: null, error: {..}` — ErrorBanner を表示（IPC レベルエラー）
- `executeResult.success: true` — 成功パネルを表示
- `executeResult.success: false` — 失敗パネルを表示（error メッセージ + 再試行ボタン）

### ステップ3: エラー状態コンポーネントを設計する

**共通 ErrorBanner サブコンポーネント**:

```typescript
interface ErrorBannerProps {
  errorCode?: string;
  errorMessage: string;
  retryable?: boolean;
  onRetry?: () => void;
}
```

- 赤系の背景色（`border border-[var(--status-error)]/30 bg-[var(--status-error)]/5`）
- エラーアイコン + メッセージ表示
- 再試行ボタン（optional）
- TASK-RT-02 の error types を `errorCode` / `errorMessage` にマッピング

### ステップ4: SkillLifecyclePanel 統合を設計する

**統合ポイント**:

| ワークフロー state                    | 表示パネル               | トリガー条件                                   |
| ------------------------------------- | ------------------------ | ---------------------------------------------- |
| `currentPhase === "review"`           | PlanResultDetailPanel    | plan 完了後に raw plan detail が存在する       |
| `awaitingUserInput === "plan_review"` | PlanResultDetailPanel    | ユーザー承認待ち状態                           |
| `currentPhase === "verify"`           | ExecuteResultDetailPanel | execute 完了後に raw execute detail が存在する |
| plan エラー発生                       | PlanResultDetailPanel    | error prop にエラー情報を渡す                  |
| execute エラー発生                    | ExecuteResultDetailPanel | error prop にエラー情報を渡す                  |

**実装方式**:

- SkillLifecyclePanel 内で `currentPhase` に応じて条件分岐レンダリング
- raw plan / execute result は SkillLifecyclePanel の local state に保持し、normalized workflow state と分離する
- error state は TASK-RT-02 の response / local error を props 化して渡す
- terminal handoff は既存 handoff card をそのまま使い、detail panel では扱わない

### ステップ5: state 連動を設計する

- ワークフロー store の `currentPhase` 変更をリアクティブに監視する
- raw plan / execute detail は local state に保持し、workflowSnapshot と normalized plan result は既存 store を利用する
- 新規 store property の追加は行わない（既存データ + local state の組み合わせに限定）
- パネル切り替えは React の条件レンダリングで実現する

## Tailwind CSS デザインパターン

ImprovementProposalPanel と SkillLifecyclePanel から踏襲するパターン:

- カードコンテナ: `rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5`
- ヘッダー: `text-base font-semibold text-[var(--text-primary)]`
- セクション区切り: `border-t border-[var(--border-primary)] pt-3 mt-3`
- リスト: `space-y-2 text-sm text-[var(--text-primary)]`
- バッジ/タグ: `inline-flex items-center rounded-full px-2 py-1 text-xs font-medium`
- 成功バッジ: `bg-[var(--status-success)]/10 text-[var(--status-success)]`
- 失敗バッジ: `bg-[var(--status-error)]/10 text-[var(--status-error)]`
- メタデータ: `rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3`

## 統合テスト連携

- Phase 4 で props パターン別の test case を定義する
- Phase 6 で null/undefined/空配列等の edge case を追加する
- Phase 9 で既存コンポーネントとの style 整合性を監査する

## 成果物

| 成果物              | パス                                     | 説明                         |
| ------------------- | ---------------------------------------- | ---------------------------- |
| 設計書              | `phase-2-design.md`                      | コンポーネント設計と統合方式 |
| component design    | `outputs/phase-2/component-design.md`    | レイアウト図と状態遷移       |
| panel props catalog | `outputs/phase-2/panel-props-catalog.md` | props interface 一覧         |

## 完了条件

- [ ] PlanResultDetailPanel の props interface とレイアウトが定義されている
- [ ] ExecuteResultDetailPanel の props interface とレイアウトが定義されている
- [ ] ErrorBanner サブコンポーネントが設計されている
- [ ] SkillLifecyclePanel 統合ポイントが state 別に定義されている
- [ ] Tailwind CSS パターンが ImprovementProposalPanel から踏襲されている
- [ ] **本Phase内の全タスクを100%実行完了**
