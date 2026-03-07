# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| Phase      | 11                                                               |
| 機能名     | 07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001              |
| タスク名   | settings 遷移に関わる persist / navigation iterable ハードニング |
| 作成日     | 2026-03-06                                                       |
| ステータス | 完了                                                             |

## 目的

破損 persist state を投入しても Settings 遷移が継続し、クラッシュしないことを画面証跡つきで確認する。

## 実行タスク

- TC-11-01: light theme の Settings 画面で遷移継続を確認
- TC-11-02: dark theme の Settings 画面で遷移継続を確認
- 自動テスト結果（42/42 PASS）と手動画面証跡を突合

## テストケース

| テストケース | 内容                             | 期待結果                 |
| ------------ | -------------------------------- | ------------------------ |
| TC-11-01     | light theme の Settings 画面表示 | クラッシュせず表示される |
| TC-11-02     | dark theme の Settings 画面表示  | クラッシュせず表示される |

## 画面カバレッジマトリクス

| テストケース | 証跡                                      | 判定 |
| ------------ | ----------------------------------------- | ---- |
| TC-11-01     | `screenshots/TC-11-01-settings-light.png` | PASS |
| TC-11-02     | `screenshots/TC-11-02-settings-dark.png`  | PASS |

## 参照資料

- `outputs/phase-11/manual-test-plan.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/screenshots/TC-11-01-settings-light.png`
- `outputs/phase-11/screenshots/TC-11-02-settings-dark.png`

### 前提Phase成果物

| 資料名          | パス                | 用途                     |
| --------------- | ------------------- | ------------------------ |
| Phase 2 成果物  | `outputs/phase-2/`  | 実装設計の前提確認       |
| Phase 5 成果物  | `outputs/phase-5/`  | 変更コード範囲の確認     |
| Phase 6 成果物  | `outputs/phase-6/`  | 回帰テスト拡張内容の確認 |
| Phase 7 成果物  | `outputs/phase-7/`  | カバレッジ確認結果の確認 |
| Phase 8 成果物  | `outputs/phase-8/`  | リファクタ影響範囲の確認 |
| Phase 9 成果物  | `outputs/phase-9/`  | 品質ゲート結果の確認     |
| Phase 10 成果物 | `outputs/phase-10/` | 最終レビュー結果の確認   |

## 実行手順

1. `apps/desktop` で Vite e2e サーバーを起動する。
2. preload mock で `knowledge-studio-store` に `expandedFolders` を含む状態を注入して `/` を表示する。
3. light/dark 各テーマで Settings 画面を撮影する。
4. `manual-test-result.md` に TC とスクリーンショットを紐付ける。

## 統合テスト連携

- `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/navigationSlice.test.ts src/renderer/store/__tests__/customStorage.test.ts`

## 成果物

| 成果物             | パス                                     | 説明                    |
| ------------------ | ---------------------------------------- | ----------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | TC証跡付き判定          |
| スクリーンショット | `outputs/phase-11/screenshots/`          | light/dark の実画面証跡 |

## 完了条件

- [x] `manual-test-result.md` に TC と png 証跡を記録
- [x] light/dark 2ケースのスクリーンショットを取得
- [x] 自動テスト42件と手動証跡の整合を確認
- [x] 本Phase内の全タスクを100%実行完了
