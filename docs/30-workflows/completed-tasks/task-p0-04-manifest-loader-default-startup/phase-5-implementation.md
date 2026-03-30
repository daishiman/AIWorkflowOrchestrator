# Phase 5: 実装

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-P0-04 |
| Phase      | 5          |
| Phase名    | 実装       |
| ステータス | completed  |
| 前提Phase  | Phase 4    |
| 後続Phase  | Phase 6    |

## 目的

default manifest path 解決 helper と関連テストを実装する。

## 実行タスク

- `constants.ts` に定数と helper を追加する
- production manifest テストを拡張する
- 非対象の facade 変更を混ぜない

## 参照資料

| 資料                                        | 用途     |
| ------------------------------------------- | -------- |
| `outputs/phase-5/implementation-summary.md` | 実装要約 |
| `constants.ts`                              | 実装本体 |

## 統合テスト連携

- targeted test 実測を Phase 9 と 10 へ流す

## 成果物

- `outputs/phase-5/implementation-summary.md`

## 完了条件

- [x] 2ファイル差分と一致する
- [x] helper は additive
