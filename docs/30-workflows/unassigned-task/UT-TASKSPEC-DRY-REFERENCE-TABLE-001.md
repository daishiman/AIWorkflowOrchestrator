# UT-TASKSPEC-DRY-REFERENCE-TABLE-001: 参照テーブル DRY 原則強化

## メタ情報

| 項目         | 内容                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| タスクID     | UT-TASKSPEC-DRY-REFERENCE-TABLE-001                                                         |
| 発見元       | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 Phase 12 skill-feedback-report.md 改善提案2 |
| 発見日       | 2026-03-24                                                                                  |
| 優先度       | 低                                                                                          |
| 種別         | スキル改善                                                                                  |
| 対象スキル   | task-specification-creator                                                                  |
| 関連仕様書   | .claude/skills/task-specification-creator/SKILL.md, references/phase-templates.md           |
| GitHub Issue | #1551                                                                                       |

## 背景

各 Phase の参照資料テーブルに共通参照（親パック index、workflow 正本、audit 等）が
重複して記載されている。TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 では
最大19行の共通参照が13ファイルに重複し、合計247行の冗長が発生した。

この冗長は以下の問題を引き起こす:

- 共通参照の追加・変更時に13ファイルの同時更新が必要
- ファイルサイズの肥大化（Phase ファイルあたり約20行の増加）
- Progressive Disclosure 原則に反する（必要時以外の情報が常に表示される）

## 対応内容

1. テンプレート生成時に共通参照を `index.md#共通参照資料` セクションに集約する
2. 各 Phase には `[共通参照資料](./index.md#共通参照資料)` へのポインタのみ記載する
3. Phase 固有の参照のみ Phase ファイル内のテーブルに残す

## 受入基準

- [ ] テンプレート生成時に共通参照が index.md に自動集約されている
- [ ] 各 Phase ファイルの参照テーブルに共通参照の重複がない
- [ ] Phase 固有の参照は各 Phase ファイルに正しく記載されている
- [ ] 既存タスク仕様書のフォーマットとの後方互換性が維持されている

## 苦戦箇所・教訓

| ID         | 苦戦箇所                                                                                 | 将来の解決指針                                               |
| ---------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| L-FB-002   | 13ファイルの共通参照テーブルを手動で同期する保守コストが高く、更新漏れが発生しやすかった | 共通部分を index.md に集約し、DRY 原則で重複を排除する       |
| L-CBLG-002 | 設計タスクで「PRマージ後に仕様書更新」と先送りしそうになった（P57 再発リスク）           | 設計タスクでも Phase 12 完了時点でシステム仕様書を実更新する |

## 参照

- `docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/outputs/phase-12/skill-feedback-report.md` (改善提案2)
- `.claude/skills/task-specification-creator/references/phase-templates.md`
