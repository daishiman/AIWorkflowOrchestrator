# Phase 10: 最終レビュー

## 目的

Phase 9 の品質保証完了後、全受入基準が満たされているかを最終確認するゲートレビューを行う。

## ゲート条件

| 判定  | 基準                                               |
| ----- | -------------------------------------------------- |
| PASS  | 全受入基準が満たされており、手動テストに進んでよい |
| MINOR | 軽微な懸念あり。修正事項をメモして Phase 11 へ進む |
| MAJOR | 受入基準の未達あり。Phase 8 に戻り修正する         |

---

## TASK-P0-07: 受入基準の最終確認

| ID      | 基準                                                                  | 確認結果 |
| ------- | --------------------------------------------------------------------- | -------- |
| P7-AC-1 | `AGENT_NAMES` ハードコードが削除されている                            | （未）   |
| P7-AC-2 | `RuntimeSkillCreatorFacade.plan()` が `PLAN_RESOURCE_REQUESTS` を読む | （未）   |
| P7-AC-3 | non-agent request が agent 名導出に混入しない                         | （未）   |
| P7-AC-4 | agent 名の変更が `PLAN_RESOURCE_REQUESTS` の修正だけで追従する        | （未）   |
| P7-AC-5 | 既存テストが pass する（後方互換性維持）                              | （未）   |
| P7-AC-6 | エージェント名導出のユニットテストが全パターンを網羅する              | （未）   |

---

## TASK-SDK-04-U2: 受入基準の最終確認

| ID      | 基準                                                                             | 確認結果 |
| ------- | -------------------------------------------------------------------------------- | -------- |
| S4-AC-1 | `handleExecutePlan` が承認済み snapshot を第2引数に渡している                    | （未）   |
| S4-AC-2 | plan review 後にユーザーが textarea を編集しても execute 対象が変わらない        | （未）   |
| S4-AC-3 | `approvedSkillSpec` は plan 承認時点の内容を保持し、テキスト変更で上書きされない | （未）   |
| S4-AC-4 | renderer テストで drift の再発が検出できる                                       | （未）   |

---

## コードレビュー観点

### TASK-P0-07

- [ ] `PLAN_RESOURCE_REQUESTS` だけで agent 名導出が完結しているか
- [ ] `AGENT_NAMES` の削除で source of truth が一本化されているか
- [ ] fallback path が current facts と一致しているか

### TASK-SDK-04-U2

- [ ] `approvedSkillSpec` の semantic が request snapshot として明確か
- [ ] live textarea と execute payload の分離が崩れていないか
- [ ] drift 防止テストが将来の実装者にとって意図を理解しやすいか

---

## 最終判定

| タスク         | 判定       | 理由 | 対応 |
| -------------- | ---------- | ---- | ---- |
| TASK-P0-07     | （未記入） |      |      |
| TASK-SDK-04-U2 | （未記入） |      |      |

全タスク PASS/MINOR の場合 → Phase 11 手動テストへ
