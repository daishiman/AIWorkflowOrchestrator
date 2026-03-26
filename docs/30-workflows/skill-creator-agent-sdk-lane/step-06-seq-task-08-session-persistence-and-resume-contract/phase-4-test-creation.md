# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 4                                       |
| 機能名 | session-persistence-and-resume-contract |
| 作成日 | 2026-03-26                              |

## 目的

save/load、resume 可否判定、checkpoint restore、stale write guard を検証する test matrix を定義する。

## 実行タスク

- repository contract test を定義する
- compatibility evaluator test を定義する
- IPC / preload 境界 test を定義する
- regression case を定義する

## 参照資料

| 資料名               | パス                                                  | 説明                     |
| -------------------- | ----------------------------------------------------- | ------------------------ |
| Phase 1 抽出表       | `outputs/phase-1/spec-extraction-map.md`              | save target / scope 抽出 |
| Phase 2 設計         | `phase-2-design.md`                                   | 設計正本                 |
| compatibility matrix | `outputs/phase-2/persistence-compatibility-matrix.md` | save target / rule       |
| checkpoint topology  | `outputs/phase-2/checkpoint-topology.md`              | restore flow             |
| Phase 3 review       | `phase-3-design-review.md`                            | reject / warning 境界    |

## 実行手順

### ステップ1: repository / evaluator test を定義する

- `outputs/phase-1/spec-extraction-map.md` の save target / 非対象一覧を test scope の起点に固定する。
- save / load / replace / invalidate を repository 単位で定義する。
- version mismatch、route mismatch、hash mismatch、lease conflict を evaluator 単位で定義する。

### ステップ2: integration / regression test を定義する

- `handoff-ready` restore は bundle 再表示までを確認する。
- `review-ready` restore は `awaitingUserInput` と `plan_result` の復元を確認する。
- public channel を追加しない場合は internal repository test を正本にする。

## 統合テスト連携

- Phase 6 で drift / stale lock / cleanup edge case を拡充する。
- Phase 7 で save target と invalidation reason の coverage を監査する。

## 成果物

| 成果物      | パス                             | 説明                     |
| ----------- | -------------------------------- | ------------------------ |
| test matrix | `outputs/phase-4/test-matrix.md` | suite と regression case |

## 完了条件

- [ ] save/load / resume / invalidate / conflict の観点が列挙されている
- [ ] phase boundary checkpoint の観点がある
- [ ] Agent SDK session と混同しない test naming になっている
- [ ] **本Phase内の全タスクを100%実行完了**
