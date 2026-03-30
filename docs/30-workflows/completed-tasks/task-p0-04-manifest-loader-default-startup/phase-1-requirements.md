# Phase 1: 要件定義

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-P0-04 |
| Phase      | 1          |
| Phase名    | 要件定義   |
| ステータス | completed  |
| 前提Phase  | なし       |
| 後続Phase  | Phase 2    |

## 目的

本ブランチ差分を起点に、task scope を「default manifest path 解決 helper と検証」へ固定する。

## 実行タスク

- 変更ファイルを特定する
- upstream / downstream 責務を分離する
- 受入基準を current facts に合わせる

## 参照資料

| 資料                                                                                          | 用途       |
| --------------------------------------------------------------------------------------------- | ---------- |
| `apps/desktop/src/main/services/skill/constants.ts`                                           | 実装差分   |
| `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | テスト差分 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                         | 非対象確認 |

## 統合テスト連携

- Phase 4 で helper と manifest 読み込みをケース化する
- Phase 10 で AC と実測結果を結び直す

## 成果物

- `outputs/phase-1/requirements-summary.md`

## 完了条件

- [x] scope が current facts に一致する
- [x] downstream TASK-P0-05 を明示する
