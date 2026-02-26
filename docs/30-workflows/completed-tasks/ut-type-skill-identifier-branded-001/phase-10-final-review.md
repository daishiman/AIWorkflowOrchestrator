# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 10                                                                     |
| Phase名    | 最終レビューゲート                                                     |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | Phase 9                                                                |
| 後続Phase  | Phase 11                                                               |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

Phase 1-9 の成果物を最終レビューし、手動テスト移行可否を判定する。

## 背景

実装が完了しても仕様との微差が残る可能性がある。最終ゲートで判定し戻り先を固定する。

## 実行タスク

- SubAgent-A（仕様整合レビュー）: 要件と実装の整合をレビューする
- SubAgent-B（テスト整合レビュー）: テスト網羅性と証跡をレビューする
- SubAgent-C（運用整合レビュー）: ドキュメント更新前提をレビューする
- Lead（ゲート判定）: 最終判定と戻り先を決定する

## 参照資料

| 参照資料             | パス                                            | 内容           |
| -------------------- | ----------------------------------------------- | -------------- |
| 依存Phase 1          | `phase-1-requirements.md`                       | 要件正本       |
| 依存Phase 2          | `phase-2-design.md`                             | 設計正本       |
| 依存Phase 5          | `phase-5-implementation.md`                     | 実装正本       |
| 依存Phase 9          | `phase-9-quality-assurance.md`                  | 品質監査       |
| 要件定義             | `outputs/phase-1/requirements-definition.md`    | Phase 1 成果物 |
| スコープ定義         | `outputs/phase-1/scope-definition.md`           | Phase 1 成果物 |
| 変換境界定義         | `outputs/phase-1/boundary-definition.md`        | Phase 1 成果物 |
| SubAgent責務表       | `outputs/phase-1/subagent-team-plan.md`         | Phase 1 成果物 |
| 型設計書             | `outputs/phase-2/branded-type-design.md`        | Phase 2 成果物 |
| 境界変換設計         | `outputs/phase-2/boundary-conversion-design.md` | Phase 2 成果物 |
| IPC整合設計          | `outputs/phase-2/ipc-contract-alignment.md`     | Phase 2 成果物 |
| テスト設計マトリクス | `outputs/phase-2/test-matrix.md`                | Phase 2 成果物 |
| 実装ログ             | `outputs/phase-5/implementation-log.md`         | Phase 5 成果物 |
| 変更ファイル表       | `outputs/phase-5/change-file-matrix.md`         | Phase 5 成果物 |
| Greenログ            | `outputs/phase-5/green-test-log.txt`            | Phase 5 成果物 |
| 型適用マップ         | `outputs/phase-5/type-application-map.md`       | Phase 5 成果物 |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`            | Phase 7 成果物 |
| 未網羅一覧           | `outputs/phase-7/uncovered-items.md`            | Phase 7 成果物 |
| 要件追跡表           | `outputs/phase-7/requirements-traceability.md`  | Phase 7 成果物 |
| リファクタログ       | `outputs/phase-8/refactoring-log.md`            | Phase 8 成果物 |
| 回帰確認             | `outputs/phase-8/regression-check.md`           | Phase 8 成果物 |
| 技術負債更新         | `outputs/phase-8/technical-debt-update.md`      | Phase 8 成果物 |
| 品質レポート         | `outputs/phase-9/quality-report.md`             | Phase 9 成果物 |
| セキュリティ監査     | `outputs/phase-9/security-audit.md`             | Phase 9 成果物 |
| テスト監査           | `outputs/phase-9/test-audit.md`                 | Phase 9 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容       |
| -------------------------- | --------------------------------------------------------------------------------- | ---------- |
| task-workflow-rules        | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`        | ゲート規則 |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 判定基準   |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 契約確認   |

## 実行手順

1. SubAgent-A/B/C がレビューを並列実行する（並列）。
2. Lead が指摘を統合し判定を作成する（直列）。
3. 戻り先がある場合は対象Phaseを指定する（直列）。

## 統合テスト連携

| 観点             | 連携内容                 |
| ---------------- | ------------------------ |
| 要件整合         | Phase 1 との一致確認     |
| 品質整合         | Phase 9 判定との一致確認 |
| ドキュメント準備 | Phase 12 入力条件確認    |

## 多角的チェック観点（AIが判断）

| 観点               | 適用内容                                                         |
| ------------------ | ---------------------------------------------------------------- |
| セキュリティ       | `security-skill-ipc` と `security-api-electron` の要件整合を確認 |
| アーキテクチャ     | `architecture-implementation-patterns` の S14/P44/P45 適用を確認 |
| API/IPC契約        | `api-ipc-agent` と `interfaces-agent-sdk-skill` の契約整合を確認 |
| エラーハンドリング | `error-handling` の Validation Error 契約を確認                  |
| テスタビリティ     | `quality-requirements` の TDD/カバレッジ基準を確認               |

## 成果物

| 成果物           | パス                                        | 説明         |
| ---------------- | ------------------------------------------- | ------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`   | 判定結果     |
| 指摘一覧         | `outputs/phase-10/final-review-findings.md` | 指摘項目     |
| 是正計画         | `outputs/phase-10/remediation-plan.md`      | 戻り先と対応 |

## 完了条件

- [ ] 最終レビュー判定が記録されている
- [ ] 指摘項目が分類されている
- [ ] 戻り先が必要な項目に対象Phaseが付与されている
- [ ] Phase 11 実施条件が明確である
- [ ] 本Phase内の全タスクを100%実行完了

## レビューゲート

### 判定基準

| 判定     | 条件               | 次アクション                 |
| -------- | ------------------ | ---------------------------- |
| PASS     | 阻害項目なし       | Phase 11 へ進行              |
| MINOR    | 軽微な差分のみ     | 差分記録後に Phase 11 へ進行 |
| MAJOR    | 仕様整合の欠陥あり | Phase 5 へ戻る               |
| CRITICAL | 要件矛盾あり       | Phase 1 へ戻る               |

### 戻り先

| 問題種別   | 戻り先  |
| ---------- | ------- |
| 実装欠陥   | Phase 5 |
| テスト欠陥 | Phase 6 |
| 要件矛盾   | Phase 1 |

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: Phase 9
- **後続**: Phase 11

## サブタスク管理

- [ ] SubAgent-A/B/C レビュー
- [ ] Lead 判定
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合
- [ ] 次Phaseへの引き継ぎ事項を記録

## 次のPhase

Phase 11: [phase-11-manual-test.md](phase-11-manual-test.md)
