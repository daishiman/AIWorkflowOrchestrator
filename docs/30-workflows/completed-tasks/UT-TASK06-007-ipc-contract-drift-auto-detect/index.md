# UT-TASK06-007: IPC契約ドリフト自動検出スクリプト（Phase 9統合）

## メタ情報

| 項目         | 値                                                                             |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | UT-TASK06-007                                                                  |
| タスク名     | IPC契約ドリフト自動検出スクリプト（Phase 9統合）                               |
| 分類         | 品質改善・自動化                                                               |
| 対象機能     | IPC契約整合性検証（全機能共通基盤）                                            |
| 優先度       | 高                                                                             |
| 見積もり規模 | 中規模                                                                         |
| ステータス   | 未実施                                                                         |
| 発見元       | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 skill-feedback-report T-02 |
| 発見日       | 2026-03-17                                                                     |
| GitHub Issue | #1309                                                                          |

## 概要

Main ProcessハンドラとPreload APIの引数型・チャンネル名の整合を自動検証するスクリプトを作成し、Phase 9品質検証に統合する。P44（引数形式不一致）、P45（引数命名ドリフト）、P60（レスポンス形式不一致）パターンの再発を防止する。

## スコープ

### 含むもの

- `apps/desktop/scripts/check-ipc-contracts.ts` の新規作成
- Main Process ハンドラ（`ipcMain.handle`）の引数型定義の grep/rg による抽出
- Preload API（`safeInvoke`）の呼び出しパターン抽出
- チャンネル名・引数形式の照合とレポート出力
- Phase 9 テンプレートへの統合ステップ追加

### 含まないもの

- 検出された不整合の自動修正
- AST パーサーの独自実装
- `ipcMain.on` 等の別 IPC パターンの検証（第2フェーズのスコープ外）

## Phase一覧

| Phase | 名称             | ファイル                                               | ステータス |
| ----- | ---------------- | ------------------------------------------------------ | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)     | 未実施     |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                 | 未実施     |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)   | 未実施     |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)   | 未実施     |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md) | 未実施     |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md) | 未実施     |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](phase-7-coverage-check.md) | 未実施     |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)       | 未実施     |
| 9     | 品質検証         | [phase-9-quality.md](phase-9-quality.md)               | 未実施     |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)   | 未実施     |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)     | 未実施     |
| 12    | ドキュメント     | [phase-12-documentation.md](phase-12-documentation.md) | 未実施     |
| 13    | PR作成           | [phase-13-pr.md](phase-13-pr.md)                       | BLOCKED    |

## Phase依存関係

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
                                                                  ↓
Phase 13 ← Phase 12 ← Phase 11 ← Phase 10 ← Phase 9 ← Phase 8 ←┘
```

## 成果物一覧

### コード成果物

| 成果物                  | パス                                                                               | Phase |
| ----------------------- | ---------------------------------------------------------------------------------- | ----- |
| 検出スクリプト          | `apps/desktop/scripts/check-ipc-contracts.ts`                                      | 5     |
| テストコード            | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                       | 4, 6  |
| Phase 9テンプレート更新 | `.claude/skills/task-specification-creator/references/phase-template-execution.md` | 5     |

### ドキュメント成果物

| 成果物                   | パス                                                     | Phase |
| ------------------------ | -------------------------------------------------------- | ----- |
| 要件定義書               | `outputs/phase-1/requirements.md`                        | 1     |
| P50チェック結果          | `outputs/phase-1/p50-check-result.md`                    | 1     |
| 設計書                   | `outputs/phase-2/design.md`                              | 2     |
| 設計レビュー結果         | `outputs/phase-3/gate-decision.md`                       | 3     |
| テスト設計書             | `outputs/phase-4/test-design.md`                         | 4     |
| カバレッジレポート       | `outputs/phase-7/coverage-report.md`                     | 7     |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md`                  | 8     |
| 品質レポート             | `outputs/phase-9/quality-report.md`                      | 9     |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                | 10    |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                 | 11    |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`                  | 11    |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | 12    |
| 仕様書更新サマリー       | `outputs/phase-12/system-spec-update-summary.md`         | 12    |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`            | 12    |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`          | 12    |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 12    |
| タスク仕様準拠チェック   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 12    |

## 関連情報

| 項目                  | リンク                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- |
| GitHub Issue          | #1309                                                                               |
| 既存タスク指示書      | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect.md` |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`       |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md` (P44, P45, P60)                                |

## 検出ルール概要

| ルールID | ルール名                 | 検出パターン                                    | 重大度  | 対応P |
| -------- | ------------------------ | ----------------------------------------------- | ------- | ----- |
| R-01     | チャンネル孤児           | Main/Preloadの片方にしか存在しないチャンネル    | warning | -     |
| R-02     | 引数形式不一致           | Main=object、Preload=primitive（またはその逆）  | error   | P44   |
| R-03     | チャンネル名ハードコード | `IPC_CHANNELS` 定数でなく文字列リテラルを使用   | warning | P27   |
| R-04     | 未登録チャンネル         | Preloadで使用しているがMainでhandleされていない | error   | -     |
