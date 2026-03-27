# Phase 5: 実装

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 5                                    |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

Layer 3 / Layer 4 verify を shared DTO から renderer まで段階的に実装する順序と更新単位を固定する。

## 実行タスク

- shared DTO 追加順を定義する
- IPC / preload / facade 更新順を定義する
- renderer section / action wiring の実装順を定義する
- docs / tests 同時更新順を定義する

## 参照資料

| 資料名          | パス                                         | 説明                 |
| --------------- | -------------------------------------------- | -------------------- |
| Phase 2 設計    | `phase-2-design.md`                          | 5 層更新順           |
| test matrix     | `outputs/phase-4/test-matrix.md`             | 実装と検証の対応     |
| contract matrix | `outputs/phase-2/layer34-contract-matrix.md` | field set と concern |

## 実行手順

### ステップ1: bridge より前に shared DTO を固定する

- `packages/shared/src/types/skillCreator.ts` に Layer 3 / Layer 4 verify detail を追加する。
- DTO 確定前に renderer 側のローカル truth を増やさない。

### ステップ2: bridge と renderer を順に更新する

- main IPC -> preload -> facade -> renderer の順で surface を揃える。
- re-verify action は Task07 / Task08 owner を侵食しない引数セットに限定する。

### ステップ3: tests と docs を同 wave で更新する

- Phase 4 matrix に紐づく suite を同ターンで足す。
- close-out と follow-up 判断に必要な docs を同時更新する。

## 統合テスト連携

- Phase 5 完了時に Phase 4 matrix の unit / integration 想定が全て実装単位へ割り当てられていることを確認する。
- Phase 6 で edge case を足せるよう、命名と file ownership を揃える。

## 成果物

| 成果物                    | パス                                           | 説明             |
| ------------------------- | ---------------------------------------------- | ---------------- |
| implementation sequencing | `outputs/phase-5/implementation-sequencing.md` | 更新順と責務分離 |

## 完了条件

- [ ] shared DTO -> IPC/preload -> facade -> renderer の順が定義されている
- [ ] re-verify action の scope が固定されている
- [ ] tests / docs の同 wave 更新が前提になっている
- [ ] **本Phase内の全タスクを100%実行完了**
