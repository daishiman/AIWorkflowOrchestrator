# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 3                                                |
| タスクID   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク種別 | NON_VISUAL / docs-only                           |
| ステータス | completed                                        |
| 前提Phase  | Phase 2（設計）                                  |
| 後続Phase  | Phase 4（テスト作成）                            |
| 作成日     | 2026-04-21                                       |

## 目的

Phase 2 の設計が AC-1〜AC-5、断定なし方針、dual root 運用、後続タスク境界の四点で破綻していないかを確認し、Phase 4 へ進めるだけの設計品質を確定する。

## 実行タスク

### タスク1: AC カバレッジレビュー

- `outputs/phase-2/schema-addition-design.md` と `outputs/phase-2/field-definition-draft.md` を読み、AC-1〜AC-5 の対応を表で確認する
- `levels.{N}`、`average_satisfaction`、v1/v2 関係、dual root parity がそれぞれ設計に現れているかを点検する

### タスク2: 断定なし方針レビュー

- v1 / v2 の関係が「正しい方を決める」書き方になっていないかを確認する
- `docs/30-workflows/completed-tasks/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` の方針と矛盾しないかを確認する

### タスク3: 根拠レビュー

- Phase 1 の実 EVALS 調査結果に根拠が結び付いているかを確認する
- 値域、writer、reader、optionality が推測のまま残っていれば MINOR 以上とする

### タスク4: 後続タスク境界レビュー

- dialect 統一や validator 実装の設計が紛れ込んでいないかを確認する
- 本 task は定義追加までで閉じ、移行や統一は後続 task に残す

### タスク5: 総合 gate 判定

- `design-review-result.md` に観点別レビューを書く
- `gate-decision.md` に PASS / MINOR / MAJOR と次アクションを書く

## 参照資料

| 資料名              | パス                                                                                                   | 用途                 |
| ------------------- | ------------------------------------------------------------------------------------------------------ | -------------------- |
| Phase 2 設計書      | `outputs/phase-2/schema-addition-design.md`                                                            | 主レビュー対象       |
| Phase 2 下書き      | `outputs/phase-2/field-definition-draft.md`                                                            | 主レビュー対象       |
| EVALS スキーマ正本  | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`                               | 既存仕様との整合確認 |
| scope architecture  | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` | 断定なし方針の確認   |
| schema change guide | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`    | parity 観点の参照    |
| 後続 task           | `docs/30-workflows/unassigned-task/task-evals-schema-dialect-unification-001.md`                       | 境界確認             |

## 実行手順

1. Phase 2 成果物を読む
2. AC カバレッジ、断定なし方針、根拠、後続 task 境界の順でレビューする
3. `outputs/phase-3/design-review-result.md` に観点別結果を残す
4. `outputs/phase-3/gate-decision.md` に総合判定を残す
5. PASS または修正済み MINOR の場合のみ Phase 4 へ進む

## 統合テスト連携

- 実ファイル変更は行わない
- `evals-schema-spec.md` の既存内容と設計案を突き合わせ、Phase 5 で diff が閉じる設計かを確認する
- dual root parity は Phase 5 実施前提で設計に含まれているかだけをここで確認する

## 多角的チェック観点

- **批判的思考**: 設計の前提が実 EVALS.json に支えられているか
- **MECE**: AC-1〜AC-5 と review 観点が重複なく対応しているか
- **システム思考**: workflow、正本仕様、mirror sync の依存が閉じているか
- **逆説思考**: この task が「やらないこと」が明確か
- **論点思考**: validator 実装や dialect 統一へ論点が逸れていないか

## サブタスク管理

| サブタスクID | 内容               | ステータス |
| ------------ | ------------------ | ---------- |
| ST-3-01      | AC カバレッジ確認  | pending    |
| ST-3-02      | 断定なし方針確認   | pending    |
| ST-3-03      | 根拠確認           | pending    |
| ST-3-04      | 後続 task 境界確認 | pending    |
| ST-3-05      | gate 判定作成      | pending    |

## 成果物

- `outputs/phase-3/design-review-result.md`
- `outputs/phase-3/gate-decision.md`

## 完了条件

- [ ] AC-1〜AC-5 の対応有無が記録されている
- [ ] 断定なし方針への違反有無が記録されている
- [ ] 根拠不足がある場合は MINOR 以上で記録されている
- [ ] 後続 task 侵食の有無が記録されている
- [ ] `design-review-result.md` と `gate-decision.md` の両方が定義されている

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 観点別レビュー結果を全て記録
- [ ] gate 判定と次アクションを明記

## 次Phase

PASS または修正済み MINOR の場合は Phase 4（テスト作成）へ進む。
