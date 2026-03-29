# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 3                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

提案した契約整理が最小複雑性であり、既存公開契約と整合するかを判定する。

## 実行タスク

- 型後方互換性を判定する
- 責務境界の妥当性を判定する
- IPC 契約の一貫性を判定する
- renderer UX の妥当性を判定する

## 参照資料

| 資料名       | パス                      | 説明          |
| ------------ | ------------------------- | ------------- |
| Phase 1 要件 | `phase-1-requirements.md` | current facts |
| Phase 2 設計 | `phase-2-design.md`       | 提案契約      |

## 判定

PASS

## Gate Summary

| Gate                        | 結果 | 根拠                                                                               |
| --------------------------- | ---- | ---------------------------------------------------------------------------------- |
| G-01 型後方互換性           | PASS | `RuntimeSkillCreatorPlanResponse` は union 追加で閉じ、既存成功 shape を壊さない   |
| G-02 責務境界               | PASS | Facade は reason code 決定、IPC は transport error 専用、renderer は表示と抑止のみ |
| G-03 実コード整合           | PASS | `execute()` に不存在の degraded stub を要求しない                                  |
| G-04 UX 妥当性              | PASS | 失敗理由が即時表示され、空の成功画面を回避できる                                   |
| G-05 RT-01 / RT-03 競合回避 | PASS | shared type 追加を最小化し、結果パネルの後続拡張を阻害しない                       |

## Minor Notes

| MINOR ID | 項目                                  | 対応方針               |
| -------- | ------------------------------------- | ---------------------- |
| M-01     | reason code 文言の共通化              | Phase 8 で定数化       |
| M-02     | plan logical error の type guard 名称 | Phase 5 で命名統一     |
| M-03     | wizard と lifecycle の文言差          | Phase 6 で parity test |

## 統合テスト連携

- Phase 4 で logical error と transport error を分離したケースを作る
- Phase 9 で union 契約が lint / typecheck 上も自然かを再監査する

## 成果物

| 成果物      | パス                                    | 説明                |
| ----------- | --------------------------------------- | ------------------- |
| review gate | `outputs/phase-3/design-review-gate.md` | gate と minor notes |

## 完了条件

- [ ] execute の過剰要件が除去されている
- [ ] union 契約が既存 improve 契約と整合している
- [ ] IPC / renderer 境界が矛盾なく閉じている
- [ ] Phase 4 に必要な test point が確定している
- [ ] **本Phase内の全タスクを100%実行完了**
