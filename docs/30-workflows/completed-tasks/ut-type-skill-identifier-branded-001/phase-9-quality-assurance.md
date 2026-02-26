# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 9                                                                      |
| Phase名    | 品質保証                                                               |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | Phase 8                                                                |
| 後続Phase  | Phase 10                                                               |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

実装・テスト・リファクタ結果を品質観点で監査し、最終レビューへ渡す。

## 背景

型導入は可読性と保守性に影響する。品質保証で契約・可読性・回帰性を確認する。

## 実行タスク

- SubAgent-A（品質監査）: コード品質と型整合を監査する
- SubAgent-B（セキュリティ監査）: IPC 入力検証維持を監査する
- SubAgent-C（テスト監査）: テスト結果とカバレッジ結果を監査する
- Lead（統合判定）: Phase 10 へ渡す品質判定を作成する

## 参照資料

| 参照資料       | パス                                       | 内容           |
| -------------- | ------------------------------------------ | -------------- |
| 依存Phase 5    | `phase-5-implementation.md`                | 実装           |
| 依存Phase 7    | `phase-7-coverage-check.md`                | カバレッジ結果 |
| 依存Phase 8    | `phase-8-refactoring.md`                   | リファクタ結果 |
| 実装ログ       | `outputs/phase-5/implementation-log.md`    | Phase 5 成果物 |
| 変更ファイル表 | `outputs/phase-5/change-file-matrix.md`    | Phase 5 成果物 |
| Greenログ      | `outputs/phase-5/green-test-log.txt`       | Phase 5 成果物 |
| 型適用マップ   | `outputs/phase-5/type-application-map.md`  | Phase 5 成果物 |
| リファクタログ | `outputs/phase-8/refactoring-log.md`       | Phase 8 成果物 |
| 回帰確認       | `outputs/phase-8/regression-check.md`      | Phase 8 成果物 |
| 技術負債更新   | `outputs/phase-8/technical-debt-update.md` | Phase 8 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容             |
| -------------------- | --------------------------------------------------------------------------- | ---------------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準         |
| security-skill-ipc   | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`   | セキュリティ監査 |
| error-handling       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラー仕様整合   |

## 実行手順

1. SubAgent-A/B/C が監査を並列実行する（並列）。
2. Lead が監査結果を統合し判定を作成する（直列）。
3. Phase 10 のレビュー入力を固定する（直列）。

## 統合テスト連携

| 観点     | 連携内容                         |
| -------- | -------------------------------- |
| 品質統合 | 型・実行・セキュリティ観点を統合 |
| 再現性   | テスト結果再現の確認             |
| 監査証跡 | 監査結果を文書化                 |

## 多角的チェック観点（AIが判断）

| 観点               | 適用内容                                                         |
| ------------------ | ---------------------------------------------------------------- |
| セキュリティ       | `security-skill-ipc` と `security-api-electron` の要件整合を確認 |
| アーキテクチャ     | `architecture-implementation-patterns` の S14/P44/P45 適用を確認 |
| API/IPC契約        | `api-ipc-agent` と `interfaces-agent-sdk-skill` の契約整合を確認 |
| エラーハンドリング | `error-handling` の Validation Error 契約を確認                  |
| テスタビリティ     | `quality-requirements` の TDD/カバレッジ基準を確認               |

## 成果物

| 成果物           | パス                                | 説明           |
| ---------------- | ----------------------------------- | -------------- |
| 品質レポート     | `outputs/phase-9/quality-report.md` | 品質判定       |
| セキュリティ監査 | `outputs/phase-9/security-audit.md` | IPC監査結果    |
| テスト監査       | `outputs/phase-9/test-audit.md`     | テスト監査結果 |

## 完了条件

- [ ] 品質監査結果が文書化されている
- [ ] IPC 検証維持が確認されている
- [ ] テスト監査結果が記録されている
- [ ] Phase 10 入力が確定している
- [ ] 本Phase内の全タスクを100%実行完了

## 品質ゲート

### チェックリスト

- [ ] 型チェックが成功している
- [ ] テストが成功している
- [ ] 主要分岐のカバレッジが確認済み
- [ ] IPC入力検証仕様が維持されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: Phase 8
- **後続**: Phase 10

## サブタスク管理

- [ ] SubAgent-A/B/C 監査
- [ ] Lead 統合判定
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合
- [ ] 次Phaseへの引き継ぎ事項を記録

## 次のPhase

Phase 10: [phase-10-final-review.md](phase-10-final-review.md)
