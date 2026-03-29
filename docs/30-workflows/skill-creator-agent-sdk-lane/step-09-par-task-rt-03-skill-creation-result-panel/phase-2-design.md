# Phase 2: 設計

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 2                           |
| 機能名 | skill-creation-result-panel |
| 作成日 | 2026-03-29                  |

## 目的

`PlanResultDetailPanel` と `ExecuteResultDetailPanel` のコンポーネント設計、props interface、内部レイアウト構造、SkillLifecyclePanel 統合方式、state 連動パターンを設計する。

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

## 実行手順

### ステップ1: PlanResultDetailPanel を設計する

**Props Interface**:

```typescript
interface PlanResultDetailPanelProps {
  planResult: RuntimeSkillCreatorPlanResult | null;
  error?: { code: string; message: string } | null;
  isLoading?: boolean;
}
```

**レイアウト構造**:

```
┌─────────────────────────────────────────────┐
│ [Plan 結果]                   [estimatedSteps badge] │
│ skillName (H3)                                │
│ description (サブテキスト)                    │
├─────────────────────────────────────────────┤
│ Agents                                        │
│ ├─ agentName — role                          │
│ └─ agentName — role                          │
├─────────────────────────────────────────────┤
│ Scripts                                       │
│ ├─ scriptName — purpose                      │
│ └─ scriptName — purpose                      │
├─────────────────────────────────────────────┤
│ Triggers       [tag] [tag] [tag]             │
├─────────────────────────────────────────────┤
│ Anchors        [tag] [tag] [tag]             │
├─────────────────────────────────────────────┤
│ ▶ Skill Spec（折りたたみ）                   │
│   skillSpec の全文表示                        │
├─────────────────────────────────────────────┤
│ Plan ID: planId                   (フッター) │
└─────────────────────────────────────────────┘
```

**状態別表示**:

- `isLoading: true` — スケルトンローダーを表示
- `planResult: null, error: null` — 非表示（何も返さない）
- `planResult: null, error: {..}` — エラーパネルを表示
- `planResult: {..}` — 通常の結果パネルを表示

### ステップ2: ExecuteResultDetailPanel を設計する

**Props Interface**:

```typescript
interface ExecuteResultDetailPanelProps {
  executeResult: RuntimeSkillCreatorExecuteResult | null;
  error?: { code: string; message: string } | null;
  isLoading?: boolean;
  onRetry?: () => void;
}
```

**レイアウト構造**:

```
┌─────────────────────────────────────────────┐
│ [Execute 結果]                [成功/失敗 badge] │
│ skillName (H3)                                │
├─────────────────────────────────────────────┤
│ ✓ スキルが正常に作成されました               │（成功時）
│ ✗ スキルの作成に失敗しました                 │（失敗時）
│   error メッセージ表示                        │
│   [再試行] ボタン                            │
├─────────────────────────────────────────────┤
│ Execute ID: executeId             (フッター) │
└─────────────────────────────────────────────┘
```

**状態別表示**:

- `isLoading: true` — プログレスインジケーターを表示
- `executeResult: null, error: null` — 非表示
- `executeResult: null, error: {..}` — エラーパネルを表示（IPC レベルエラー）
- `executeResult.success: true` — 成功パネルを表示
- `executeResult.success: false` — 失敗パネルを表示（error メッセージ + 再試行ボタン）

### ステップ3: エラー状態コンポーネントを設計する

**共通 ErrorBanner サブコンポーネント**:

```typescript
interface ErrorBannerProps {
  errorCode: string;
  errorMessage: string;
  onRetry?: () => void;
}
```

- 赤系の背景色（`bg-red-50 dark:bg-red-900/20`）
- エラーアイコン + メッセージ表示
- 再試行ボタン（optional）
- TASK-RT-02 の error types を `errorCode` / `errorMessage` にマッピング

### ステップ4: SkillLifecyclePanel 統合を設計する

**統合ポイント**:

| ワークフロー state                    | 表示パネル               | トリガー条件                              |
| ------------------------------------- | ------------------------ | ----------------------------------------- |
| `currentPhase === "review"`           | PlanResultDetailPanel    | plan 完了後に planResult が存在する       |
| `awaitingUserInput === "plan_review"` | PlanResultDetailPanel    | ユーザー承認待ち状態                      |
| `currentPhase === "verify"`           | ExecuteResultDetailPanel | execute 完了後に executeResult が存在する |
| plan エラー発生                       | PlanResultDetailPanel    | error prop にエラー情報を渡す             |
| execute エラー発生                    | ExecuteResultDetailPanel | error prop にエラー情報を渡す             |

**実装方式**:

- SkillLifecyclePanel 内で `currentPhase` に応じて条件分岐レンダリング
- planResult / executeResult は既存の store から取得
- error state は TASK-RT-02 で追加される store property から取得

### ステップ5: state 連動を設計する

- ワークフロー store の `currentPhase` 変更をリアクティブに監視する
- `planResult` / `executeResult` は store 内に保持される既存データを利用する
- 新規 store property の追加は行わない（既存データの表示に限定）
- パネル切り替えは React の条件レンダリングで実現する

## Tailwind CSS デザインパターン

ImprovementProposalPanel から踏襲するパターン:

- カードコンテナ: `rounded-lg border bg-white dark:bg-gray-800 p-4 shadow-sm`
- ヘッダー: `text-lg font-semibold text-gray-900 dark:text-gray-100`
- セクション区切り: `border-t border-gray-200 dark:border-gray-700 pt-3 mt-3`
- リスト: `space-y-2 text-sm text-gray-700 dark:text-gray-300`
- バッジ/タグ: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`
- 成功バッジ: `bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
- 失敗バッジ: `bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`

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
