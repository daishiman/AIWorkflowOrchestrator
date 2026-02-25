# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 3                                                                      |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 2                                                                |
| 後続Phase  | Phase 4                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |

## 目的

Phase 2 の設計に矛盾や欠落がないことをゲート判定し、実装着手可否を決定する。

## 背景

Phase 2の設計に対して、要件との整合性・CLI契約の後方互換性・分類ロジックの正確性をレビューし、実装着手の可否を判定する。設計上の欠陥を実装前に発見することで手戻りを防ぐ。

## 実行タスク

- SubAgent-A（設計監査）: CLI契約、分類ロジック、互換性要件をレビューする。
- SubAgent-B（テスト観点監査）: 設計が Phase 4 テストへ展開可能か確認する。
- Lead（ゲート判定）: PASS / MINOR / MAJOR / CRITICAL を判定し次アクションを決定する。

## 参照資料

| 参照資料          | パス                                                                           | 内容           |
| ----------------- | ------------------------------------------------------------------------------ | -------------- |
| Phase 1           | `phase-1-requirements.md`                                                      | 要件定義の照合 |
| Phase 2           | `phase-2-design.md`                                                            | 設計本体       |
| Phase 2設計成果物 | `outputs/phase-2/scope-control-design.md`                                      | 判定対象       |
| Phase 2契約成果物 | `outputs/phase-2/cli-contract.md`                                              | 判定対象       |
| レビュー基準      | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準       |
| 品質要件          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 非機能観点     |
| 要件定義          | `outputs/phase-1/requirements-definition.md`                                   | Phase 1 成果物 |
| 受入基準          | `outputs/phase-1/acceptance-criteria.md`                                       | Phase 1 成果物 |
| SubAgent責務分担  | `outputs/phase-1/subagent-responsibilities.md`                                 | Phase 1 成果物 |
| 仕様参照抽出      | `outputs/phase-1/aiworkflow-spec-extraction.md`                                | Phase 1 成果物 |
| テストマッピング  | `outputs/phase-2/design-test-mapping.md`                                       | Phase 2 成果物 |
| リスク分析        | `outputs/phase-2/risk-analysis.md`                                             | Phase 2 成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料             | パス                                                                           | 内容                                |
| -------------------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | レビュー判定基準と品質ゲート要件    |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 過去のレビュー教訓と再発防止        |
| review-gate-criteria | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS/MINOR/MAJOR/CRITICALの判定基準 |

## 実行手順

1. 仕様の曖昧性、抜け漏れ、矛盾をレビュー観点ごとに確認する。
2. 各指摘に対して影響範囲と戻り先Phaseを判定する。
3. レビュー判定を確定し、Phase 4 の開始可否を決める。

## 統合テスト連携

| 観点       | 連携内容                                     |
| ---------- | -------------------------------------------- |
| 判定再現性 | 同一条件で同一レビュー判定になること         |
| 仕様整合性 | 受入基準・設計・実装の判定根拠が一致すること |
| 監査可能性 | 指摘と戻り先が記録され、追跡可能であること   |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                              | 仕様参照先                                                                                                                        |
| ------------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 入力検証設計の妥当性を確認            | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 後方互換性と設計構造の妥当性を確認    | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（CLIスクリプト内部改修のため） | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 異常系設計の網羅性を確認              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | Phase 4テストに展開可能な粒度かを確認 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物       | パス                                      | 説明                 |
| ------------ | ----------------------------------------- | -------------------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | ゲート判定結果       |
| 指摘一覧     | `outputs/phase-3/review-findings.md`      | 指摘詳細と戻り先     |
| 是正計画     | `outputs/phase-3/remediation-plan.md`     | MINOR/MAJOR 対応計画 |

## 完了条件

- [ ] PASS/MINOR/MAJOR/CRITICAL の判定が記録されている
- [ ] 指摘ごとに戻り先Phaseが特定されている
- [ ] Phase 4 への開始条件が文章で固定されている
- [ ] 本Phase内の全タスクを100%実行完了

## レビューゲート（Phase 3, 10 の場合）

### レビュー結果判定

| 判定     | 条件                       | 次アクション                  |
| -------- | -------------------------- | ----------------------------- |
| PASS     | 重大な欠陥なし             | Phase 4 へ進む                |
| MINOR    | 軽微な改善のみ             | 改善計画を残し Phase 4 へ進む |
| MAJOR    | 実装誤りに直結する欠陥あり | Phase 2 へ戻る                |
| CRITICAL | 要件再定義が必要           | Phase 1 へ戻る                |

### 戻り先決定基準

| 問題の種類     | 戻り先  |
| -------------- | ------- |
| 要件定義の欠落 | Phase 1 |
| 設計整合の欠落 | Phase 2 |
| 実装不整合     | Phase 5 |
| 品質・構造問題 | Phase 8 |

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 2
- **後続**: Phase 4

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 3` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 4: テスト作成（phase-4-test-creation.md）
