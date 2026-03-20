# Phase 9 リスク登録簿

## メタ情報

| 項目       | 値                                                                         |
| ---------- | -------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001                  |
| Phase      | 9 - 品質検証                                                               |
| 作成日     | 2026-03-20                                                                 |
| 依存成果物 | outputs/phase-8/refactor-boundaries.md, outputs/phase-2/contract-matrix.md |

---

## リスク一覧

### R-1: 語彙 drift

| 項目               | 内容                                                                                                                                                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスクID           | R-1                                                                                                                                                                                                                                                                          |
| 名称               | 語彙 drift                                                                                                                                                                                                                                                                   |
| 深刻度             | High                                                                                                                                                                                                                                                                         |
| 発生条件           | `authMode` と `capability` の共存期間中に、新規コードが旧語彙（`authMode`）で書かれた場合                                                                                                                                                                                    |
| 影響範囲           | contract-matrix の意味が曖昧になり、Task02-05 の実装者が誤った前提でコードを書くリスクがある                                                                                                                                                                                 |
| mitigation         | (1) same-wave 内で rename を完了する。(2) wave 完了後に `grep -rn "authMode" apps/ packages/` を実行し、IPC 境界以外でのヒットがゼロであることを確認してからコミットする。(3) `AuthModeStatus` DTO 名は IPC 境界にのみ存続を許可し、内部実装では `capability` 語彙を使用する |
| 残存リスク         | IPC 境界での `AuthModeStatus` 名称は意図的に残存する。DTO 名が `authMode` 語彙に見えることで新規実装者が混乱する可能性がある                                                                                                                                                 |
| 残存リスクへの対応 | `AuthModeStatus` の JSDoc に「transport 互換維持のため rename 未実施」と明記し、DTO の命名と内部語彙が意図的に乖離している旨を文書化する                                                                                                                                     |

---

### R-2: state drift

| 項目               | 内容                                                                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスクID           | R-2                                                                                                                                                                                                                               |
| 名称               | state drift                                                                                                                                                                                                                       |
| 深刻度             | High                                                                                                                                                                                                                              |
| 発生条件           | Task02-05 の実装フェーズで contract-matrix のマッピングが暗黙的に変更（拡張・縮小・上書き）された場合                                                                                                                             |
| 影響範囲           | contract-matrix が定義する 4 状態 × CTA マッピングの整合性が崩れ、UI 挙動が仕様から乖離する。Phase 3 ゲートを持たない Task ではレビュー前に実装が完成してしまうリスクがある                                                       |
| mitigation         | Task02-05 の Phase 3（設計レビュー）において contract-matrix との照合を必須ゲートとして設定する。具体的には Phase 3 チェックリストに「contract-matrix の 4 状態定義と一致しているか」を追加し、MAJOR 判定の条件に契約逸脱を含める |
| 残存リスク         | contract-matrix 自体が正しく維持されない場合（Task01 成果物の改ざん・誤記）のリスクは残存する                                                                                                                                     |
| 残存リスクへの対応 | contract-matrix.md を git 管理し、変更時は PR レビューを必須とする。直接 push を防ぐブランチ保護ルールを適用する                                                                                                                  |

---

### R-3: Concern A 侵食

| 項目               | 内容                                                                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスクID           | R-3                                                                                                                                                                                |
| 名称               | Concern A 侵食                                                                                                                                                                     |
| 深刻度             | Medium                                                                                                                                                                             |
| 発生条件           | Task02 の実装が Concern A（RuntimePolicyResolver による capability 判定）の責務を上書きまたは二重実装した場合                                                                      |
| 影響範囲           | RuntimePolicyResolver の SRP が崩れ、capability 判定ロジックが複数箇所に分散する。将来の仕様変更時に全箇所の修正が必要となり、変更コストが増大する                                 |
| mitigation         | Task02 の Phase 3（設計レビュー）に MAJOR 戻りゲートを設定する。「Concern A の responsibility を RuntimePolicyResolver 以外が持っていないか」を MAJOR 判定条件の一つとして明示する |
| 残存リスク         | Task02 の実装者が Phase 3 ゲートを適切に実施しない場合のリスクは残存する                                                                                                           |
| 残存リスクへの対応 | Task02 の phase-3-design-review.md テンプレートに Concern A 侵食チェック項目を事前に組み込み、見落としを防ぐ                                                                       |

---

## リスクサマリー

| リスクID | 名称           | 深刻度 | 状態   | 次アクション                                | Task01 完了時点での状態                                                                                                                                          |
| -------- | -------------- | ------ | ------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1      | 語彙 drift     | High   | 監視中 | same-wave 完了時に grep ゼロヒット確認      | `execution-capability.ts` で capability 語彙を確立済み。`authMode` 語彙との共存は IPC 境界（`AuthModeStatus` DTO 名）のみ。Task02 着手前に grep 確認を実施する。 |
| R-2      | state drift    | High   | 監視中 | Task02-05 の Phase 3 ゲートに照合項目を追加 | contract-matrix + 59 件のテストで状態定義を固定済み。Task02 Phase 3 にゲートを組み込むことで drift を防ぐ。                                                      |
| R-3      | Concern A 侵食 | Medium | 監視中 | Task02 の Phase 3 に MAJOR 戻りゲートを設定 | resolveCapability() が `packages/shared` の pure function として隔離済み。Concern A の authority が Task01 成果物に明確に記録されている。                        |

---

## Task01 完了に伴う新規リスク記録

### R-4: execution-capability.ts の ownership 周知不足

| 項目               | 内容                                                                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスクID           | R-4                                                                                                                                                                  |
| 名称               | execution-capability.ts の ownership 周知不足                                                                                                                        |
| 深刻度             | Low                                                                                                                                                                  |
| 発生条件           | Task02 以降の実装者が `execution-capability.ts` の存在を知らず、capability 判定ロジックを別ファイルに重複実装した場合                                                |
| 影響範囲           | Concern A 侵食（R-3）と連動し、capability 判定が複数箇所に分散する                                                                                                   |
| mitigation         | Phase 12 実装ガイドおよび canonical doc set に `execution-capability.ts` のパスと ownership を明記する。Task02 の Phase 2 設計書のテンプレートに参照リンクを追加する |
| 残存リスク         | Task02 の実装者が Phase 12 成果物を参照しない場合のリスクは残存                                                                                                      |
| 残存リスクへの対応 | onboarding ドキュメント（`scope-definition.md` の canonical doc set 一覧）に `execution-capability.ts` を追記する                                                    |

---

## リスク管理方針

- 本登録簿は Phase 10（最終レビュー）でレビュアーが参照する。
- R-1 / R-2 が High 深刻度であるため、Task02 着手前に mitigation の実施状況を確認すること。
- R-4 は Low 深刻度だが、Phase 12 の実装ガイド作成時に同時に対処すること。
- 新規リスクが検出された場合は本ファイルに追記し、task-workflow.md の残課題テーブルと同期する。
