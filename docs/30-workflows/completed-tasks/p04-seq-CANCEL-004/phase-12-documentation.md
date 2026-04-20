# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 12                                 |
| タスクID   | TASK-SW-CANCEL-004                 |
| 機能名     | skill-creator-cancel-renderer-hook |
| 前提Phase  | Phase 11                           |
| 後続Phase  | Phase 13                           |
| 作成日     | 2026-04-20                         |
| ステータス | completed                          |

## 目的

Phase 12 の canonical 6成果物を作成し、workflow-local と global sync を同一視せずに same-wave で記録する。`phase12-task-spec-compliance-check.md` を root evidence とする。

## 実行タスク

### Task 12-1: 実装ガイド作成

- Part 1: 中学生レベルの説明
- Part 2: 技術者レベルの説明
- NON_VISUAL 固定文言: `UI/UX変更なしのため Phase 11 スクリーンショット不要`

### Task 12-2: システム仕様更新サマリー

#### Step 1-A

- workflow-local 完了記録
- LOGS / topic-map / ledger の更新有無を記録

#### Step 1-B

- 実装状況テーブルや task status の更新有無を記録

#### Step 1-C

- 関連 task テーブルや chain 参照更新有無を記録

#### Step 2

- public contract や system spec 変更が必要かを判定する
- 変更不要なら N/A と理由を明記する

### Task 12-3: ドキュメント更新履歴

- workflow-local と global sync を別ブロックで記録する
- 未完了を示す曖昧語を残さない

### Task 12-4: 未タスク検出

- 0件でも出力する

### Task 12-5: スキルフィードバック

- 改善点なしでも出力する

### Task 12-6: Phase 12 準拠チェック

- 6成果物の existence
- Step 1-A〜1-C / Step 2 記録
- `artifacts.json` / `outputs/artifacts.json` parity
- identifier drift なし

## 参照資料

| 資料                 | パス                                                                           | 用途                      |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| skill 基準           | `.agents/skills/task-specification-creator/SKILL.md`                           | Phase 12 canonical ルール |
| spec update workflow | `.agents/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1 / Step 2           |
| 正本仕様 skill       | `.agents/skills/aiworkflow-requirements/SKILL.md`                              | same-wave sync            |
| artifacts            | `artifacts.json`, `outputs/artifacts.json`                                     | parity                    |

## 成果物

| 成果物                       | パス                                                     | 説明                        |
| ---------------------------- | -------------------------------------------------------- | --------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2             |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C / Step 2      |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | local/global を分離して記録 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも必須                 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも必須          |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence               |

## 完了条件

- [ ] 6成果物を全て定義した
- [ ] Step 1-A〜1-C / Step 2 を明文化した
- [ ] NON_VISUAL 固定文言を入れた
- [ ] `phase12-task-spec-compliance-check.md` を root evidence とした
- [ ] `artifacts.json` / `outputs/artifacts.json` parity を確認した
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 13: PR作成
