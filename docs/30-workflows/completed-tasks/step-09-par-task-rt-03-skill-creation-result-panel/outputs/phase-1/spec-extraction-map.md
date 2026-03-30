# Phase 1: Spec Extraction Map

## RuntimeSkillCreatorPlanResult → PlanResultDetailPanel

| フィールド     | 型                                         | 表示方式             | 必須/任意 |
| -------------- | ------------------------------------------ | -------------------- | --------- |
| skillName      | `string`                                   | ヘッダーに表示       | 必須      |
| description    | `string`                                   | サブヘッダーに表示   | 必須      |
| estimatedSteps | `number`                                   | バッジ表示           | 必須      |
| agents         | `Array<{ name: string; role: string }>`    | リスト表示           | 必須      |
| scripts        | `Array<{ name: string; purpose: string }>` | リスト表示           | 必須      |
| triggers       | `string[]`                                 | タグ表示             | 必須      |
| anchors        | `string[]`                                 | タグ表示             | 必須      |
| planId         | `string`                                   | フッターに小さく表示 | 任意      |
| skillSpec      | `string`                                   | 折りたたみ表示       | 任意      |

## RuntimeSkillCreatorExecuteResult → ExecuteResultDetailPanel

| フィールド        | 型                                      | 表示方式                           | 必須/任意 |
| ----------------- | --------------------------------------- | ---------------------------------- | --------- |
| skillName         | `string`                                | ヘッダーに表示                     | 必須      |
| success           | `boolean`                               | 成功/失敗バッジ（緑/赤）           | 必須      |
| error             | `string?`                               | エラーメッセージ（失敗時のみ表示） | 条件付き  |
| executeId         | `string`                                | フッターに小さく表示               | 任意      |
| sessionId         | `string?`                               | メタデータ行に表示                 | 任意      |
| resultSubtype     | `string?`                               | メタデータ行に表示                 | 任意      |
| stopReason        | `string?`                               | メタデータ行に表示                 | 任意      |
| permissionDenials | `SkillCreatorSdkPermissionDenial[]?`    | 折りたたみ一覧に表示               | 任意      |
| sdkEvents         | `SkillCreatorSdkEvent[]?`               | 件数 + 折りたたみ表示              | 任意      |
| sourceProvenance  | `SkillCreatorWorkflowSourceProvenance?` | provenance セクションに表示        | 任意      |

## エラー状態表示の要件

- plan 失敗: `RuntimeSkillCreatorPlanErrorResponse` の `error.message` を ErrorBanner に表示
- execute 失敗: `success: false` かつ `error` フィールドを ErrorBanner に表示
- IPC レベルエラー: props の `error` (PanelError) として渡す
- `terminal_handoff`: detail panel は非対象。既存 handoff card を維持

## SkillLifecyclePanel 統合ポイント

| ワークフロー state                    | 表示パネル               | トリガー条件                             |
| ------------------------------------- | ------------------------ | ---------------------------------------- |
| `currentPhase === "review"`           | PlanResultDetailPanel    | raw plan detail が local state に存在    |
| `awaitingUserInput === "plan_review"` | PlanResultDetailPanel    | ユーザー承認待ち状態                     |
| `currentPhase === "verify"`           | ExecuteResultDetailPanel | raw execute detail が local state に存在 |
| plan エラー発生                       | PlanResultDetailPanel    | error prop にエラー情報を渡す            |
| execute エラー発生                    | ExecuteResultDetailPanel | error prop にエラー情報を渡す            |

## AC 写像

| AC   | 対応フィールド / 統合ポイント                    |
| ---- | ------------------------------------------------ |
| AC-1 | PlanResultDetailPanel + 全 plan フィールド       |
| AC-2 | ExecuteResultDetailPanel + 全 execute フィールド |
| AC-3 | ErrorBanner + PanelError + RT-02 error types     |
| AC-4 | SkillLifecyclePanel currentPhase 条件分岐        |
| AC-5 | Tailwind CSS ImprovementProposalPanel 踏襲       |
| AC-6 | currentPhase / awaitingUserInput リアクティブ    |
