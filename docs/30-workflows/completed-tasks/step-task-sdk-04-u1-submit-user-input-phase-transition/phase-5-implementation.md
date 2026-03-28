# Phase 5: 実装

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 5                                                   |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

engine owner に reason 別 transition と artifact 記録を実装する。

## 実行タスク

- engine transition 実装
- phase transition artifact 記録
- facade / IPC no-op 維持確認

## 参照資料

| 資料名                | パス                                                                          | 説明       |
| --------------------- | ----------------------------------------------------------------------------- | ---------- |
| phase 2 design        | `outputs/phase-2/design.md`                                                   | 実装方針   |
| implementation output | `outputs/phase-5/implementation.md`                                           | 実装記録   |
| system spec           | `.agents/skills/aiworkflow-requirements/references/arch-electron-services.md` | owner 原則 |

## 実行手順

### ステップ1: engine に transition 分岐を入れる

`reason` を主語にして private helper へ分岐し、option ごとの state 更新を行う。

### ステップ2: artifact を追記する

実 phase 変化が起きた時だけ `phase_transition` artifact を追記する。

### ステップ3: transport 層が意味論を持たないことを再確認する

facade / IPC / preload が pass-through を維持することを確認する。

## 統合テスト連携

- Phase 4 test plan に従い実装対象を限定する

## 成果物

| 成果物   | パス                                | 説明               |
| -------- | ----------------------------------- | ------------------ |
| 実装記録 | `outputs/phase-5/implementation.md` | 変更計画と確認項目 |

## 完了条件

- [ ] reason 別 transition が engine に実装されている
- [ ] `phase_transition` artifact 記録が設計通りである
- [ ] transport 層が no-op を維持している
- [ ] 本Phase内の全タスクを100%実行完了
