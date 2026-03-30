# Phase 13: PR作成

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 13                           |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

ユーザー承認後にのみ実施する PR 作成の blocked 条件を明記し、Phase 12 までの完了根拠を束ねる。

## 実行タスク

- user approval の有無を確認する
- local check の結果を束ねる
- change summary を整理する
- approval がない場合は blocked 理由を明記する

## 参照資料

| 資料名        | パス                                                               | 説明         |
| ------------- | ------------------------------------------------------------------ | ------------ |
| Phase 10 gate | `phase-10-final-review.md`                                         | review 結果  |
| Phase 12 docs | `phase-12-documentation.md`                                        | close-out    |
| commands      | `.agents/skills/task-specification-creator/references/commands.md` | 補助コマンド |

## 実行手順

### blocked 条件

1. user の明示承認がない
2. Phase 12 までの完了根拠が不足している
3. local check の結果が未整理である

## 成果物

| 成果物             | パス                                     | 説明                   |
| ------------------ | ---------------------------------------- | ---------------------- |
| PR 作成仕様        | `phase-13-pr-creation.md`                | blocked 条件と解除条件 |
| local check result | `outputs/phase-13/local-check-result.md` | local 検証結果         |
| change summary     | `outputs/phase-13/change-summary.md`     | 差分要約               |

## 完了条件

- [ ] blocked 条件が定義されている
- [ ] approval 有無の記録方法が定義されている
- [ ] local check result と change summary の配置先が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
