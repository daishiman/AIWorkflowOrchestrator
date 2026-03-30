# Phase 2: 設計

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-P0-04 |
| Phase      | 2          |
| Phase名    | 設計       |
| ステータス | completed  |
| 前提Phase  | Phase 1    |
| 後続Phase  | Phase 3    |

## 目的

既存候補解決ロジックを再利用し、最小変更で default manifest path を解決する。

## 実行タスク

- `explicitRoot` 優先を維持する
- env/home/repo 候補探索へ接続する
- facade 未変更のまま責務境界を守る

## 参照資料

| 資料                                                    | 用途             |
| ------------------------------------------------------- | ---------------- |
| `constants.ts`                                          | 候補解決ロジック |
| `task-p0-04.../outputs/phase-1/requirements-summary.md` | AC参照           |

## 統合テスト連携

- Phase 4 で helper の正常系 / 異常系をテスト化する
- Phase 7 で3分岐のカバレッジを確認する

## 成果物

- `outputs/phase-2/design-document.md`

## 完了条件

- [x] helper の責務が path 解決に限定される
- [x] runtime hookup を混ぜない
