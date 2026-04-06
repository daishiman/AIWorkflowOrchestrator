# Lessons Learned（教訓集） / skill domain lessons (plan exec hardening)

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: skill domain lessons (plan execution hardening / Lane分割並列実装)

## TASK-P0-07: Lane分割による並列実装の効果確認 (step-11)

### タスク概要

| 項目       | 値                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-P0-07                                                                                                      |
| 目的       | plan execution hardening — `planPromptConstants.ts` の `AGENT_NAMES` 定数削除と fallback path の単一ソース化    |
| 完了日     | 2026-04-01                                                                                                      |
| ステータス | 完了                                                                                                            |
| 背景       | step-11-par-task-plan-execution-hardening で Lane A（main-process）と Lane B（renderer）の並列実装を実施         |

### 知見

| #   | 知見                                           | 詳細                                                                                                                                                                                                                                                                    | 適用条件                                                                 |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | **単一ソース化でdrift防止**                     | `AGENT_NAMES` と `PLAN_RESOURCE_REQUESTS` の重複定義を解消し、`PLAN_RESOURCE_REQUESTS` を唯一の正本とすることで、将来の agent 追加が自動的に fallback path に反映される設計を実現                                                                                        | 同一情報が複数定義として存在するとき                                       |
| 2   | **Lane分割の前提**                              | Lane A（`planPromptConstants.ts` / `RuntimeSkillCreatorFacade.ts`）と Lane B（`SkillLifecyclePanel.tsx`）は依存関係がなく、並列実装に適していた。依存関係ゼロが並列化の必要条件                                                                                           | main-process / renderer のように依存関係がないコンポーネント間の実装      |
| 3   | **コメントによるsemantics明確化**               | `approvedSkillSpec` の frozen snapshot semantics をコード変更なしでコメントで明示するアプローチは、IPC contract を変えずに意図を伝える最小変更として有効                                                                                                                  | public surface を変えずに設計意図を記録したいとき                         |

---

## [2026-04-03] TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 知見

### 同期→非同期移行時のライフサイクル設計チェックリスト

**問題**: fire-and-forget化（TASK-FIX-EXECUTE-PLAN-FF-001）により、
アプリ終了時のgraceful shutdownが未考慮となった

**根本原因**: 同期→非同期移行時、Phase 2設計段階でElectronライフサイクル
（before-quit/will-quit）への影響チェックが抜けていた

**解決策**: registerBeforeQuitGuard(deps)でbefore-quitを監視、
app.exit(0)による即時終了（既知の制限：LLM API中断リクエスト未送信）

**チェックリスト（将来の同期→非同期移行時に使用）**:
- [ ] before-quitイベントとの整合確認
- [ ] will-quitイベントとの整合確認
- [ ] 長時間実行処理がある場合のgraceful shutdown設計
- [ ] LLM API接続中の終了時の挙動定義

**関連タスク**: TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001, TASK-FIX-EXECUTE-PLAN-FF-001

---

## [2026-04-06] TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001 知見

### phase 遷移責務と artifact 記録責務の分離

**問題**: `improve()` が失敗したときに `currentPhase` を `"review"` へ戻すべきか、`"improve"` のまま保持するかで設計判断が必要だった。

**解決策**: `currentPhase` は「ユーザーが今どのステップにいるか」の表現（phase 遷移責務）であり、`verifyResult` / `phaseArtifacts` は「何が行われたか」の記録（artifact 記録責務）として分離する。失敗時は `currentPhase` を変えず、`verifyResult.nextAction` で次アクションを示す。

**ルール**: `currentPhase` を後退（`"improve"` → `"review"`）させると「まだレビュー前」という誤解を招く。失敗は `status: "fail"` + `nextAction` で表現すること。

### ダックタイピングメソッドのテストモック

**問題**: `recordImproveFailureSnapshot()` が `workflowEngine.recordImproveFailure?.()` の存在チェックを行うダックタイピングパターンになっており、テスト時にモックが難しかった。

**解決策**: テストでは `workflowEngine` の mock に `recordImproveFailure` メソッドを明示的に追加する。フォールバックロジックのテストは別途 `recordImproveFailure` なしの mock で検証する。

### 上位ループへの通知統一ルール

**問題**: `execute()` / `improve()` 単体に adapter エラー通知を追加した際、`verifyAndImproveLoop()` が `improve()` を呼び出す上位ループであることの確認が漏れた。

**ルール**: adapter ガードを追加した際は、同じメソッドを呼び出す上位ループも同波で通知統一チェックを行うこと。

**関連タスク**: TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001, TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001
