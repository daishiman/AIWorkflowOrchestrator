# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 7                                                                      |
| Phase名    | テストカバレッジ確認                                                   |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | Phase 6                                                                |
| 後続Phase  | Phase 8                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

対象コードのカバレッジを確認し、不足領域を明示して Phase 8 のリファクタ作業へ接続する。

## 背景

Branded Type 関連コードは型レベルで見える一方、実行経路の分岐確認が不足しやすい。分岐観点を数値で管理する。

## 実行タスク

- SubAgent-A（集計）: line/branch/function カバレッジを計測する
- SubAgent-B（不足分析）: 未網羅ケースを分類する
- SubAgent-C（追跡）: 要件とテストの対応表を更新する
- Lead（判定）: 閾値達成可否を判定する

## 参照資料

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| 依存Phase 5        | `phase-5-implementation.md`                                                  | 対象実装       |
| 依存Phase 6        | `phase-6-test-expansion.md`                                                  | 追加テスト     |
| coverage standards | `.claude/skills/task-specification-creator/references/coverage-standards.md` | 目標値         |
| 拡張テスト結果     | `outputs/phase-6/test-expansion-result.md`                                   | Phase 6 成果物 |
| 回帰ケース表       | `outputs/phase-6/regression-case-table.md`                                   | Phase 6 成果物 |
| 失敗分析           | `outputs/phase-6/failure-analysis.md`                                        | Phase 6 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                          | 内容           |
| ---------------------- | ----------------------------------------------------------------------------- | -------------- |
| quality-requirements   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | カバレッジ基準 |
| development-guidelines | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | テスト運用     |

## 実行手順

1. SubAgent-A/B/C が集計・不足分析・追跡表更新を並列実行する（並列）。
2. Lead が閾値判定を実施する（直列）。
3. 未達項目を Phase 8 の入力として確定する（直列）。

## 統合テスト連携

| 観点     | 連携内容                    |
| -------- | --------------------------- |
| 数値検証 | line/branch/function を収集 |
| 要件追跡 | 要件とテストの対応を確認    |
| 未達処理 | 未達項目を次Phaseへ移管     |

## 多角的チェック観点（AIが判断）

| 観点               | 適用内容                                                         |
| ------------------ | ---------------------------------------------------------------- |
| セキュリティ       | `security-skill-ipc` と `security-api-electron` の要件整合を確認 |
| アーキテクチャ     | `architecture-implementation-patterns` の S14/P44/P45 適用を確認 |
| API/IPC契約        | `api-ipc-agent` と `interfaces-agent-sdk-skill` の契約整合を確認 |
| エラーハンドリング | `error-handling` の Validation Error 契約を確認                  |
| テスタビリティ     | `quality-requirements` の TDD/カバレッジ基準を確認               |

## 成果物

| 成果物             | パス                                           | 説明           |
| ------------------ | ---------------------------------------------- | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`           | 集計結果       |
| 未網羅一覧         | `outputs/phase-7/uncovered-items.md`           | 不足ケース     |
| 要件追跡表         | `outputs/phase-7/requirements-traceability.md` | 要件テスト対応 |

## 完了条件

- [ ] カバレッジ集計が記録されている
- [ ] 未網羅項目が分類されている
- [ ] 要件追跡表が更新されている
- [ ] Phase 8 に渡す不足項目が確定している
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: Phase 6
- **後続**: Phase 8

## サブタスク管理

- [ ] SubAgent-A/B/C 実施
- [ ] Lead 判定
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合
- [ ] 次Phaseへの引き継ぎ事項を記録

## 次のPhase

Phase 8: [phase-8-refactoring.md](phase-8-refactoring.md)
