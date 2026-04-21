# Phase 8: 責務境界マップ

## タスクID: TASK-RALLY-001

## RALLY-005以降への引き継ぎ情報

### SkillLifecyclePanel.tsx の現在の責務境界

dead code 削除後、`SkillLifecyclePanel.tsx` の入力送信関連の責務は以下のとおり整理された：

| 責務                 | 担当コンポーネント/フック                                 | 状態             |
| -------------------- | --------------------------------------------------------- | ---------------- |
| ユーザー入力送信     | `ConversationalInterview` コンポーネントの `submitAnswer` | 現行（変更なし） |
| workflowSnapshot管理 | `useWorkflowState` 等                                     | 現行（変更なし） |
| 旧入力state管理      | 削除済み                                                  | **削除完了**     |
| 旧送信ハンドラ       | 削除済み                                                  | **削除完了**     |

### RALLY-005 への影響

- `SkillLifecyclePanel.tsx` から旧 state 群と旧送信ハンドラが除去されたため、RALLY-005 が `workflowSnapshot` 更新権限設計を行う際に混乱となる dead code が存在しない
- `workflowSnapshot` は `applyWorkflowSnapshot` 等の現行フローで管理されており、RALLY-005 はこれを前提に設計可能

### 注意点

- `useState` インポートは維持されている（他 state で使用中）
- `SkillCreatorUserInputSubmission` 型は `_handleSubmitWorkflowInput` 内でのみ使用されていたが、削除により未使用となった場合は lint で検出される（削除済みのため問題なし）
