# Phase 13 PR Preparation（下書き）

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase      | 13                                              |
| 作成日     | 2026-03-24                                      |
| ステータス | **blocked**                                     |
| タスク種別 | 設計タスク（プロダクションコードなし）          |

## Blocked 理由

- ユーザーの明示指示なしでは PR を作成しない
- commit / push / PR 操作は全てユーザーの明示指示を待つ
- 本ドキュメントは将来の PR 作成時の参考情報としてのみ使用する

## PR 下書き

### ブランチ名候補

```
docs/advanced-console-safety-governance-design
```

### PR タイトル候補

```
docs: Advanced Console Safety Governance 設計契約定義
```

### PR 本文候補

```markdown
## Summary

- Approval Sheet（承認画面）、Session Disclosure Banner（AI利用/外部送信開示）、Advanced Console Panel（opt-in詳細表示）の設計契約を定義
- DENY-1〜DENY-10（禁止事項）、MUST-1〜MUST-10（遵守事項）、CAG-1〜CAG-3（Consumer Auth Guard）の compliance baseline を確立
- No Auto-Send（消極的enforcement: IPC endpoint非提供）および Manual Boundary の設計を完了

## Test Plan

- [ ] Phase 1-3 設計成果物が存在し、内容が整合している
- [ ] Phase 3 Gate Decision が PASS（MINOR指摘3件: R-M1〜R-M3）
- [ ] Phase 11 手動テスト計画が11シナリオを網羅している
- [ ] Phase 12 全6 Task が PASS 判定
- [ ] Phase 12 未タスク検出: 5件（UT-1〜UT-5）が記録されている
- [ ] プロダクションコードの変更が0件であること
```

### Reviewer 観点

本 PR は設計タスクのため、以下の観点でレビューを依頼する:

| 観点                  | 確認内容                                                         |
| --------------------- | ---------------------------------------------------------------- |
| Approval 網羅性       | 全 trigger（APR-T1〜T4）が定義されているか                       |
| Disclosure 十分性     | AI利用 + 外部送信の2点が開示されるか                             |
| No Auto-Send 堅牢性   | 消極的enforcement（IPC非提供）が設計で保証されるか               |
| Advanced Console 分離 | opt-in gate + CTA階層 + Layer分離が Front Surface と分離されるか |
| Compliance 完全性     | DENY/MUST/CAG の全項目が設計で網羅されるか                       |
| 後続タスクの明確性    | 未タスク（UT-1〜UT-5）の対象・優先度・前提が明確か               |

### PR 成果物一覧

| Phase    | ファイル数 | 内容                                                                                   |
| -------- | ---------- | -------------------------------------------------------------------------------------- |
| 1        | 3          | 要件定義、スコープ、compliance baseline                                                |
| 2        | 3          | 設計サマリー、approval/disclosure契約、advanced console boundary                       |
| 3        | 2          | 設計レビュー報告、gate decision                                                        |
| 11       | 3          | 手動テスト計画、screenshot計画、発見事項                                               |
| 12       | 6          | 実装ガイド、system spec要約、changelog、未タスク検出、compliance check、skill feedback |
| 13       | 1          | PR準備メモ（本ファイル）                                                               |
| **合計** | **18**     | 設計成果物のみ（コード変更0件）                                                        |
