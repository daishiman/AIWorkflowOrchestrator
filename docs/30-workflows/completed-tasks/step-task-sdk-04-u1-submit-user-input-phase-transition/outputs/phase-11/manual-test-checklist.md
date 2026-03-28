# Manual Test Checklist

## テスト方式

NON_VISUAL — engine 内部ロジックのみの変更。renderer surface の追加差分なし。

## NON_VISUAL 判定根拠

1. 変更対象は `SkillCreatorWorkflowEngine.ts` の private メソッド追加のみ
2. `RuntimeSkillCreatorFacade.ts` / IPC handler / preload に変更なし
3. renderer は既存の `workflow-state-changed` event で snapshot を受信して表示するのみ
4. 新規 UI コンポーネント / ルーティング / スタイル変更なし

## チェック項目

| ID    | 観点           | 確認内容                                        | 検証方法                                           |
| ----- | -------------- | ----------------------------------------------- | -------------------------------------------------- |
| MT-01 | AC-1 coverage  | plan_review + ready_to_execute → execute        | `vitest run --grep "plan_review ready_to_execute"` |
| MT-02 | AC-2 coverage  | plan_review + needs_changes → plan              | `vitest run --grep "plan_review needs_changes"`    |
| MT-03 | AC-3 coverage  | verification_review + approve → handoff/pass    | `vitest run --grep "verification_review approve"`  |
| MT-04 | AC-4 coverage  | verification_review + improve → improve         | `vitest run --grep "verification_review improve"`  |
| MT-05 | AC-5 coverage  | verification_review + reject → plan/review      | `vitest run --grep "verification_review reject"`   |
| MT-06 | AC-6 coverage  | facade snapshot = engine snapshot               | `vitest run --grep "facade snapshot"`              |
| MT-07 | AC-7 coverage  | state-changed event に遷移後 snapshot           | `vitest run --grep "state-changed event"`          |
| MT-08 | NFR-3          | unknown option → no-op fallback                 | `vitest run --grep "unknown"`                      |
| MT-09 | artifact       | phase_transition artifact 記録                  | `vitest run --grep "phase_transition"`             |
| MT-10 | regression     | 既存 awaitingUserInput クリア / stale requestId | 既存テスト 16 件パス                               |
| MT-11 | owner boundary | facade / IPC / preload に変更なし               | `git diff --stat` で確認                           |
