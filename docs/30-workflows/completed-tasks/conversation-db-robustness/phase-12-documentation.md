# Phase 12: ドキュメント

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 12                                      |
| 機能名   | conversation-db-robustness              |
| 作成日   | 2026-03-18                              |
| タスクID | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 |
| 前Phase  | Phase 11（手動テスト）                  |
| 次Phase  | Phase 13（PR作成）                      |

## 目的

実装ガイド・システム仕様更新・未タスク検出・スキルフィードバックを完了する。

### タスク種別判定

本タスクは **fix（修正実装タスク）** である。docs-only ではないため、implementation-guide Part 2 は「実装詳細・コード例」形式で作成する。Step 1-B 実装状況は `completed` とする。

## 事前チェック【必須】

Phase 12 実行前に以下の Pitfall を確認すること:

| Pitfall | 内容                                         | 確認 |
| ------- | -------------------------------------------- | ---- |
| P1      | LOGS.md 2ファイル更新漏れ                    | [ ]  |
| P2      | topic-map.md 再生成忘れ                      | [ ]  |
| P3      | 未タスク管理の3ステップ不完全                | [ ]  |
| P4      | documentation-changelog への早期「完了」記載 | [ ]  |
| P25     | LOGS.md 2ファイル更新漏れ（再発）            | [ ]  |
| P26     | システム仕様書更新遅延                       | [ ]  |
| P27     | topic-map.md 再生成トリガー判断ミス          | [ ]  |
| P29     | SKILL.md 変更履歴更新漏れ                    | [ ]  |

## 必須タスク（5タスク）

### Task 1: 実装ガイド作成

- `outputs/phase-12/implementation-guide.md`
- Part 1: 中学生レベル概念説明（日常例え必須）
- Part 2: 技術詳細（TypeScript 型定義、API シグネチャ、使用例、エラーハンドリング、設定項目）

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（2ファイル両方）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル

- [ ] `database-implementation.md` の実装ステータス更新
- [ ] `architecture-implementation-patterns-core.md` の実装パターン更新

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-FIX-CONVERSATION-DB-ROBUSTNESS" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行

#### Step 2: システム仕様更新

- [ ] `database-implementation.md` に ConversationDatabaseManager パターンを追加
- [ ] `architecture-overview.md` に DB 初期化タイミングを記載

#### IPC 機能開発時の追加更新対象ファイル

| ファイル                        | 確認内容                                 |
| ------------------------------- | ---------------------------------------- |
| `api-ipc-system-core.md`        | DB初期化フローの旧パスハードコードを更新 |
| `security-electron-ipc-core.md` | Conversation IPC セキュリティ契約の更新  |
| `arch-ipc-persistence.md`       | Repository/Handler 構成の更新            |

### Task 3: ドキュメント更新履歴

- `outputs/phase-12/documentation-changelog.md`
- [ ] artifacts.json の全完了 Phase（1-12）のステータスが completed であること

### Task 4: 未タスク検出レポート

- `outputs/phase-12/unassigned-task-detection.md`（0件でも必須）
- [ ] 未タスク指示書は `docs/30-workflows/unassigned-task/` に配置（P38対策）

### Task 5: スキルフィードバックレポート

- `outputs/phase-12/skill-feedback-report.md`（改善点なしでも必須）

## 参照資料

### 前Phase成果物

| 成果物               | パス                                      |
| -------------------- | ----------------------------------------- |
| 設計サマリー         | `outputs/phase-2/design-summary.md`       |
| 実装計画             | `outputs/phase-5/implementation-plan.md`  |
| 回帰テスト計画       | `outputs/phase-6/regression-plan.md`      |
| カバレッジ計画       | `outputs/phase-7/coverage-plan.md`        |
| リファクタリング計画 | `outputs/phase-8/refactor-plan.md`        |
| QAチェックリスト     | `outputs/phase-9/qa-checklist.md`         |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md` |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`  |
| 発見課題             | `outputs/phase-11/discovered-issues.md`   |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容            |
| ----------------------- | ------------------------------------------------------------------------------ | --------------- |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB 実装パターン |
| architecture-overview   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | 全体責務境界    |

### 運用資料

| 参照資料                         | パス                                                                 | 内容                     |
| -------------------------------- | -------------------------------------------------------------------- | ------------------------ |
| task-workflow                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | backlog / completed 導線 |
| task-specification-creator/LOGS  | `.claude/skills/task-specification-creator/LOGS.md`                  | Phase 12 反映履歴        |
| task-specification-creator/SKILL | `.claude/skills/task-specification-creator/SKILL.md`                 | 運用ルールの正本         |

## 実行タスク

- タスク1: 実装ガイド作成（Part 1 概念説明 + Part 2 技術詳細）
- タスク2: システム仕様書更新（Step 1-A〜1-D, Step 2）
- タスク3: ドキュメント更新履歴作成
- タスク4: 未タスク検出レポート作成
- タスク5: スキルフィードバックレポート作成

## 統合テスト連携【必須】

該当なし（ドキュメントフェーズのため）。

## 成果物

| 成果物                   | パス                                             |
| ------------------------ | ------------------------------------------------ |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`       |
| 仕様更新サマリー         | `outputs/phase-12/spec-update-summary.md`        |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md` |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`    |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`  |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`      |

## 苦戦箇所の記録【推奨】

実装中に苦戦した箇所を記録し、未タスク化の3ステップ（P3準拠）を検討する:

1. `unassigned-task/` に指示書作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

## 漏れやすいポイント

| Pitfall | 対策                                                                             |
| ------- | -------------------------------------------------------------------------------- |
| P1/P25  | LOGS.md は aiworkflow-requirements と task-specification-creator の2ファイル更新 |
| P2/P27  | 仕様書変更時は必ず `node generate-index.js` で topic-map.md を再生成             |
| P29     | SKILL.md の変更履歴テーブルも更新                                                |
| P3/P38  | 未タスク指示書は `docs/30-workflows/unassigned-task/` に配置                     |

## 多角的チェック観点（AIが判断）

| 観点                                | チェック項目                                                                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| P1/P25（LOGS.md 2ファイル更新漏れ） | `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の両方が更新されていること                                            |
| P25（システム仕様書更新漏れ）       | `database-implementation.md`、`architecture-overview.md`、`architecture-implementation-patterns-core.md` 等の関連仕様書が全て更新されていること |
| P29（SKILL.md 変更履歴更新漏れ）    | `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の変更履歴テーブルが更新されていること                              |
| P2/P27（topic-map.md 再生成）       | `node generate-index.js` を実行して topic-map.md が再生成されていること                                                                         |
| P4（早期完了記載）                  | documentation-changelog.md に全 Step 完了前に「完了」と記載していないこと                                                                       |

## タスク100%実行確認【必須】

- [ ] タスク1: 実装ガイド作成（Part 1 概念説明 + Part 2 技術詳細）
- [ ] タスク2: システム仕様書更新（Step 1-A〜1-D, Step 2）
- [ ] タスク3: ドキュメント更新履歴作成
- [ ] タスク4: 未タスク検出レポート作成
- [ ] タスク5: スキルフィードバックレポート作成
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 完了条件

- [ ] Task 1〜5 の全成果物が生成されている
- [ ] LOGS.md が2ファイル両方更新されている
- [ ] SKILL.md が2ファイル両方更新されている
- [ ] topic-map.md が再生成されている
- [ ] 全 Step 確認前に「完了」と記載していない
- [ ] artifacts.json の全完了 Phase（1-12）のステータスが completed であること
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 次Phase

Phase 12 完了後、Phase 13（PR作成）に進む。ユーザーの明示承認が必要。
