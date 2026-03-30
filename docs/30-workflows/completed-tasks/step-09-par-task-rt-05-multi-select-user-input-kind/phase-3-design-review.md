# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 3                            |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

Phase 2 の設計が「最小拡張」「既存 kind 非破壊」「下流 task で再利用可能」の 3 条件を満たすかレビューする。

## 実行タスク

- shared type 拡張が `option.id` 契約を壊していないか確認する
- engine validation が `single_select` の例外挙動を不用意に変えていないか確認する
- renderer state が kind ごとに独立しているか確認する
- TASK-P0-06 が再利用できる粒度になっているか確認する

## 参照資料

| 資料名          | パス                                                                                          | 説明     |
| --------------- | --------------------------------------------------------------------------------------------- | -------- |
| index           | `index.md`                                                                                    | 全体像   |
| Phase 1 要件    | `phase-1-requirements.md`                                                                     | 契約     |
| Phase 2 設計    | `phase-2-design.md`                                                                           | 詳細設計 |
| downstream task | `../skill-creator-agent-sdk-lane/step-09-par-task-p0-06-conversational-interview-ui/index.md` | 再利用先 |

## 実行手順

### レビューゲート

| 観点              | PASS 条件                                                     | FAIL 例                                     |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------- |
| 契約整合          | `selectedOptionIds` が existing submission 契約の拡張に留まる | `selectedValues` のような別系統値を導入する |
| engine 境界       | validation だけを追加し phase state owner は変えない          | engine に renderer 専用 state を持ち込む    |
| renderer 境界     | checkbox host を既存 question host の一分岐として閉じる       | 新規 overlay や別画面を追加する             |
| downstream 再利用 | TASK-P0-06 が同じ request / submission 契約を使える           | P0-06 側で再度 DTO を作り直す必要がある     |

## 統合テスト連携

- Phase 4 に review 結果を test matrix として引き渡す
- Phase 10 で本ゲートの PASS / FAIL を最終再確認する

## 成果物

| 成果物             | パス                                    | 説明                 |
| ------------------ | --------------------------------------- | -------------------- |
| 設計レビュー記録   | `phase-3-design-review.md`              | 設計 gate の判定基準 |
| design review gate | `outputs/phase-3/design-review-gate.md` | PASS / FAIL の記録先 |

## 完了条件

- [ ] shared type の拡張方針が最小変更として妥当と確認されている
- [ ] engine と renderer の責務境界が確認されている
- [ ] TASK-P0-06 への再利用性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
