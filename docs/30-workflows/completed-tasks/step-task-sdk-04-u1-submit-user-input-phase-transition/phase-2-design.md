# Phase 2: 設計

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 2                                                   |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

Phase 1 の要件を engine owner 中心の最小差分設計へ落とし込む。

## 実行タスク

- concern 分解: engine ロジック、artifact 記録、テスト追加へ分解する
- transition table 設計: reason x option の canonical table を確定する
- non-change confirmation: facade / IPC / preload / shared type の変更要否を判定する

## 参照資料

| 資料名               | パス                                                                          | 説明            |
| -------------------- | ----------------------------------------------------------------------------- | --------------- |
| phase 1 requirements | `outputs/phase-1/requirements.md`                                             | 入力要件        |
| design output        | `outputs/phase-2/design.md`                                                   | 詳細設計        |
| transition table     | `outputs/phase-2/transition-table.md`                                         | reason 別遷移表 |
| system spec          | `.agents/skills/aiworkflow-requirements/references/arch-electron-services.md` | owner 境界      |

## 実行手順

### ステップ1: concern topology を作る

engine、artifact、test の 3 concern に分割し、lane 数を増やし過ぎない設計にする。

### ステップ2: canonical transition table を確定する

`plan_review` / `verification_review` の valid option、fallback、`verifyResult` 更新方針を表で固定する。

### ステップ3: no-op 境界を明記する

facade / IPC / preload / renderer が追加判断を持たないことを設計上の制約として残す。

## 統合テスト連携

- Phase 4 の test matrix が engine 単体と IPC runtime の 2層を持つように設計入力を渡す

## 成果物

| 成果物 | パス                                  | 説明                |
| ------ | ------------------------------------- | ------------------- |
| 設計書 | `outputs/phase-2/design.md`           | concern / 実装方針  |
| 遷移表 | `outputs/phase-2/transition-table.md` | canonical semantics |

## 完了条件

- [x] engine owner 中心の設計方針が固定されている
- [x] transition table が AC と矛盾しない
- [x] no-op にすべき transport 層が明記されている
- [x] 本Phase内の全タスクを100%実行完了
