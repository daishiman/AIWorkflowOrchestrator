# Phase 10: 最終レビューゲート - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| Phase名    | 最終レビューゲート                        |
| 前提Phase  | Phase 9（品質保証）                       |
| 後続Phase  | Phase 11                                  |
| ステータス | complete                                  |
| 作成日     | 2026-04-06                                |
| 機能名     | ut-sdk-07-phase11-screenshot-evidence-001 |

---

## 目的

Phase 11 手動テストへ進める前の最終ゲート。Acceptance Criteria の充足見込みと実施上のリスクを確認する。

---

## 実行タスク

- AC-1〜AC-7 の充足見込みを確認する
- リスク項目と対応方針を確認する
- PASS / MINOR / MAJOR の判定を明記する

### タスク1: Acceptance Criteria 充足見込み確認

| AC番号 | 条件                                                                                                     | 充足見込み          |
| ------ | -------------------------------------------------------------------------------------------------------- | ------------------- |
| AC-1   | terminal_handoff HandoffGuidance screenshot                                                              | □ 充足 / □ 懸念あり |
| AC-2   | disclosure summary screenshot                                                                            | □ 充足 / □ 懸念あり |
| AC-3   | integrated_api 成功後 screenshot（対照）                                                                 | □ 充足 / □ 懸念あり |
| AC-4   | screenshots/ ディレクトリへの配置                                                                        | □ 充足 / □ 懸念あり |
| AC-5   | screenshot-plan.json capture ID との対応                                                                 | □ 充足 / □ 懸念あり |
| AC-6   | manual-test-checklist / result / report の evidence 追記                                                 | □ 充足 / □ 懸念あり |
| AC-7   | discovered-issues / ui-sanity-visual-review / screenshot-coverage / phase11-capture-metadata.json の作成 | □ 充足 / □ 懸念あり |

---

### タスク2: リスク確認

| リスク項目                              | 対応方針                                          |
| --------------------------------------- | ------------------------------------------------- |
| terminal_handoff 状態が再現できない場合 | degraded 状態での代替手順（API key 無効化）を確認 |
| screenshot-plan.json が存在しない場合   | capture ID は本タスクで定義したものを使用         |
| TASK-SDK-07 の実装が一部未完了の場合    | Phase 1 へ差し戻し・前提条件の再確認              |

---

### タスク3: 最終レビュー判定

| 判定  | 条件                                                           |
| ----- | -------------------------------------------------------------- |
| PASS  | AC 全件充足見込み・リスクが許容範囲内。Phase 11 へ進行         |
| MINOR | 軽微な懸念あり（代替手順あり）。対応方針記録後 Phase 11 へ進行 |
| MAJOR | 設計に根本的な問題。Phase 2 へ差し戻し                         |

---

## 参照資料

| 参照資料            | パス                                                                 | 内容                                 |
| ------------------- | -------------------------------------------------------------------- | ------------------------------------ |
| Phase 9 品質保証    | `phase-9-quality-assurance.md`                                       | 前提確認とリスク整理                 |
| Phase 11 手動テスト | `phase-11-manual-test.md`                                            | screenshot 取得シナリオ              |
| 対象コンポーネント  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | HandoffGuidance / disclosure summary |

## 統合テスト連携

- Phase 11 の capture ID がこの判定結果と一致するか確認する
- Phase 12 で root / step-05 evidence を同期する

## 参照資料

- `phase-1-requirements.md`
- `phase-2-design.md`
- `phase-3-design-review.md`
- `phase-9-quality-assurance.md`

## 成果物

| 成果物           | パス                               | 内容             |
| ---------------- | ---------------------------------- | ---------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review.md` | 判定・リスク記録 |

---

## 完了条件

- [ ] AC-1〜AC-6 の充足見込みを確認した
- [ ] リスク項目と対応方針を記録した
- [ ] PASS / MINOR / MAJOR の判定を明記した

## タスク100%実行確認【必須】

全完了条件を確認し、Phase 10 が完了したことを記録すること。

## 次Phase

Phase 11: 手動テスト（screenshot 取得）
