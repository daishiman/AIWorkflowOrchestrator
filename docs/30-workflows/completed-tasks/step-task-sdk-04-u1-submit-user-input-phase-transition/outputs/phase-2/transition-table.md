# Phase Transition Semantics Table

## reason 別 phase 遷移表（確定版）

### plan_review（計画レビュー）

| selectedOptionId   | currentPhase 遷移 | verifyResult 変更    | 補足                                     |
| ------------------ | ----------------- | -------------------- | ---------------------------------------- |
| `ready_to_execute` | → `"execute"`     | 変更なし             | ユーザーが計画を承認、実行フェーズへ進む |
| `needs_changes`    | → `"plan"`        | message に textValue | ユーザーが修正を要求、計画へ差し戻し     |

### verification_review（検証レビュー）

| selectedOptionId | currentPhase 遷移 | verifyResult 変更                       | 補足                         |
| ---------------- | ----------------- | --------------------------------------- | ---------------------------- |
| `approve`        | 変更なし          | status→`"pass"`, nextAction→`"handoff"` | 検証合格、成果物ハンドオフへ |
| `improve`        | 変更なし          | nextAction→`"improve"`                  | 改善サイクルを実行           |
| `reject`         | → `"plan"`        | status→`"fail"`, nextAction→`"review"`  | 不合格、計画再策定へ戻す     |

### 設計判断の記録

1. `reject` → `"plan"`: 再計画の意図が明確。rejection 情報は artifact に記録されるため phase 名での情報欠落は許容
2. `approve` 時の `currentPhase` 遷移: しない。`verifyResult.nextAction = "handoff"` で十分。phase 遷移は次の workflow action が担う
3. `confirm` kind: 本タスクのスコープ外。遷移表は switch-case で拡張可能な設計
