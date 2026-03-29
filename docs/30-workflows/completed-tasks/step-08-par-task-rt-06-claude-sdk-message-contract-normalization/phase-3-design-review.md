# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 3                                         |
| 機能名 | claude-sdk-message-contract-normalization |
| 作成日 | 2026-03-29                                |

## 目的

正規化設計が dynamic skill-creator 主線を壊さず、UI と WorkflowEngine を SDK 生イベントから切り離せているかをレビューする。

## 実行タスク

- skill-creator 動的読込を壊していないか確認する
- `session_id` / provenance / result subtype の欠落がないか確認する
- 後続タスクへの入力契約が十分か確認する

## 参照資料

| 資料名       | パス                | 説明             |
| ------------ | ------------------- | ---------------- |
| Phase 2 設計 | `phase-2-design.md` | 設計レビュー対象 |

## 実行手順

- レビュー観点 1: SDK 生イベント依存が残っていないか
- レビュー観点 2: `.claude/skills/skill-creator/` の provenance が保持されるか
- レビュー観点 3: RT-03 / P0-05 / P0-08 / P0-09 に必要な項目が揃っているか

## 成果物

| 成果物             | パス                                    | 説明        |
| ------------------ | --------------------------------------- | ----------- |
| design review gate | `outputs/phase-3/design-review-gate.md` | PASS / FAIL |

## 完了条件

- [ ] dynamic skill-creator 主線維持が確認されている
- [ ] 正規化契約の欠落がない
- [ ] 後続タスクへの引き渡し項目が十分である
- [ ] **本Phase内の全タスクを100%実行完了**
