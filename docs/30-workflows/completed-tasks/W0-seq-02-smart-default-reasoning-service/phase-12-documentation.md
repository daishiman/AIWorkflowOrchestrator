# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 12                                             |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 11                                       |
| 後続Phase  | Phase 13                                       |
| 作成日     | 2026-04-08                                     |
| ステータス | completed                                      |

## 目的

task-specification-creator / aiworkflow-requirements の正本に照らして、Phase 12 canonical 6成果物を揃え、ドキュメントとシステム仕様を最新状態に維持する。

## Phase 12 記録分離方針

- `実行タスク` は plan、`Phase実行記録` と `outputs/phase-12/*.md` は current fact として扱う
- `phase12-task-spec-compliance-check.md` は Task / Step / validator / artifacts.json / current-baseline の同値性を集約する root evidence として必ず作成する
- docs-only / spec_created workflow では Step 1-B の status を `spec_created` とし、`completed` へ置き換えない
- 仕様更新の有無は `documentation-changelog.md` と `system-spec-update-summary.md` で同じ結論にする

## 実行タスク

1. Task 12-1: 実装ガイド作成
2. Task 12-2: システム仕様更新
3. Task 12-3: ドキュメント更新履歴作成
4. Task 12-4: 未タスク検出
5. Task 12-5: スキルフィードバック作成
6. Task 12-6: phase12-task-spec-compliance-check 作成

| Task      | 内容                                           | 主成果物                                                 |
| --------- | ---------------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成（Part 1 + Part 2）              | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システム仕様更新（Step 1-A〜1-G / Step 2）     | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成                       | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出（0件でも出力必須）                | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバック（改善点なしでも出力必須） | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | phase12-task-spec-compliance-check             | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## Task 12-1: 実装ガイドの2パート構成

### Part 1（中学生レベル）の必須要件

- 日常生活での例え話を必ず含める
- 例え話の本文中に `たとえば` を最低1回含める
- 専門用語を使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

### Part 2（技術者レベル）の必須要件

- インターフェース/型定義（TypeScript）を含める
- APIシグネチャと使用例を記載
- エラーハンドリングとエッジケースを説明
- 設定可能なパラメータと定数を一覧化

## Task 12-2: システム仕様更新

| Step          | 内容                                                                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1-A      | タスク完了記録（`task-workflow.md` / `task-workflow-backlog.md` / `task-workflow-completed.md` の完了記録 + 関連ドキュメントリンク + 変更履歴 + LOGS.md×2 + topic-map.md） |
| Step 1-B      | 実装状況テーブル更新（`spec_created` または `completed` を明示し、台帳と同値にする）                                                                                       |
| Step 1-C      | 関連タスクテーブル更新（仕様書内の関連タスク・未タスク候補テーブルのステータス更新）                                                                                       |
| Step 1-D〜1-G | 条件に応じて実施（index 再生成 / 未タスク監査 / ledger parity / validator 再実行）。不要なら N/A 理由を明記                                                                |
| Step 2        | 条件付き: 新規インターフェース追加時のみシステム仕様を更新する                                                                                                             |

## 検証ゲート

| ゲート         | 判定条件                                      | 主コマンド                                                                                                                                                               |
| -------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 実装ガイド検証 | Part 1 / Part 2 がテンプレート要件を満たす    | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/W0-seq-02-smart-default-reasoning-service` |
| 参照整合       | unassigned link が 0 件                       | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md`          |
| mirror parity  | `.claude` 正本と `.agents` mirror の差分 0 件 | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                           |

## 統合テスト連携

- Phase 11 の manual-test-result / discovered-issues を同一 wave で参照する。
- Phase 13 は user 承認前提の blocked 状態を維持し、PR 作成は実施しない。
- `artifacts.json` と `outputs/artifacts.json` の title / type / status / phase artifact 名 parity を最初に確認する。

## 参照資料

| 資料名               | パス                                                                           | 用途                 |
| -------------------- | ------------------------------------------------------------------------------ | -------------------- |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                       | Phase 11 成果物      |
| 発見事項             | `outputs/phase-11/discovered-issues.md`                                        | Phase 11 成果物      |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                      | Phase 10 成果物      |
| spec-update-workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-A〜1-G ガイド |

## 実行手順

1. `outputs/artifacts.json` と各 `phase-*.md` のartifact名を1対1で突合する。
2. Task 12-1: 実装ガイド（Part 1 + Part 2）を作成する。
3. Task 12-2: システム仕様更新（Step 1-A〜1-G、条件に応じて Step 2）を実施する。
4. Task 12-3: ドキュメント更新履歴を作成する。
5. Task 12-4: 未タスク検出を実施する（0件でも出力する）。
6. Task 12-5: スキルフィードバックレポートを作成する（改善点なしでも出力する）。
7. Task 12-6: phase12-task-spec-compliance-check を作成する。
8. 検証ゲートを実行する。

## 成果物

| 成果物                       | パス                                                     | 説明                               |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生）+ Part 2（技術者） |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-G / Step 2 の結果      |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 全変更の記録                       |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク候補一覧（0件でも出力）    |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善提案（改善点なしでも出力）     |
| Phase12 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence                      |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件（6件）作成
- [ ] `implementation-guide.md` が Part 1/2 を満たしていること
- [ ] `system-spec-update-summary.md` に Step 1-A〜1-G / Step 2 の結果が記録されていること
- [ ] `documentation-changelog.md` が全 Step（1-A/1-B/1-C/1-D〜1-G/Step 2）の結果を個別に明記していること
- [ ] `unassigned-task-detection.md` が作成されていること（0件でも出力必須）
- [ ] `skill-feedback-report.md` が作成されていること（改善点なしでも出力必須）
- [ ] `phase12-task-spec-compliance-check.md` が root evidence として作成されていること
- [ ] LOGS.md が2ファイル（aiworkflow-requirements / task-specification-creator）更新されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 13: PR作成
