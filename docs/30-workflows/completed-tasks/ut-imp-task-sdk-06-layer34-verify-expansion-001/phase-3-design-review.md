# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 3                                    |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

Layer 3 / Layer 4 verify の設計が Task06 / Task07 / Task08 と衝突せず、implementation 前提として十分に閉じているかを判定する。

## 実行タスク

- owner 境界の妥当性を判定する
- delegated item の妥当性を判定する
- validation path の十分性を判定する
- manual evidence と Phase 12 close-out の十分性を判定する
- 30種の思考法で過剰設計と見落としを監査する

## 参照資料

| 資料名                               | パス                                                      | 説明                       |
| ------------------------------------ | --------------------------------------------------------- | -------------------------- |
| Phase 1 要件                         | `phase-1-requirements.md`                                 | acceptance criteria        |
| Phase 2 設計                         | `phase-2-design.md`                                       | contract matrix と設計方針 |
| layer34 contract matrix              | `outputs/phase-2/layer34-contract-matrix.md`              | 5 層 field set             |
| sibling boundary decision            | `outputs/phase-2/sibling-boundary-decision.md`            | delegated item 判定        |
| skill compliance and elegance review | `outputs/phase-3/skill-compliance-and-elegance-review.md` | 30思考法と4条件の適用結果  |

## 判定

PASS

## Gate Summary

| Gate                            | 結果 | 根拠                                                                                    |
| ------------------------------- | ---- | --------------------------------------------------------------------------------------- |
| G-01 owner preservation         | PASS | `verifyResult` / `sourceProvenance` / `routeSnapshot` の owner を engine のまま維持する |
| G-02 sibling boundary isolation | PASS | governance は Task07、session semantics は Task08 へ明示委譲した                        |
| G-03 scope control              | PASS | terminal handoff redesign、persistence 実装、create mainline 変更を非対象へ固定した     |
| G-04 validation sufficiency     | PASS | unit / integration / docs QA / manual / Phase 12 の 5 段で証跡を閉じる                  |
| G-05 implementation readiness   | PASS | shared DTO -> IPC/preload -> facade -> renderer の更新順が定義されている                |
| G-06 elegant minimality         | PASS | 30思考法レビューでも `owner 維持 + delegated note + 5層貫通` が最小複雑性と判定した     |

## Minor Notes

| 項目                          | 行き先      |
| ----------------------------- | ----------- |
| renderer の視覚デザイン詳細   | 実装 wave   |
| governance slot の具体文言    | Task07 連携 |
| resume 時の warning copy 詳細 | Task08 連携 |

## 統合テスト連携

- Phase 4 の matrix に delegated item 非侵食テストが入ることを確認する。
- Phase 9 で owner 境界と docs drift を再監査する。

## Phase 4 開始条件

- Layer 3 / Layer 4 concern が test case 名へ落とせること
- shared type と renderer section の 1:1 対応が説明できること

## Phase 13 blocked 条件

- ユーザー承認がない限り PR / commit は実行しない
- 本タスクは spec_created で止め、local check と change summary までに留める

## 成果物

| 成果物                         | パス                                                      | 説明                     |
| ------------------------------ | --------------------------------------------------------- | ------------------------ |
| design review gate             | `outputs/phase-3/design-review-gate.md`                   | gate 判定                |
| compliance and elegance review | `outputs/phase-3/skill-compliance-and-elegance-review.md` | 過剰設計防止と整合性監査 |

## 完了条件

- [ ] owner / delegated / non-goal が矛盾なく説明できる
- [ ] validation path が implementation 前提として十分である
- [ ] Task07 / Task08 と責務衝突がない
- [ ] **本Phase内の全タスクを100%実行完了**
