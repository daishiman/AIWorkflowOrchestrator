# Phase 12: ドキュメント更新

## メタ情報

| 項目    | 値                                          |
| ------- | ------------------------------------------- |
| PhaseID | 12                                          |
| Task ID | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE |
| 前Phase | 11                                          |
| 次Phase | 13                                          |
| 作成日  | 2026-04-19                                  |

## 目的

- 実装内容を将来の開発者が理解できる形で記録する
- システム仕様との整合性を確認する
- 未解決課題を検出してフォローアップを担保する
- フィードバックを記録してスキル改善に活かす

## Phase 12 記録分離方針

Phase 12 の各成果物は `outputs/phase-12/` 配下に個別ファイルとして作成する。1 つのファイルに複数の記録を混在させない。各ファイルは独立して参照できる粒度に保つ。

- `outputs/phase-12/implementation-guide.md` / `outputs/phase-12/system-spec-update-summary.md` / `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` / `outputs/phase-12/phase12-task-spec-compliance-check.md` を canonical 6 成果物として扱う
- `artifacts.json` と `outputs/artifacts.json` の status / artifact 名は同一値に保つ
- NON_VISUAL タスクでは `implementation-guide.md` の `## 視覚証跡` と `system-spec-update-summary.md` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を固定文言として記載する

## 実行タスク

### T-12-1: implementation-guide.md 作成

`outputs/phase-12/implementation-guide.md` を作成し、以下を記載する。

- 実装概要（何を変更したか・なぜ変更したか）
- 変更ファイル一覧（パス・変更内容の概要）
- アーキテクチャ上の注意点（`SkillCreatorService.ts` の switch/if 分岐構造等）
- 今後の拡張時に留意すべき点
- `## Part 1` は中学生レベルで「なぜ必要か」を先に説明し、日常の例え話を含める
- `## Part 2` は TypeScript 型、API / CLI シグネチャ、使用例、エラーハンドリング、エッジケース、設定値を含める
- `## 視覚証跡` には `UI/UX変更なしのため Phase 11 スクリーンショット不要` と、代替証跡として `outputs/phase-11/test-result-final.txt` / `manual-test-checklist.md` / `manual-test-result.md` を明記する

### T-12-2: system-spec-update-summary.md 作成

`outputs/phase-12/system-spec-update-summary.md` を作成し、以下を確認・記載する。

- `aiworkflow-requirements` への Step 1-A〜1-C / Step 2 の要否判断
- 今回の変更が内部ロジック修正であり、公開 API / IPC / 型契約変更の有無
- 変更不要の場合は N/A 理由を明記し、更新が必要な場合は同 wave 更新対象ファイルを列挙する
- Phase 11 参照欄に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を固定文言として記載する

### T-12-3: documentation-changelog.md 作成

`outputs/phase-12/documentation-changelog.md` を作成し、以下を記載する。

- 更新した仕様書・ドキュメントの一覧
- 各ドキュメントの変更前後の概要
- 変更日と変更者（タスク ID で代替可）
- `artifacts.json` / `outputs/artifacts.json` / `index.md` / `phase-*.md` の同期結果
- `spec-update-workflow` に沿った Step 1-A〜1-C / Step 2 の結果

### T-12-4: unassigned-task-detection.md 作成

`outputs/phase-12/unassigned-task-detection.md` を作成し、以下を確認・記載する。

- 実装中に発見した未解決課題・技術的負債の一覧
- 各課題に対する推奨対応方針
- 未解決課題がない場合は「検出なし」と明記
- 未タスクが 0 件でも 0 件判定根拠と監査範囲を記録する

### T-12-5: skill-feedback-report.md 作成

`outputs/phase-12/skill-feedback-report.md` を作成し、以下を記載する。

- タスク遂行中に気づいた改善点・問題点
- `task-specification-creator` スキルへのフィードバック
- 次回同種タスクでの推奨アプローチ

### T-12-6: phase12-task-spec-compliance-check.md 作成

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、以下を確認・記載する。

- Phase 1〜11 の各タスクが仕様書通りに完了しているかのチェックリスト
- `artifacts.json` / `outputs/artifacts.json` / `index.md` / `phase-*.md` の parity
- 仕様からの逸脱がある場合はその内容と理由を記載
- 全フェーズ完了が確認できた場合は「準拠確認済み」と明記

### T-12-7: workflow root / ledger 同期確認

- `artifacts.json` と `outputs/artifacts.json` の Phase 11 / 12 artifact 名と status を突合する
- `index.md` と `phase-*.md` のステータス記述に矛盾がないことを確認する
- Phase 13 はユーザー承認待ちであり、commit / push / PR 作成を実施しないことを明記する

## 参照資料

| 資料名                        | パス                                                                                    | 用途                                       |
| ----------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 12 Documentation Guide  | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | canonical 6 成果物と NON_VISUAL ルール確認 |
| Spec Update Workflow          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1-A〜1-C / Step 2 の判断基準          |
| aiworkflow-requirements SKILL | `.claude/skills/aiworkflow-requirements/SKILL.md`                                       | system spec 更新要否の判定                 |
| Phase 11 仕様書               | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-11-manual-test.md` | NON_VISUAL 証跡の引き継ぎ                  |

## 成果物テーブル

| 成果物                   | パス                                                     | 必須 |
| ------------------------ | -------------------------------------------------------- | ---- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | 必須 |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | 必須 |
| ドキュメント変更履歴     | `outputs/phase-12/documentation-changelog.md`            | 必須 |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`          | 必須 |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 必須 |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須 |

## 完了条件

- [ ] T-12-1: `implementation-guide.md` が作成されている
- [ ] T-12-2: `system-spec-update-summary.md` が作成されている（変更有無を明記）
- [ ] T-12-3: `documentation-changelog.md` が作成されている
- [ ] T-12-4: `unassigned-task-detection.md` が作成されている（検出なしも明記）
- [ ] T-12-5: `skill-feedback-report.md` が作成されている
- [ ] T-12-6: `phase12-task-spec-compliance-check.md` が作成されている
- [ ] T-12-7: `artifacts.json` と `outputs/artifacts.json` の parity が確認されている
