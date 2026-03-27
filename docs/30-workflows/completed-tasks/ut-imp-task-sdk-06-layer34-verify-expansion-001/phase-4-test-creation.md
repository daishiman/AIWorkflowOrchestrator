# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 4                                    |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

Layer 3 / Layer 4 verify の DTO、bridge、renderer、docs QA、manual walkthrough を検証する test matrix を定義する。

## 実行タスク

- shared DTO test を定義する
- IPC / preload / facade integration test を定義する
- renderer section / re-verify action test を定義する
- delegated boundary regression を定義する

## 参照資料

| 資料名          | パス                                         | 説明                        |
| --------------- | -------------------------------------------- | --------------------------- |
| Phase 1 抽出表  | `outputs/phase-1/spec-extraction-map.md`     | source と concern inventory |
| Phase 2 設計    | `phase-2-design.md`                          | 正本設計                    |
| contract matrix | `outputs/phase-2/layer34-contract-matrix.md` | suite 対応表                |
| design review   | `phase-3-design-review.md`                   | gate 判定                   |

## 実行手順

### ステップ1: unit / integration suite を定義する

- shared type: Layer 3 / Layer 4 verify detail DTO の shape を固定する。
- IPC / preload: request / response shape と optional field の整合を固定する。
- facade / engine: mapping と re-verify action の bridge を確認する。

### ステップ2: docs QA / manual suite を定義する

- Task07 / Task08 項目が duplicate owner にならないことを docs QA に入れる。
- manual walkthrough では non-visual でも section traceability を確認できる観点を入れる。

## 統合テスト連携

- Phase 6 で edge case と non-goal regression を追加する。
- Phase 7 で concern coverage を可視化する。

## 成果物

| 成果物      | パス                             | 説明                     |
| ----------- | -------------------------------- | ------------------------ |
| test matrix | `outputs/phase-4/test-matrix.md` | suite と regression case |

## 完了条件

- [ ] shared types / IPC / preload / facade / renderer の各 suite がある
- [ ] delegated boundary regression が定義されている
- [ ] docs QA と manual walkthrough 観点がある
- [ ] **本Phase内の全タスクを100%実行完了**
