# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-P0-04 |
| Phase      | 6          |
| Phase名    | テスト拡充 |
| ステータス | completed  |
| 前提Phase  | Phase 5    |
| 後続Phase  | Phase 7    |

## 目的

edge case と回帰を補強する。

## 実行タスク

- manifest 不在を検証する
- 破損 JSON を検証する
- 既存ケースの回帰を確認する

## 参照資料

| 資料                                         | 用途       |
| -------------------------------------------- | ---------- |
| `outputs/phase-6/test-expansion-report.md`   | テスト結果 |
| `ManifestLoader.production-manifest.test.ts` | ケース本体 |

## 統合テスト連携

- Phase 7 で helper 分岐 coverage へ接続する

## 成果物

- `outputs/phase-6/test-expansion-report.md`

## 完了条件

- [x] 異常系が揃う
- [x] 回帰確認ができる
