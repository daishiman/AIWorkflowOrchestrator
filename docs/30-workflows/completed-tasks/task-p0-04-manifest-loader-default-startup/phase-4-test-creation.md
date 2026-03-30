# Phase 4: テスト作成

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-P0-04 |
| Phase      | 4          |
| Phase名    | テスト作成 |
| ステータス | completed  |
| 前提Phase  | Phase 3    |
| 後続Phase  | Phase 5    |

## 目的

helper と production manifest 読み込みの正常系・異常系を固定する。

## 実行タスク

- TC-10〜14 を定義する
- EC-10〜12 を定義する
- 回帰観点を production manifest テストへ集約する

## 参照資料

| 資料                                         | 用途       |
| -------------------------------------------- | ---------- |
| `phase-1-requirements.md`                    | AC参照     |
| `phase-2-design.md`                          | 設計整合   |
| `outputs/phase-4/test-plan.md`               | テスト一覧 |
| `ManifestLoader.production-manifest.test.ts` | 実コード   |

## 統合テスト連携

- Phase 5 実装後に targeted test を実行する

## 成果物

- `outputs/phase-4/test-plan.md`

## 完了条件

- [x] helper 正常系 / 異常系が揃う
- [x] regression 観点が残る
