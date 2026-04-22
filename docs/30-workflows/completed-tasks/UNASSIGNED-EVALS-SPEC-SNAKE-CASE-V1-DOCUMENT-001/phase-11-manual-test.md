# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 11                                               |
| タスクID   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク種別 | NON_VISUAL / docs-only                           |
| ステータス | completed                                        |
| 前提Phase  | Phase 10                                         |
| 後続Phase  | Phase 12                                         |
| 作成日     | 2026-04-21                                       |

## 目的

NON_VISUAL task として screenshot を使わず、`manual-test-result.md` を一次ソースにして walkthrough の結果を集約する。

## 実行タスク

### タスク1: checklist 作成

- `outputs/phase-11/manual-test-checklist.md` を作成する
- `levels`、`average_satisfaction`、非保持スキル、v1/v2 関係、parity を確認項目に入れる

### タスク2: manual-test-result 集約

- `outputs/phase-11/manual-test-result.md` を作成する
- `テスト件数サマリー`、`edge case 一覧表`、`仕様判断根拠`、`実行記録` の 4 セクションを入れる
- 実行記録は `コマンド / 前提条件 / 期待結果 / 実結果` の 4 項目で書く
- `## テスト方式` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を入れる

### タスク3: 発見事項整理

- `outputs/phase-11/discovered-issues.md` を作成する
- current issue と baseline backlog を分ける
- 0件なら 0件と明記する

## 参照資料

| 資料名         | パス                                                                     | 用途             |
| -------------- | ------------------------------------------------------------------------ | ---------------- |
| Phase 9 結果   | `outputs/phase-9/quality-gate-report.md`                                 | 事前確認         |
| Phase 10 結果  | `outputs/phase-10/final-review-result.md`                                | 事前確認         |
| canonical 正本 | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` | walkthrough 対象 |

## 実行手順

1. checklist を作成する
2. walkthrough を実施する
3. `manual-test-result.md` に一次ソースを集約する
4. `discovered-issues.md` に current / baseline を分けて書く

## 統合テスト連携

- screenshot は不要
- docs-only task のため、文書内容と evidence chain を確認対象とする

## 多角的チェック観点

- **素人思考**: 初見読者が理解できるか
- **システム思考**: spec と workflow evidence がつながっているか
- **改善思考**: 発見事項が次 task に渡せる粒度か

## サブタスク管理

| サブタスクID | 内容                    | ステータス |
| ------------ | ----------------------- | ---------- |
| ST-11-01     | checklist 作成          | pending    |
| ST-11-02     | manual-test-result 集約 | pending    |
| ST-11-03     | discovered-issues 作成  | pending    |

## 成果物

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`

## 完了条件

- [ ] checklist を定義している
- [ ] `manual-test-result.md` を一次ソースとして定義している
- [ ] `discovered-issues.md` を定義している
- [ ] screenshot 不要の固定文言を明記している

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 4 セクション集約を `manual-test-result.md` に定義
- [ ] current / baseline を混同していない

## 次Phase

Phase 12（ドキュメント更新）へ進む。
