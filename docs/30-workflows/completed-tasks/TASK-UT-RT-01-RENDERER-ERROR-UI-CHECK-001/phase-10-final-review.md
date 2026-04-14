# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 10                                           |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 9                                      |
| 後続Phase  | Phase 11（PASS時）/ Phase 9（MAJOR判定時）   |
| 作成日     | 2026-04-13                                   |
| ステータス | pending                                      |

## 目的

Phase 1〜9 の全成果物を横断的にレビューし、受け入れ基準を全て満たしているか判定する。
Phase 11（手動テスト）へ進められるかのゲートを通過する。

## 最終レビュー観点

### 受け入れ基準チェック

| 受け入れ基準                                                                                         | 対応テスト | 判定 |
| ---------------------------------------------------------------------------------------------------- | ---------- | ---- |
| `onWorkflowStateChanged` の `errorMessage` が `setWorkflowError` でストアに保存される                | UT-01      | -    |
| `workflowError` が `currentSurfaceError` を通じて `data-testid="skill-lifecycle-error"` に表示される | UT-01      | -    |
| `skillExecutionStatus === "error"` 時に `skillError` が detail に表示される                          | UT-02      | -    |
| `getWorkflowState()` 再読込で failure snapshot が優先表示される                                      | UT-03      | -    |
| E2E テストまたは手動テストの証跡が存在する                                                           | Phase 11   | -    |
| `pnpm lint` が通過している                                                                           | Phase 9    | -    |

### ゲート判定基準

| 判定  | 条件                                          | 対応               |
| ----- | --------------------------------------------- | ------------------ |
| PASS  | 全受け入れ基準が確認済み、MINOR 指摘が3件以下 | Phase 11 へ進む    |
| MINOR | 軽微な指摘あり（機能影響なし）                | 未タスク化して進む |
| MAJOR | 受け入れ基準の未達成・重大な品質問題          | Phase 9 に差し戻し |

**注意（[Feedback 10]）**: Phase 10 MINOR 指摘は必ず未タスク化すること。
「機能に影響なし」は未タスク化を省略する理由にならない。

## 横断チェック

| 観点           | チェック内容                                          |
| -------------- | ----------------------------------------------------- |
| 要件整合       | Phase 1 の要件が全て Phase 5 実装に反映されているか   |
| テスト整合     | Phase 4 の Red → Phase 5 の Green が記録されているか  |
| カバレッジ整合 | Phase 7 で対象箇所 100% が確認されているか            |
| 品質整合       | Phase 9 で lint/typecheck PASS が確認されているか     |
| スコープ遵守   | Main 層・IPC ブリッジへの不要な変更が含まれていないか |

## 参照資料

| 参照資料     | パス                                     | 説明           |
| ------------ | ---------------------------------------- | -------------- |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md` | Phase 1 成果物 |
| 品質レポート | `outputs/phase-9/quality-report.md`      | Phase 9 成果物 |
| リスク台帳   | `outputs/phase-9/risk-register.md`       | Phase 9 成果物 |

## 成果物

| 成果物           | パス                                              | 説明                     |
| ---------------- | ------------------------------------------------- | ------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | 全受け入れ基準の判定     |
| 是正計画         | `outputs/phase-10/corrective-action-plan.md`      | MINOR 指摘の未タスク一覧 |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | Phase 11 進行可否判定    |

## 完了条件

- [ ] 全受け入れ基準に判定が記録されている
- [ ] ゲート判定（PASS / MINOR / MAJOR）が記録されている
- [ ] MINOR 指摘があれば未タスク化されている
- [ ] 出荷準備チェックが完成している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ゲート判定が記録されている
- [ ] 実行記録を残した

## 次のPhase

Phase 11: 手動テスト検証（PASS 判定時）
