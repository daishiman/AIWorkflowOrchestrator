# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 3                                                                      |
| Phase名    | 設計レビューゲート                                                     |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | Phase 2                                                                |
| 後続Phase  | Phase 4                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

Phase 2 設計をレビューし、実装前に型契約ドリフトとテスト抜けを解消する。

## 背景

Branded Type の導入は shared 型定義だけで完結せず、Renderer と IPC の境界設計が不完全だと再発が残る。レビューゲートで戻り先を明示する。

## 実行タスク

- SubAgent-A（設計監査）: 型設計書の矛盾点を抽出する
- SubAgent-B（契約監査）: IPC 契約と境界変換設計の矛盾点を抽出する
- SubAgent-C（テスト監査）: テストマトリクスと受け入れ基準の抜けを抽出する
- Lead（ゲート判定）: PASS/MINOR/MAJOR/CRITICAL を判定し戻り先を確定する

## 参照資料

| 参照資料             | パス                                                                           | 内容           |
| -------------------- | ------------------------------------------------------------------------------ | -------------- |
| 依存Phase 1          | `phase-1-requirements.md`                                                      | 要件確認       |
| 依存Phase 2          | `phase-2-design.md`                                                            | 設計確認       |
| review gate criteria | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定ルール     |
| 要件定義             | `outputs/phase-1/requirements-definition.md`                                   | Phase 1 成果物 |
| スコープ定義         | `outputs/phase-1/scope-definition.md`                                          | Phase 1 成果物 |
| 変換境界定義         | `outputs/phase-1/boundary-definition.md`                                       | Phase 1 成果物 |
| SubAgent責務表       | `outputs/phase-1/subagent-team-plan.md`                                        | Phase 1 成果物 |
| 型設計書             | `outputs/phase-2/branded-type-design.md`                                       | Phase 2 成果物 |
| 境界変換設計         | `outputs/phase-2/boundary-conversion-design.md`                                | Phase 2 成果物 |
| IPC整合設計          | `outputs/phase-2/ipc-contract-alignment.md`                                    | Phase 2 成果物 |
| テスト設計マトリクス | `outputs/phase-2/test-matrix.md`                                               | Phase 2 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容             |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | UI契約整合確認   |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S14/P44/P45 照合 |
| task-workflow-rules                  | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 品質ゲート基準   |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テスト品質基準   |

## 実行手順

1. SubAgent-A/B/C が監査を並列実行し、指摘を分類する（並列）。
2. Lead が指摘を集約し優先度を付与する（直列）。
3. ゲート判定を確定し、MAJOR 以上は戻り先を指定する（直列）。

## 統合テスト連携

| 観点        | 連携内容                                |
| ----------- | --------------------------------------- |
| 設計→テスト | 設計要件が test matrix に存在するか確認 |
| 仕様→契約   | aiworkflow 正本との不一致有無を確認     |
| 境界変換    | id/name 変換地点が単一か確認            |

## 多角的チェック観点（AIが判断）

| 観点               | 適用内容                                                         |
| ------------------ | ---------------------------------------------------------------- |
| セキュリティ       | `security-skill-ipc` と `security-api-electron` の要件整合を確認 |
| アーキテクチャ     | `architecture-implementation-patterns` の S14/P44/P45 適用を確認 |
| API/IPC契約        | `api-ipc-agent` と `interfaces-agent-sdk-skill` の契約整合を確認 |
| エラーハンドリング | `error-handling` の Validation Error 契約を確認                  |
| テスタビリティ     | `quality-requirements` の TDD/カバレッジ基準を確認               |

## 成果物

| 成果物           | パス                                      | 説明             |
| ---------------- | ----------------------------------------- | ---------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果         |
| 指摘一覧         | `outputs/phase-3/review-findings.md`      | 指摘内容         |
| 是正計画         | `outputs/phase-3/remediation-plan.md`     | 戻り先と修正計画 |

## 完了条件

- [ ] 設計レビュー判定が記録されている
- [ ] MINOR 以上の指摘に対応計画がある
- [ ] MAJOR/CRITICAL の戻り先が明記されている
- [ ] Phase 4 開始条件が明確である
- [ ] 本Phase内の全タスクを100%実行完了

## レビューゲート

### 判定基準

| 判定     | 条件                   | 次アクション                      |
| -------- | ---------------------- | --------------------------------- |
| PASS     | 重大指摘なし           | Phase 4 へ進行                    |
| MINOR    | 軽微指摘のみ           | 指摘を残課題化して Phase 4 へ進行 |
| MAJOR    | 実装不能の設計欠陥あり | Phase 2 へ戻る                    |
| CRITICAL | 要件と矛盾する欠陥あり | Phase 1 へ戻る                    |

### 戻り先

| 問題種別       | 戻り先  |
| -------------- | ------- |
| 要件矛盾       | Phase 1 |
| 設計不足       | Phase 2 |
| テスト設計不足 | Phase 2 |

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: Phase 2
- **後続**: Phase 4

## サブタスク管理

- [ ] SubAgent-A/B/C 監査
- [ ] Lead 判定
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合
- [ ] 次Phaseへの引き継ぎ事項を記録

## 次のPhase

Phase 4: [phase-4-test-creation.md](phase-4-test-creation.md)
