# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 10                               |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

AC-1〜AC-7 と minor notes の閉じ方を最終確認する。

## 実行タスク

- AC 充足を確認する
- Phase 3 minor notes の扱いを確定する
- Phase 11/12 の close-out 条件を確認する

## 参照資料

| 資料名           | パス                           | 説明                 |
| ---------------- | ------------------------------ | -------------------- |
| index.md         | `index.md`                     | AC-1〜AC-7           |
| Phase 3 レビュー | `phase-3-design-review.md`     | minor notes の出発点 |
| Phase 9 QA       | `phase-9-quality-assurance.md` | 品質監査結果         |

## 実行手順

### AC 充足マトリクス

| AC   | 充足条件                   | 確認方法     |
| ---- | -------------------------- | ------------ |
| AC-1 | plan false-success 排除    | TC-01, TC-02 |
| AC-2 | execute 抑止               | TC-06        |
| AC-3 | improve false-success 排除 | TC-03        |
| AC-4 | reason code + message      | TC-01, TC-03 |
| AC-5 | outer / inner error 分離   | TC-04, TC-05 |
| AC-6 | renderer 表示              | TC-06, TC-07 |
| AC-7 | 正常系 / handoff 非破壊    | TC-08, TC-09 |

### MINOR 追跡

| MINOR ID | 扱い                                             |
| -------- | ------------------------------------------------ |
| M-01     | Phase 8 で解決                                   |
| M-02     | Phase 5 で解決                                   |
| M-03     | Phase 6 で解決、未解決なら Phase 12 で未タスク化 |

## 統合テスト連携

- Phase 11 で docs-only walkthrough を実施し、必要時のみ screenshot へ昇格判定する

## 成果物

| 成果物           | パス                                      | 説明              |
| ---------------- | ----------------------------------------- | ----------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC / MINOR の判定 |

## 完了条件

- [ ] AC-1〜AC-7 の判定が埋まっている
- [ ] MINOR の扱いが確定している
- [ ] Phase 11/12 へ引き継ぐ blocker が明確である
- [ ] **本Phase内の全タスクを100%実行完了**
