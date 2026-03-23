# Phase 9: リスク登録簿

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 9                                                     |
| 作成日   | 2026-03-23                                            |
| タイプ   | 設計タスク（プロダクションコード変更なし）            |

## リスクレベル定義

| レベル | 説明                               |
| ------ | ---------------------------------- |
| HIGH   | 設計の根幹を壊す。即時対応が必要   |
| MEDIUM | 実装品質に影響。追跡と緩和策が必要 |
| LOW    | 軽微。実装タスクで対処すれば十分   |

---

## 1. 残余リスク一覧

### R-01: MN-01 未解決による IPC contract drift（MEDIUM）

| 項目       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| リスク     | SlideCapabilityDTO の IPC channel 名が未確定のまま実装が進み、contract drift が発生する      |
| 発生条件   | UT-SLIDE-IMPL-001 が MN-01 の指摘を参照せずに実装を開始した場合                              |
| 影響範囲   | slide:capability:\* channel の allowlist 登録漏れ、Preload 側の型不整合                      |
| 緩和策     | UT-SLIDE-IMPL-001 の Phase 5 で implementation-plan.md に channel 名を明示する（MN-01 追跡） |
| 残余リスク | MEDIUM → LOW（MN-01 追跡完了後）                                                             |
| 参照       | gate-decision.md, P44, P45, P65                                                              |

### R-02: cleanup 順序の Gate 条件違反（MEDIUM）

| 項目       | 内容                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| リスク     | 依存タスクの完了を待たずに cleanup 順序5〜7 の作業を並列実行し、契約が壊れる   |
| 発生条件   | UT-SLIDE-IMPL-001 が Task09 governance 承認前に agent-client.ts を変更した場合 |
| 影響範囲   | agent-client.ts の変更が Task09 governance の承認なしに行われる                |
| 緩和策     | cleanup 順序テーブルの Gate 条件を PR テンプレートに組み込み、CI で検証する    |
| 残余リスク | MEDIUM（Gate 条件の自動検証なし）                                              |
| 参照       | design-summary.md Concern C, P56                                               |

### R-03: P31 無限ループ（slideSettingsStore）（MEDIUM）

| 項目       | 内容                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| リスク     | SlideWorkspace が slideSettingsStore の合成 Hook を使用し、P31 無限ループが発生する |
| 発生条件   | UT-SLIDE-P31-001 の実装前に SlideWorkspace に store 接続を追加した場合              |
| 影響範囲   | SlideWorkspace の無限再レンダー、CPU 高負荷                                         |
| 緩和策     | UT-SLIDE-P31-001 を cleanup 順序8（UI 4領域反映と同時）に割り当て済み               |
| 残余リスク | MEDIUM → LOW（UT-SLIDE-P31-001 完了後）                                             |
| 参照       | known-pitfalls.md P31, P48                                                          |

### R-04: terminal handoff 重複（Task05 との境界）（LOW）

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| リスク     | TerminalHandoffCard が Task05 と Task08 で重複実装され、UI 表示が二重になる              |
| 発生条件   | UT-SLIDE-HANDOFF-DUP-001 が cleanup 順序9（Task05 完了後）を待たずに実装した場合         |
| 影響範囲   | terminal launcher 領域に2つのボタンが表示される                                          |
| 緩和策     | contract-matrix.md の Ownership テーブルで TerminalHandoffCard は Task05 共有 DTO と明記 |
| 残余リスク | LOW（Ownership テーブルで制御済み）                                                      |
| 参照       | contract-matrix.md セクション4, UT-SLIDE-HANDOFF-DUP-001                                 |

### R-05: 依存タスク未完了による Phase 5 blocked（LOW）

| 項目       | 内容                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| リスク     | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 が未完了のまま Phase 5 の terminal launcher 実装が進む |
| 発生条件   | 依存タスクの完了待ちに関するチェックが抜けた場合                                                         |
| 影響範囲   | terminal launcher の契約が未確定で実装すると、Task05 完了後に大幅な修正が必要になる                      |
| 緩和策     | design-summary.md の blocked 条件テーブルで「Task05 未完了は Phase 5 を blocked」と明記済み              |
| 残余リスク | LOW（blocked 条件が明記済み）                                                                            |
| 参照       | design-summary.md blocked 条件                                                                           |

### R-06: UX-07 screenshot 契約の変更（LOW）

| 項目       | 内容                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| リスク     | ui-ux-realization.md の UX-07 が更新され、S01〜S05 の TC-ID が変更になる            |
| 発生条件   | Task08 完了後に ui-ux-realization.md が別タスクで更新された場合                     |
| 影響範囲   | Phase 11 の手動テスト計画が陳腐化する                                               |
| 緩和策     | design-summary.md の blocked 条件に「UX-07 変更時は Phase 11 を blocked」と明記済み |
| 残余リスク | LOW（blocked 条件が明記済み）                                                       |
| 参照       | design-summary.md blocked 条件, contract-matrix.md セクション5                      |

---

## 2. リスクサマリー

| ID   | タイトル                             | レベル | 緩和済み | 残余                      |
| ---- | ------------------------------------ | ------ | -------- | ------------------------- |
| R-01 | MN-01 IPC contract drift             | MEDIUM | 一部     | LOW（追跡後）             |
| R-02 | cleanup Gate 条件違反                | MEDIUM | 一部     | MEDIUM                    |
| R-03 | P31 無限ループ（slideSettingsStore） | MEDIUM | 一部     | LOW（UT-SLIDE-P31-001後） |
| R-04 | terminal handoff 重複                | LOW    | 済み     | LOW                       |
| R-05 | 依存タスク未完了 Phase 5 blocked     | LOW    | 済み     | LOW                       |
| R-06 | UX-07 screenshot 契約変更            | LOW    | 済み     | LOW                       |

**HIGH リスクなし。残余 MEDIUM は2件（R-01, R-02）。**

R-02（Gate 条件違反）は、CI での自動検証機構がないため MEDIUM のまま残る。
実装タスクのレビューチェックリストにて手動検証する。
