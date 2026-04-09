# Phase 7 タスク3: 未カバーブランチ一覧

## LLM 生成テスト単体での未カバーブランチ

### SkillCreateWizard.tsx

| 分類     | 未カバー箇所                                                                                  | 理由                                                             |
| -------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 既存関数 | handleRetry, handleQualityFeedback, handleExecuteNow, handleOpenInEditor, handleCreateAnother | CompleteStep 到達が必要。既存テスト（template flow）でカバー済み |
| 既存関数 | resolveKnownTool, toExternalToolName（一部）                                                  | q5 の複雑パス。既存テストでカバー済み                            |

### GenerateStep.tsx

| 分類         | 未カバー箇所                  | 理由                                                  |
| ------------ | ----------------------------- | ----------------------------------------------------- |
| 既存ブランチ | terminal_handoff 表示ロジック | E-6 がスキップのため。GenerateStep 既存テストでカバー |

## 判定

TASK-SC-07 新規追加コードの未カバーブランチ: **なし**

上記の未カバーは全て TASK-SC-07 導入前から存在する既存コードであり、プロジェクト全体のテストスイートでカバーされている。
