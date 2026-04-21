# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 12                                              |
| タスクID   | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 |
| タスク種別 | implementation / NON_VISUAL                     |
| 前提Phase  | Phase 11                                        |
| 後続Phase  | Phase 13                                        |
| 作成日     | 2026-04-21                                      |

## 目的

`task-specification-creator` の Phase 12 必須6成果物に揃え、正本仕様・workflow 台帳・lane / artifacts・未タスク・feedback を same-wave で閉じる。

## 実行タスク

1. Task 1: `implementation-guide.md` を 2 パート構成で作成する
2. Task 2: `system-spec-update-summary.md` に Step 1-A〜1-C と条件付き Step 2 を記録する
3. Task 3: `documentation-changelog.md` を作成する
4. Task 4: `unassigned-task-detection.md` を 0件でも出力する
5. Task 5: `skill-feedback-report.md` を出力する
6. Task 6: `phase12-task-spec-compliance-check.md` を出力する

## 参照資料

| 資料               | パス                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| Phase 12 template  | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` |
| spec update source | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`         |
| final review       | `outputs/phase-10/final-review-result.md`                                        |
| manual test        | `outputs/phase-11/manual-test-result.md`                                         |

## 実行手順

### Task 1: implementation guide

- Part 1: 中学生レベルで「同じ意味のキー名が2種類あると壊れる」ことを説明する
- Part 2: 対象3組6フィールド、6スキル、更新順、検証コマンドを記録する
- `## 視覚証跡` に以下を必ず記載する

```md
## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`
```

### Task 2: system spec update summary

- Step 1-A: workflow 完了記録先、LOGS、topic-map / keywords、artifacts / lane の same-wave sync 先を列挙する
- Step 1-B: 実装状況テーブルと関連タスクテーブルの更新方針を記録する
- Step 1-C: 関連タスクと未タスク候補の更新有無を記録する
- Step 2: 本タスクは consumer contract を変更するため `evals-schema-spec.md` への同期を必須とする

### Task 3-6

- changelog、未タスク、feedback、compliance を順に出力する
- `artifacts.json` / `outputs/artifacts.json` と成果物名を照合する

## 統合テスト連携

| 判定項目         | 基準                | 結果 |
| ---------------- | ------------------- | ---- |
| 必須6成果物      | 全件定義済み        | TBD  |
| artifacts parity | root / outputs 一致 | TBD  |

## 多角的チェック観点（AIが判断）

- ダブル・ループ思考: close-out だけでなく再発防止ルールまで記録する
- 価値提案思考: silent break 防止に寄与する同期だけを残す

## サブタスク管理

1. implementation guide
2. system spec update summary
3. changelog / unassigned / feedback / compliance

## 成果物

| 成果物               | パス                                                     | 説明               |
| -------------------- | -------------------------------------------------------- | ------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2    |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2    |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | 変更ファイルと根拠 |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも必須        |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも必須 |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須6成果物の集約  |

## 完了条件

- [ ] 必須6成果物を全て定義した
- [ ] Step 1-A〜1-D と Step 2 の境界を明記した
- [ ] `artifacts.json` / `outputs/artifacts.json` 整合を確認した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを完了
- [ ] 成果物6件を定義
- [ ] 4条件を確認

## 次Phase

Phase 13: PR作成
