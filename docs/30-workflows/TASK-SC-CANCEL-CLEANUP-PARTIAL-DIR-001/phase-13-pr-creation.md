# Phase 13: PR作成

## 目的

本 task では commit / push / PR を実行しないことを明文化し、Phase 13 を scope 外として据え置く。

## ルール

1. user 承認があっても本 task では commit / push / PR を実行しない
2. Phase 12 の branch 内レビュー結果だけを保持する
3. Phase 13 成果物は draft のまま残し、close-out 完了の根拠に使わない

## blocked 記録

- 理由: task scope から commit / push / PR を除外している
- 完了根拠: なし。Phase 13 は未着手

## 成果物

| 成果物                                   | 条件     |
| ---------------------------------------- | -------- |
| `outputs/phase-13/local-check-result.md` | draft    |
| `outputs/phase-13/change-summary.md`     | draft    |
| `outputs/phase-13/pr-info.md`            | scope 外 |
| `outputs/phase-13/pr-creation-result.md` | scope 外 |

## 完了条件

- [ ] scope 外である理由が明記されている
- [ ] draft 成果物が close-out 根拠に使われていない
- [ ] 成果物定義が `index.md` と一致している
