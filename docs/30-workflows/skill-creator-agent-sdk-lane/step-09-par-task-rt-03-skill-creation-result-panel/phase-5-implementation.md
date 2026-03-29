# Phase 5: 実装

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 5                           |
| 機能名 | skill-creation-result-panel |
| 作成日 | 2026-03-29                  |

## 目的

`PlanResultDetailPanel`、`ExecuteResultDetailPanel`、`ErrorBanner` を実装し、SkillLifecyclePanel への統合を行う。

## 想定変更ポイント

- `apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx` — 新規作成
- `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx` — 新規作成
- `apps/desktop/src/renderer/components/skill/ErrorBanner.tsx` — 新規作成
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — パネル統合（条件分岐レンダリング追加）
- `apps/desktop/src/renderer/components/skill/__tests__/PlanResultDetailPanel.test.tsx` — 新規作成
- `apps/desktop/src/renderer/components/skill/__tests__/ExecuteResultDetailPanel.test.tsx` — 新規作成
- `apps/desktop/src/renderer/components/skill/__tests__/ErrorBanner.test.tsx` — 新規作成

## 実装しないこと

- error types の定義（TASK-RT-02 の責務）
- plan/execute ロジックの変更
- IPC channel の変更
- state management store の新規追加
- verify/improve phase の結果表示
- SkillCreateWizard の変更

## 実行タスク

- ErrorBanner 共通サブコンポーネントを作成する
- PlanResultDetailPanel を作成する
- ExecuteResultDetailPanel を作成する
- SkillLifecyclePanel にパネル統合を追加する
- ユニットテストを作成する

## 参照資料

| 資料名              | パス                                                                      | 説明               |
| ------------------- | ------------------------------------------------------------------------- | ------------------ |
| Phase 2 設計        | `phase-2-design.md`                                                       | コンポーネント設計 |
| panel props catalog | `outputs/phase-2/panel-props-catalog.md`                                  | props interface    |
| Phase 4 test matrix | `outputs/phase-4/test-matrix.md`                                          | test case 一覧     |
| ImprovementPanel    | `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` | UI パターン参考    |
| 型定義              | `packages/shared/src/types/skillCreator.ts`                               | PlanResult 型      |

## 実行手順

### ステップ1: ErrorBanner を作成する

`apps/desktop/src/renderer/components/skill/ErrorBanner.tsx`:

- `ErrorBannerProps` interface を定義する（errorCode, errorMessage, onRetry?）
- 赤系の背景色（`bg-red-50 dark:bg-red-900/20`）で表示する
- エラーアイコン + メッセージをレイアウトする
- `onRetry` が存在する場合のみ再試行ボタンを表示する
- TASK-RT-02 の error types が未確定の場合は `string` ベースで実装し、後から型を調整する

### ステップ2: PlanResultDetailPanel を作成する

`apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx`:

- `PlanResultDetailPanelProps` interface を定義する
- カードコンテナ（`rounded-lg border bg-white dark:bg-gray-800 p-4 shadow-sm`）
- ヘッダー: skillName + estimatedSteps バッジ
- description をサブテキストとして表示
- Agents セクション: name — role のリスト表示
- Scripts セクション: name — purpose のリスト表示
- Triggers セクション: タグ形式の一覧表示
- Anchors セクション: タグ形式の一覧表示
- skillSpec の折りたたみ表示（`<details>` / `<summary>` または state 制御）
- planId をフッターに小さく表示
- `isLoading` 時のスケルトンローダー
- `error` 時の ErrorBanner 表示
- `planResult: null` 時は `null` を返す

### ステップ3: ExecuteResultDetailPanel を作成する

`apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx`:

- `ExecuteResultDetailPanelProps` interface を定義する
- カードコンテナ（同一の Tailwind CSS パターン）
- ヘッダー: skillName + 成功/失敗バッジ
- 成功時: 成功メッセージの表示
- 失敗時: エラーメッセージ + 再試行ボタンの表示
- executeId をフッターに小さく表示
- `isLoading` 時のプログレスインジケーター
- `error` 時の ErrorBanner 表示
- `executeResult: null` 時は `null` を返す

### ステップ4: SkillLifecyclePanel にパネル統合を追加する

`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`:

- `PlanResultDetailPanel` と `ExecuteResultDetailPanel` を import する
- `currentPhase` に応じた条件分岐レンダリングを追加する:
  - `"review"` / `awaitingUserInput === "plan_review"`: PlanResultDetailPanel
  - `"verify"`: ExecuteResultDetailPanel
- 既存の store から planResult / executeResult を取得する
- error state は props 経由で渡す
- 既存のレンダリングロジックを壊さない（additive change のみ）

### ステップ5: ユニットテストを作成する

- Phase 4 の test matrix に従い、テストを作成する
- `@testing-library/react` を使用してコンポーネントをレンダリングする
- props パターン別の表示確認
- ユーザーインタラクション（折りたたみ展開、再試行ボタンクリック）の確認

## 統合テスト連携

- Phase 6 で edge case（空配列、特殊文字、極端に長いデータ）を追加する
- Phase 7 で全表示フィールドの coverage を確認する

## 実装完了の判断

- `PlanResultDetailPanel` が `RuntimeSkillCreatorPlanResult` の全フィールドを表示できる
- `ExecuteResultDetailPanel` が成功/失敗状態を適切に表示できる
- `ErrorBanner` がエラー状態を赤系背景で表示できる
- SkillLifecyclePanel で `currentPhase` に応じてパネルが切り替わる
- 全テストケースが pass する

## 成果物

| 成果物              | パス                        | 説明                         |
| ------------------- | --------------------------- | ---------------------------- |
| implementation plan | `phase-5-implementation.md` | 実装対象、責務、変更ポイント |

## 完了条件

- [ ] ErrorBanner が作成されている
- [ ] PlanResultDetailPanel が作成されている
- [ ] ExecuteResultDetailPanel が作成されている
- [ ] SkillLifecyclePanel にパネル統合が追加されている
- [ ] ユニットテストが pass/fail シナリオを網羅する
- [ ] **本Phase内の全タスクを100%実行完了**
