# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 11                                         |
| 機能名     | phase12-subagent-artifact-guard            |
| タスク名   | Phase 12 SubAgent成果物固定ガード          |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| 前提Phase  | Phase 10                                   |
| 後続Phase  | Phase 12                                   |
| 作成日     | 2026-03-03                                 |
| ステータス | completed                                  |

## 目的

テンプレートと運用手順のウォークスルー検証を実施し、Phase 12 の成果物標準化（SubAgent責務表・三点突合・監査スクリプト）が実運用で機能することを確認する。

## 背景

Phase 12 の仕様同期において、SubAgent責務の記録や検証証跡の標準化が不十分なため、同種課題の再確認に時間がかかる問題がある。本 Phase では、新テンプレートとスクリプトが既存ワークフローに対して正しく適用・記入・検証できることを手動で確認する。

## SubAgent分担

| SubAgent | 担当                                   |
| -------- | -------------------------------------- |
| A        | テンプレートウォークスルー検証         |
| B        | 三点突合・監査スクリプト実行検証       |
| C        | SubAgent責務表記入・メタ情報整合性検証 |

## 実行タスク

- Task 11-1 テンプレートウォークスルー: 既存完了ワークフローでテンプレート記入性を検証する
- Task 11-2 三点突合手動検証: Phase 12成果物3点の整合を手動で検証する
- Task 11-3 SubAgent責務表記入テスト: 1仕様書=1SubAgent の記録形式を検証する
- Task 11-4 監査スクリプト実行テスト: 監査コマンドの実行結果と判定可能性を検証する
- Task 11-5 メタ情報重複チェック: 未タスク仕様書のメタ情報一意性を検証する

### Task 1: テンプレートウォークスルー

既存の完了済みワークフロー（例: `docs/30-workflows/completed-tasks/getfiletree-ipc/`）を使って新テンプレートを適用し、実際に記入できるか検証する。

- [x] `spec-update-summary.md` テンプレートに既存ワークフローの情報を記入
- [x] テンプレート準拠構造（セクション順序・必須フィールド）が再利用可能であることを確認
- [x] 記入に曖昧さや不足がないか検証

### Task 2: 三点突合手動検証

実際の Phase 12 成果物3点で突合手順を実行する。

- [x] `phase-12-documentation.md` の Task 2 手順と `documentation-changelog.md` の記録内容を照合
- [x] `spec-update-summary.md` の更新対象リストと実際の変更ファイルを照合
- [x] 3点間で矛盾がないことを確認（Step 2 判定の説明可能性を検証）

### Task 3: SubAgent責務表の記入テスト

`spec-sync-subagent-report.md` に既存ワークフローのSubAgent情報を記入して、形式が適切か検証する。

- [x] 1仕様書=1SubAgent の責務・依存・完了条件を記入
- [x] 記入内容が実際のSubAgent動作と一致することを確認
- [x] 記入形式の過不足を検出

### Task 4: 監査スクリプト実行テスト

以下のスクリプトを実行し、正常に動作することを検証する。

```bash
# 未タスクリンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 未タスク監査（対象ファイル指定）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md

# 未タスク監査（差分ベース）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

- [x] 各スクリプトがエラーなく完了すること
- [x] `currentViolations=0` が合否基準として判定可能であること
- [x] JSON出力形式が後続処理で利用可能であること
- [x] `resource-map.md` / `topic-map.md` / `search-spec.js` で抽出した仕様書リストと、Task 2更新候補の一致を確認すること

### Task 5: メタ情報重複チェック

```bash
rg -n '^## メタ情報$' docs/30-workflows/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md
```

- [x] メタ情報セクションが1つだけであること
- [x] 重複がある場合は修正箇所を記録

## 参照資料

| 資料名                   | パス                                                                           | 用途                         |
| ------------------------ | ------------------------------------------------------------------------------ | ---------------------------- |
| Phase 1 仕様             | `phase-1-requirements.md`                                                      | 依存入力（要件定義）         |
| Phase 2 仕様             | `phase-2-design.md`                                                            | 依存入力（設計）             |
| Phase 3 仕様             | `phase-3-design-review.md`                                                     | 依存入力（設計レビュー）     |
| Phase 4 仕様             | `phase-4-test-creation.md`                                                     | 依存入力（テスト作成）       |
| Phase 5 仕様             | `phase-5-implementation.md`                                                    | 依存入力（実装）             |
| Phase 6 仕様             | `phase-6-test-expansion.md`                                                    | 依存入力（テスト拡充）       |
| Phase 7 仕様             | `phase-7-coverage-check.md`                                                    | 依存入力（カバレッジ確認）   |
| Phase 8 仕様             | `phase-8-refactoring.md`                                                       | 依存入力（リファクタリング） |
| Phase 9 仕様             | `phase-9-quality-assurance.md`                                                 | 依存入力（品質保証）         |
| Phase 10 仕様            | `phase-10-final-review.md`                                                     | 依存入力（最終レビュー）     |
| 既存完了済みワークフロー | `docs/30-workflows/completed-tasks/getfiletree-ipc/`                           | テンプレート適用検証対象     |
| spec-update-workflow     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 仕様更新手順の正本           |
| phase-11-12-guide        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | Phase 11-12 実行ガイド       |
| resource-map             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               | 仕様抽出の起点               |
| topic-map                | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  | 対象セクション特定           |
| search-spec.js           | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`                | 抽出結果の機械検証           |

## 実行手順

1. Task 1: 既存ワークフローを使ってテンプレートウォークスルーを実施する
2. Task 2: Phase 12 成果物3点の三点突合を手動実行する
3. Task 3: SubAgent責務表に既存ワークフロー情報を記入する
4. Task 4: 監査スクリプト3種を実行し、出力を確認する
5. Task 5: メタ情報重複チェックを実行する
6. 全結果を `manual-test-result.md` と `walkthrough-log.md` に記録する

## 統合テスト連携

- テンプレート記入 → 監査スクリプト実行 → currentViolations判定のエンドツーエンド手動検証を実施する
- テンプレートの記入内容が監査スクリプトで正しく検証されることを確認する

## 多角的チェック観点（AIが判断）

| 観点             | 確認内容                                                 | 参照仕様                         |
| ---------------- | -------------------------------------------------------- | -------------------------------- |
| テンプレート品質 | フィールド網羅性、記入容易性、再利用性                   | spec-update-workflow.md          |
| 運用手順整合性   | 三点突合が説明可能な結果を生成するか                     | phase-11-12-guide.md             |
| スクリプト信頼性 | 監査スクリプトが正確にviolation検出するか                | verify-unassigned-links.js       |
| 後方互換性       | 既存ワークフローに新テンプレートが破壊的影響を与えないか | completed-tasks/getfiletree-ipc/ |

## 成果物

| 成果物             | パス                                     | 内容                       |
| ------------------ | ---------------------------------------- | -------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | 全タスクの検証結果         |
| ウォークスルーログ | `outputs/phase-11/walkthrough-log.md`    | テンプレート適用の詳細記録 |

## 完了条件

- [x] Task 1: テンプレートウォークスルーが完了し、記入可能性を確認
- [x] Task 2: 三点突合手動検証で矛盾なしを確認
- [x] Task 3: SubAgent責務表の記入形式が適切であることを確認
- [x] Task 4: 監査スクリプト3種が正常実行し、currentViolations=0 を確認
- [x] Task 5: メタ情報重複がないことを確認
- [x] 全結果が成果物に記録されている

## サブタスク管理

| サブタスク                 | 担当       | ステータス | 備考 |
| -------------------------- | ---------- | ---------- | ---- |
| テンプレートウォークスルー | SubAgent A | completed  |      |
| 三点突合手動検証           | SubAgent B | completed  |      |
| SubAgent責務表記入テスト   | SubAgent C | completed  |      |
| 監査スクリプト実行テスト   | SubAgent B | completed  |      |
| メタ情報重複チェック       | SubAgent C | completed  |      |

## タスク100%実行確認

- [x] 全タスクの実行が完了している
- [x] 全成果物が所定のパスに配置されている
- [x] 完了条件が全て満たされている

## 次のPhase

Phase 12（ドキュメント更新）に進む。
