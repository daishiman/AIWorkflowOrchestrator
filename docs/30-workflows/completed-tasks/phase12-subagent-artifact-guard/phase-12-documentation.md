# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 12                                         |
| 機能名     | phase12-subagent-artifact-guard            |
| タスク名   | Phase 12 SubAgent成果物固定ガード          |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| 前提Phase  | Phase 11                                   |
| 後続Phase  | Phase 13                                   |
| 作成日     | 2026-03-03                                 |
| ステータス | completed                                  |

## 目的

実装ガイド作成（Part 1: 中学生レベル概念説明 / Part 2: 技術者レベル詳細）とシステム仕様同期を実施し、Phase 12 SubAgent成果物固定ガードの運用知見を文書化する。

## 背景

Phase 12 の仕様同期で「SubAgent責務」と「検証証跡」を成果物として標準固定する改善を文書化し、後続タスクで同種課題の再確認を短時間で再現可能にする。

## SubAgent分担

| SubAgent | 担当                                         |
| -------- | -------------------------------------------- |
| A        | Task 1 実装ガイド作成                        |
| B1       | Task 2 `task-workflow.md` 同期               |
| B2       | Task 2 `lessons-learned.md` 同期             |
| B3       | Task 2 `resource-map/topic-map` 抽出・再生成 |
| C        | Task 3-5 changelog・未タスク・フィードバック |
| D        | LOGS.md×2 / SKILL.md×2 同期                  |

## 実行タスク

- Task 12-1 実装ガイド作成: Part 1 と Part 2 の要件を満たしたガイドを作成する
- Task 12-2 システム仕様書更新: Step 0-2 の順で仕様抽出と同期を完了する
- Task 12-3 changelog作成: 全Step結果を欠落なく記録する
- Task 12-4 未タスク検出: 0件時もレポートを必ず出力する
- Task 12-5 スキルフィードバック: 改善点なしでも結果を出力する

### Task 1: 実装ガイド作成（2パート構成）

#### Part 1: 中学生レベル概念説明

日常例えを使い、なぜ SubAgent 責務固定が必要かを説明する。

- [x] 「班長と報告書」の例え: クラスの班活動で、班長が全員バラバラの形式で報告書を書いたら、先生が確認するのに時間がかかる。全員が同じテンプレートで書けば、確認が楽になる
- [x] 「三点確認」の例え: テストの答え合わせで、自分の答案・模範解答・先生のチェック表の3つを見比べて正しいか確認する
- [x] 「currentViolations=0」の例え: 宿題の未提出リストで「0件」になったら合格
- [x] 概念図（テンプレート → 記入 → 検証 → 合格の流れ）

#### Part 2: 技術者レベル詳細

- [x] テンプレート構造: `spec-update-summary.md` のフィールド定義、必須/任意の区分
- [x] SubAgent責務表: `spec-sync-subagent-report.md` の 1仕様書=1SubAgent ルール
- [x] 三点突合アルゴリズム: phase-12-documentation.md × documentation-changelog.md × spec-update-summary.md の照合手順
- [x] 監査スクリプト使用方法:
  ```bash
  node verify-unassigned-links.js
  node audit-unassigned-tasks.js --json --target-file <path>
  node audit-unassigned-tasks.js --json --diff-from HEAD
  ```
- [x] currentViolations 判定基準: `currentViolations=0` を合否基準として運用する方法
- [x] テンプレートフィールド一覧表

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 0: aiworkflow-requirements 仕様抽出（Progressive Disclosure）

- [x] `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` で参照対象カテゴリを特定
- [x] `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` で対象セクションと行を特定
- [x] `node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "task-workflow" -C 2` を実行
- [x] `node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "lessons-learned" -C 2` を実行
- [x] `node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "quality-requirements" -C 2` を実行
- [x] `node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "currentViolations" -C 2` を実行
- [x] 抽出結果を `outputs/phase-12/spec-target-extraction.md` に記録（必須/条件付き/対象外、更新理由、SubAgent割当）
- [x] 対象外（破棄）判定した仕様書は、除外理由を必ず記録する（「不要」だけで終えない）

#### Step 1-A: タスク完了記録

- [x] `task-workflow.md` に本タスク（UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001）の完了記録を追加
- [x] `aiworkflow-requirements/LOGS.md` 更新
- [x] `task-specification-creator/LOGS.md` 更新（**2ファイル両方** — P1/P25対策）
- [x] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [x] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル更新（該当する場合）

- [x] テンプレート追加に関する実装状況テーブルがあれば更新

#### Step 1-C: 関連タスクテーブル更新

- [x] `grep -rn "UT-IMP-PHASE12" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索
- [x] 検出された仕様書の関連タスクテーブルを更新

#### Step 1-D: topic-map.md 再生成

- [x] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して `topic-map.md` を再生成（P2/P27対策）
- [x] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard --regenerate` を実行して task-spec 側索引も再生成

#### Step 2: システム仕様更新（今回タスクは対象外）

- [x] 仕様更新要否を判定し、今回タスクは **対象外（N/A）** と記録した
- [x] 判定根拠を `outputs/phase-12/spec-update-summary.md` / `documentation-changelog.md` に記載した（運用テンプレート改善のみで、arch/api/interfaces/security 契約変更なし）

> **注意**: LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする（P43対策）

### Task 3: documentation-changelog.md 作成

- [x] 更新した全仕様書の変更内容を記録
- [x] 各 Step（1-A / 1-B / 1-C / Step 2）の完了結果を個別に記録
- [x] **全 Step 確認前に「完了」と記載しない**（P4パターン防止）
- [x] Step 1-D の topic-map.md 再生成結果を記録

### Task 4: 未タスク検出レポート作成（0件でも必須）

- [x] Phase 10 MINOR指摘の未タスク化を確認
- [x] 検出した未タスクは3ステップ全完了（P3対策）:
  1. `unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [x] `unassigned-task-detection.md` 作成（0件でも必須）
- [x] `artifacts.json` の Phase 12 ステータスを更新

### Task 5: スキルフィードバックレポート作成（改善点なしでも必須 — P28対策）

- [x] テンプレート改善の観点: テンプレートの使いやすさ、フィールド不足
- [x] ワークフロー改善の観点: Phase 12 実行手順の改善点
- [x] ドキュメント改善の観点: 仕様書間の整合性維持方法
- [x] `skill-feedback-report.md` 作成

## 参照資料

| 資料名                  | パス                                                                           | 用途                       |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| Phase 1 要件定義書      | `outputs/phase-1/requirements-definition.md`                                   | 要件の正本                 |
| Phase 2 設計書          | `outputs/phase-2/architecture-design.md`                                       | 設計の正本                 |
| Phase 5 実装サマリー    | `outputs/phase-5/implementation-summary.md`                                    | 実装内容の参照             |
| Phase 6 カバレッジ      | `outputs/phase-6/coverage-report.md`                                           | テスト拡充結果             |
| Phase 7 カバレッジ検証  | `outputs/phase-7/coverage-report.md`                                           | カバレッジ判定結果         |
| Phase 8 リファクタ記録  | `outputs/phase-8/refactoring-log.md`                                           | リファクタリング内容       |
| Phase 9 品質レポート    | `outputs/phase-9/quality-report.md`                                            | 品質検証結果               |
| Phase 10 レビュー結果   | `outputs/phase-10/final-review-result.md`                                      | 最終レビュー判定           |
| Phase 11 手動テスト     | `outputs/phase-11/manual-test-result.md`                                       | 手動検証結果               |
| spec-update-workflow    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 仕様更新手順の正本         |
| phase-11-12-guide       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | Phase 11-12 実行ガイド     |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | タスク完了記録・残課題管理 |
| lessons-learned         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 教訓記録                   |
| resource-map            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               | 抽出対象仕様の決定         |
| topic-map               | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  | 参照セクション位置の特定   |
| search-spec.js          | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`                | 抽出根拠の機械取得         |
| LOGS.md (requirements)  | `.claude/skills/aiworkflow-requirements/LOGS.md`                               | タスクログ記録             |
| LOGS.md (creator)       | `.claude/skills/task-specification-creator/LOGS.md`                            | タスクログ記録             |
| SKILL.md (requirements) | `.claude/skills/aiworkflow-requirements/SKILL.md`                              | 変更履歴                   |
| SKILL.md (creator)      | `.claude/skills/task-specification-creator/SKILL.md`                           | 変更履歴                   |

## 実行手順

1. Task 1: 実装ガイドを Part 1（中学生レベル）→ Part 2（技術者レベル）の順で作成する
2. Task 2: Step 0 → 1-A → 1-B → 1-C → 1-D → Step 2 の順でシステム仕様書を更新する
3. Task 3: 全 Step の結果を documentation-changelog.md に記録する（全Step完了後に「完了」記載）
4. Task 4: 未タスク検出レポートを作成する（0件でも必須）
5. Task 5: スキルフィードバックレポートを作成する（改善点なしでも必須）

## 統合テスト連携

- 実装ガイドの内容が Phase 11 の手動テスト結果と整合することを確認する
- documentation-changelog.md が全 Step の結果を網羅していることを確認する

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                                     | 参照仕様                 |
| ------------------ | -------------------------------------------- | ------------------------ |
| ドキュメント完全性 | 全5タスクの成果物が作成されているか          | phase-11-12-guide.md     |
| 仕様同期整合性     | LOGS.md×2、SKILL.md×2 が全て更新されているか | spec-update-workflow.md  |
| P1-P4 防止         | 既知の落とし穴パターンが全て回避されているか | 06-known-pitfalls.md     |
| P43 防止           | SubAgent分割が3ファイル以下/Agentであるか    | 06-known-pitfalls.md#P43 |
| 後方互換性         | 既存ワークフローに破壊的影響がないか         | completed-tasks/         |

## 成果物

| 成果物                       | パス                                            | 内容                            |
| ---------------------------- | ----------------------------------------------- | ------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | Part 1 + Part 2                 |
| 仕様抽出結果                 | `outputs/phase-12/spec-target-extraction.md`    | aiworkflow要件の抽出根拠        |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`       | 仕様書更新の全体サマリー        |
| ドキュメント変更ログ         | `outputs/phase-12/documentation-changelog.md`   | 全Step結果の詳細記録            |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | 未タスク検出結果（0件でも作成） |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | スキル改善検討結果              |

## 完了条件

- [x] Task 1: 実装ガイド Part 1（中学生レベル）と Part 2（技術者レベル）が作成されている
- [x] Task 2: Step 0/1-A/1-B/1-C/1-D/Step 2 の全ステップが完了している
- [x] Task 2: LOGS.md が2ファイル両方更新されている（P1/P25対策）
- [x] Task 2: topic-map.md が再生成されている（P2/P27対策）
- [x] Task 2: `spec-target-extraction.md` に更新対象と更新不要対象の判定根拠が記録されている
- [x] Task 2: `spec-target-extraction.md` に対象外（破棄）判定の理由が記録されている
- [x] Task 3: documentation-changelog.md に全Stepの結果が記録されている
- [x] Task 3: 全Step完了前に「完了」と記載していない（P4対策）
- [x] Task 4: unassigned-task-detection.md が作成されている（0件でも必須）
- [x] Task 5: skill-feedback-report.md が作成されている（改善点なしでも必須）
- [x] artifacts.json の Phase 12 ステータスが更新されている

## サブタスク管理

| サブタスク                          | 担当        | ステータス | 備考                             |
| ----------------------------------- | ----------- | ---------- | -------------------------------- |
| 実装ガイド Part 1 作成              | SubAgent A  | completed  | 中学生レベル概念説明             |
| 実装ガイド Part 2 作成              | SubAgent A  | completed  | 技術者レベル詳細                 |
| Step 0 仕様抽出（resource-map起点） | SubAgent B3 | completed  | `spec-target-extraction.md` 作成 |
| Step 1-A `task-workflow` 同期       | SubAgent B1 | completed  | 完了台帳更新                     |
| Step 1-A `lessons-learned` 同期     | SubAgent B2 | completed  | 教訓同期                         |
| Step 1-A LOGS/SKILL 同期            | SubAgent D  | completed  | LOGS.md×2、SKILL.md×2            |
| Step 1-B/1-C 実装状況・関連更新     | SubAgent B1 | completed  | SubAgent B2 と相互確認           |
| Step 1-D topic-map再生成            | SubAgent B3 | completed  | aiworkflow + task-spec 両方      |
| Step 2 システム仕様更新             | SubAgent B1 | completed  | 対象外（N/A）判定と根拠記録      |
| documentation-changelog作成         | SubAgent C  | completed  | P4防止: 全Step完了後に記載       |
| 未タスク検出レポート作成            | SubAgent C  | completed  | 0件でも必須                      |
| スキルフィードバック作成            | SubAgent C  | completed  | 改善点なしでも必須（P28対策）    |

## タスク100%実行確認

- [x] 全5タスクの実行が完了している
- [x] 全成果物が所定のパスに配置されている
- [x] 完了条件が全て満たされている
- [x] P1/P2/P3/P4/P25/P27/P28/P43 の全パターンが回避されている

## 次のPhase

Phase 13（PR作成）に進む。
