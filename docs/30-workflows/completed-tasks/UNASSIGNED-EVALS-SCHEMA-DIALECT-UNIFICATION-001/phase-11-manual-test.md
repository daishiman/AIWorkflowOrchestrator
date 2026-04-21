# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 11                                              |
| タスクID   | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 |
| タスク種別 | NON_VISUAL                                      |
| 前提Phase  | Phase 10                                        |
| 後続Phase  | Phase 12                                        |
| 作成日     | 2026-04-21                                      |

## 目的

NON_VISUAL task として close-out 証跡を3点セットで残し、対象限定 grep / diff / fixture test の再実行結果を human-readable にまとめる。

## 実行タスク

1. `manual-test-checklist.md` に確認観点を整理する
2. `manual-test-result.md` に再実行結果と判断根拠を記録する
3. `discovered-issues.md` に blocker / note / info を記録する

## 参照資料

| 資料              | パス                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| Phase 11 template | `.claude/skills/task-specification-creator/references/phase-template-phase11.md` |
| final review      | `outputs/phase-10/final-review-result.md`                                        |

## 実行手順

### テスト方式

UI/UX変更なしのため Phase 11 スクリーンショット不要

### primary evidence

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`

### 確認観点

- 対象限定の旧方言残存 grep の再実行
- `.claude` / `.agents` parity diff
- `apps/desktop` fixture / test 結果の確認
- 依存ゲートと close-out 記録の整合

## 統合テスト連携

| 判定項目            | 基準                        | 結果 |
| ------------------- | --------------------------- | ---- |
| NON_VISUAL evidence | 3点セット揃う               | TBD  |
| replayability       | grep / diff / test 結果あり | TBD  |

## 多角的チェック観点（AIが判断）

- 素人思考: 第三者が 5 分で状況把握できるか
- 因果ループ: root drift の再発兆候がないか

## サブタスク管理

1. checklist 作成
2. result 記録
3. issue 分類

## 成果物

| 成果物                   | パス                                        | 説明                  |
| ------------------------ | ------------------------------------------- | --------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | NON_VISUAL 観点一覧   |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 再実行結果と判定      |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`     | blocker / note / info |

## 完了条件

- [ ] NON_VISUAL 3点セットを定義した
- [ ] 固定文言を採用した
- [ ] screenshot 前提を残していない

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを完了
- [ ] 成果物3件を定義
- [ ] 4条件を確認

## 次Phase

Phase 12: ドキュメント更新
