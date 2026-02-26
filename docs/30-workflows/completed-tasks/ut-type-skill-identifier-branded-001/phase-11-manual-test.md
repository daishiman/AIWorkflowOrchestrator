# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 11                                                                     |
| Phase名    | 手動テスト検証                                                         |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | Phase 10                                                               |
| 後続Phase  | Phase 12                                                               |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

UI 操作で `skill.id` と `skill.name` の取り違えが発生しないことを手動で検証する。

## 背景

コンパイル成功だけでは実運用フローの保証が不足する。実 UI 操作で import 成否とエラーパターンを確認する。

## 実行タスク

- SubAgent-A（UIフロー検証）: SkillImportDialog の選択から import 実行までを検証する
- SubAgent-B（境界検証）: AgentView の引数経路を検証する
- SubAgent-C（異常系検証）: 空文字や不正値時の表示を検証する
- Lead（統合判定）: 手動テスト結果を統合し Phase 12 入力を確定する

## 参照資料

| 参照資料         | パス                                        | 内容            |
| ---------------- | ------------------------------------------- | --------------- |
| 依存Phase 1      | `phase-1-requirements.md`                   | 検証基準        |
| 依存Phase 2      | `phase-2-design.md`                         | 境界設計        |
| 依存Phase 5      | `phase-5-implementation.md`                 | 実装結果        |
| 依存Phase 6      | `phase-6-test-expansion.md`                 | 回帰観点        |
| 依存Phase 7      | `phase-7-coverage-check.md`                 | 未網羅観点      |
| 依存Phase 8      | `phase-8-refactoring.md`                    | 変更点          |
| 依存Phase 9      | `phase-9-quality-assurance.md`              | 品質監査        |
| 依存Phase 10     | `phase-10-final-review.md`                  | 最終判定        |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`   | Phase 10 成果物 |
| 指摘一覧         | `outputs/phase-10/final-review-findings.md` | Phase 10 成果物 |
| 是正計画         | `outputs/phase-10/remediation-plan.md`      | Phase 10 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容         |
| -------------------------- | --------------------------------------------------------------------------------- | ------------ |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | UI動作契約   |
| ui-ux-agent-execution      | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`      | 画面動作基準 |
| error-handling             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 異常系表示   |

## 実行手順

1. SubAgent-A/B/C が手動シナリオを並列実行する（並列）。
2. Lead が結果を統合し判定する（直列）。
3. Phase 12 へ渡す発見事項を分類する（直列）。

## 統合テスト連携

| 観点     | 連携内容                       |
| -------- | ------------------------------ |
| UI実操作 | import 操作の実行結果確認      |
| 引数伝播 | UI->IPC 経路で name が渡る確認 |
| 異常系   | バリデーション失敗時表示確認   |

## 多角的チェック観点（AIが判断）

| 観点               | 適用内容                                                         |
| ------------------ | ---------------------------------------------------------------- |
| セキュリティ       | `security-skill-ipc` と `security-api-electron` の要件整合を確認 |
| アーキテクチャ     | `architecture-implementation-patterns` の S14/P44/P45 適用を確認 |
| API/IPC契約        | `api-ipc-agent` と `interfaces-agent-sdk-skill` の契約整合を確認 |
| エラーハンドリング | `error-handling` の Validation Error 契約を確認                  |
| テスタビリティ     | `quality-requirements` の TDD/カバレッジ基準を確認               |

## 成果物

| 成果物         | パス                                     | 説明         |
| -------------- | ---------------------------------------- | ------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 実施結果     |
| 発見事項       | `outputs/phase-11/manual-findings.md`    | 発見課題     |
| エビデンス一覧 | `outputs/phase-11/evidence-index.md`     | 画面証跡一覧 |

## 完了条件

- [ ] 主要手動シナリオの実施結果が記録されている
- [ ] 引数伝播確認が記録されている
- [ ] 異常系シナリオ結果が記録されている
- [ ] Phase 12 に渡す発見事項が分類されている
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: Phase 10
- **後続**: Phase 12

## サブタスク管理

- [ ] SubAgent-A/B/C 手動検証
- [ ] Lead 統合判定
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合
- [ ] 次Phaseへの引き継ぎ事項を記録

## 次のPhase

Phase 12: [phase-12-documentation.md](phase-12-documentation.md)
