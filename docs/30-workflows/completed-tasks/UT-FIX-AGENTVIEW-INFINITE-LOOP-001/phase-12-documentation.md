# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 12                                 |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 作成日   | 2026-02-12                         |

## 目的

実装内容を仕様へ反映し、実装ガイドと未タスク検出を完了させる。

## 実行タスク

- 実装ガイド作成: Part 1/Part 2の2部構成で出力する
- 仕様更新記録: Step 1-A〜1-Dを完了する
- 更新履歴作成: documentation-changelogを出力する
- 未タスク検出: 0件でも検出レポートを出力する
- スキル改善記録: 改善点の有無を記録する

## 参照資料

| 資料名                   | パス                                                                         | 説明          |
| ------------------------ | ---------------------------------------------------------------------------- | ------------- |
| Phase 1 要件定義         | `phase-1-requirements.md`                                                    | 依存Phase     |
| Phase 2 設計             | `phase-2-design.md`                                                          | 依存Phase     |
| Phase 5 実装             | `phase-5-implementation.md`                                                  | 依存Phase     |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                                                  | 依存Phase     |
| Phase 7 カバレッジ確認   | `phase-7-coverage-check.md`                                                  | 依存Phase     |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                                     | 依存Phase     |
| Phase 9 品質保証         | `phase-9-quality-assurance.md`                                               | 依存Phase     |
| Phase 10 最終レビュー    | `phase-10-final-review.md`                                                   | 依存Phase     |
| Phase 11 手動テスト      | `phase-11-manual-test.md`                                                    | 依存Phase     |
| 仕様更新ワークフロー     | .claude/skills/task-specification-creator/references/spec-update-workflow.md | Step定義      |
| Phase 11/12 ガイド       | .claude/skills/task-specification-creator/references/phase-11-12-guide.md    | 完了条件      |
| Phase 12 ドキュメント    | phase-12-documentation.md                                                    | 本Phase成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容             |
| ------------------ | --------------------------------------------------------------------------------- | ---------------- |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | P31適用記録先    |
| Agent SDK Skill IF | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 完了タスク記録先 |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 関連タスク更新先 |
| パターン集         | `.claude/skills/aiworkflow-requirements/references/patterns.md`                   | 教訓反映先       |

## 実行手順

### Step 1: 実装ガイド作成

Part 1（中学生向け）と Part 2（技術者向け）を作成する。

### Step 2: システム仕様更新（Step 1-A〜1-D）

LOGS.md 2ファイル、SKILL.md 2ファイル、関連テーブル、topic-map再生成を実施する。

### Step 3: 変更履歴と未タスク

documentation-changelog と unassigned-task-detection を作成する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の確認（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json更新方針が明記されている
- [ ] Phase末端で完了を明記している

## 成果物

| 成果物         | パス                                            | 必須 | 説明          |
| -------------- | ----------------------------------------------- | ---- | ------------- |
| 実装ガイド     | `outputs/phase-12/implementation-guide.md`      | Y    | Part 1/Part 2 |
| 更新履歴       | `outputs/phase-12/documentation-changelog.md`   | Y    | 変更内容      |
| 未タスク検出   | `outputs/phase-12/unassigned-task-detection.md` | Y    | 0件でも作成   |
| スキル改善記録 | `outputs/phase-12/skill-feedback-report.md`     | Y    | 改善点の有無  |

## 完了条件

- [ ] Part 1（中学生向け）で日常の例え話が記載されている
- [ ] Part 2（技術者向け）で型/API/エッジケースが記載されている
- [ ] LOGS.md 2ファイル更新が完了している
- [ ] SKILL.md 2ファイル更新が完了している
- [ ] topic-map再生成が完了している
- [ ] documentation-changelogが出力されている
- [ ] unassigned-task-detectionが出力されている
- [ ] artifacts.json更新が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成（`phase-13-pr-creation.md`）
