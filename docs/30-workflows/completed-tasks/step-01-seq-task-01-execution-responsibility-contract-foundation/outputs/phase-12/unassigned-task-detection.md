# Phase 12: 未タスク検出レポート

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 12                                                        |
| 作成日   | 2026-03-20                                                |
| 最終更新 | 2026-03-20                                                |

## 検出結果

| 検出件数 | 3 件 |
| -------- | ---- |

## 未タスク一覧

### UT-EXEC-01: scope-definition.md への execution-capability.ts パス追記

| 項目       | 内容                                                                                                                                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 出典       | Phase 10 MINOR-1 指摘                                                                                                                                                                                                                                                           |
| 優先度     | high                                                                                                                                                                                                                                                                            |
| 担当       | Phase 13 前または Task02 着手前                                                                                                                                                                                                                                                 |
| 内容       | `scope-definition.md` の canonical doc set（D. Implementation Anchor 節）に `packages/shared/src/types/execution-capability.ts` を追加する。現状は `auth-mode.ts` と `RuntimePolicyResolver.ts` の2ファイルのみ記載で、Task01 で新規作成した `execution-capability.ts` が未記載 |
| 完了条件   | `scope-definition.md` の Implementation Anchor テーブルに `execution-capability.ts` 行を追加し、参照目的「AccessCapability / UiState / CtaContract 型定義と pure function の実装正本」を記載する                                                                                |
| ステータス | 未着手                                                                                                                                                                                                                                                                          |

### UT-EXEC-02: RuntimePolicyResolver.ts の 4状態化（下流 Task02 への引き継ぎ）

| 項目       | 内容                                                                                                                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 出典       | Phase 2 design-summary.md Concern A ownership / Phase 5 実装スコープ                                                                                                                                                                                                                                                                         |
| 優先度     | high                                                                                                                                                                                                                                                                                                                                         |
| 担当       | Task02                                                                                                                                                                                                                                                                                                                                       |
| 内容       | 現状の `RuntimePolicyResolver.ts` は 2状態（api-key / subscription 二択）のまま。Task01 で確立した `resolveCapability()` を `RuntimePolicyResolver.ts` の中央 authority として組み込み、4状態（integratedRuntime / terminalSurface / both / none）を正式に返すように実装する。`assertNoSilentFallback()` を組み込んで enforcement も確立する |
| 完了条件   | `RuntimePolicyResolver.ts` が `resolveCapability()` を呼び出し、4状態の `AccessCapability` を返すこと。既存テストが全 PASS すること                                                                                                                                                                                                          |
| ステータス | 未着手（Task02 スコープ）                                                                                                                                                                                                                                                                                                                    |

### UT-EXEC-03: Renderer の capability selector/hook の Consumer 統合（下流 Task03-04 への引き継ぎ）

| 項目       | 内容                                                                                                                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 出典       | Phase 2 design-summary.md Concern B/C ownership / contract-matrix Renderer 消費境界                                                                                                                                                                                               |
| 優先度     | medium                                                                                                                                                                                                                                                                            |
| 担当       | Task03 / Task04                                                                                                                                                                                                                                                                   |
| 内容       | Renderer 側で `resolveUiState()` / `resolveCtaContract()` を呼び出す selector / hook を実装し、Settings / Chat / Workspace の各 surface に接続する。現状は `chatSlice.ts` が `AccessCapability` を re-export しているだけで、actual consumer（UI コンポーネント）への接続は未実施 |
| 完了条件   | Settings（Task03）と Chat/Workspace（Task04）の各コンポーネントが capability / uiState を正しく参照し、contract-matrix 準拠の CTA を表示すること                                                                                                                                  |
| ステータス | 未着手（Task03/04 スコープ）                                                                                                                                                                                                                                                      |

## 検出プロセス

### Phase 10 MINOR 指摘からの未タスク

- Phase 10 final-gate-decision: **PASS**（MINOR 指摘 1 件）
- MINOR-1: `execution-capability.ts` が `scope-definition.md` の canonical doc set（Implementation Anchor）に未記載
- 未タスク変換: **UT-EXEC-01** として formalization 済み

### Phase 11 discovered-issues からの未タスク

- Phase 11 discovered-issues: 設計タスクのため実際の UI walkthrough は下流タスクで実施
- 後続 Task への引き継ぎ事項を UT-EXEC-02 / UT-EXEC-03 として formalization 済み

### Phase 8 simplification-candidates からの未タスク

- Alternative A / B: ともに**棄却維持**
- 再評価クローズ対象: なし（GitHub Issue 未作成のため Close 不要）

### Residual Risk からの未タスク

Phase 7 で定義した RR-1〜RR-4 は Phase 9 への handoff として記録済みであり、Task01 のスコープ内で Phase 9 対応として完結する。独立した未タスクとしての formalization は不要。

## 3ステップ完了チェック（P3/P38 対策）

| 番号       | ステップ 1: 指示書作成                                                                                                         | ステップ 2: task-workflow 残課題登録      | ステップ 3: 関連仕様書リンク追加                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| UT-EXEC-01 | `docs/30-workflows/unassigned-task/task-exec-scope-definition-path-update-001.md` に独立指示書作成済み（P58 是正）             | task-workflow.md 残課題テーブルに登録済み | scope-definition.md の Implementation Anchor 節へのリンク追加を UT-EXEC-01 本体に記載 |
| UT-EXEC-02 | `docs/30-workflows/unassigned-task/task-exec-runtime-policy-resolver-4state-001.md` に独立指示書作成済み（P58 是正）           | task-workflow.md 残課題テーブルに登録済み | contract-matrix.md の Ownership 表（Concern A）に参照                                 |
| UT-EXEC-03 | `docs/30-workflows/unassigned-task/task-exec-renderer-capability-consumer-integration-001.md` に独立指示書作成済み（P58 是正） | task-workflow.md 残課題テーブルに登録済み | contract-matrix.md の Ownership 表（Concern B/C）に参照                               |
