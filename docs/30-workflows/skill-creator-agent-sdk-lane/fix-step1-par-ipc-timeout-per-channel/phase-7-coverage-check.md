# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 7                           |
| 機能名 | fix-ipc-timeout-per-channel |
| 作成日 | 2026-04-01                  |

## 目的

Phase 6 までに追加したテストの coverage を計測し、`getChannelTimeout` と `invokeWithTimeout` の全分岐をカバーする。

## 実行タスク

- `getChannelTimeout` の coverage を計測する
- `invokeWithTimeout` のタイムアウト分岐 coverage を計測する
- 未カバー分岐を洗い出してテストを追加する

## 参照資料

| 資料名           | パス                                                   | 参照理由         |
| ---------------- | ------------------------------------------------------ | ---------------- |
| ipc-utils テスト | `apps/desktop/src/preload/__tests__/ipc-utils.test.ts` | coverage 対象    |
| ipc-utils 実装   | `apps/desktop/src/preload/ipc-utils.ts`                | 計測対象ファイル |

## カバレッジマッピング

| 対象                                             | 目標 | 計測結果   |
| ------------------------------------------------ | ---- | ---------- |
| `getChannelTimeout` — マップ定義済みチャンネル   | 100% | （未計測） |
| `getChannelTimeout` — マップ未定義フォールバック | 100% | （未計測） |
| `invokeWithTimeout` — タイムアウトパス           | 100% | （未計測） |
| `invokeWithTimeout` — 正常応答パス               | 100% | （未計測） |
| `invokeWithTimeout` — 許可外チャンネルパス       | 100% | （未計測） |
| `invokeWithTimeout` — ipcRenderer エラーパス     | 100% | （未計測） |

## 実行手順

### ステップ1: coverage を取る

1. `pnpm --filter @repo/desktop vitest run --coverage` を実行する
2. `ipc-utils.ts` の coverage レポートを確認する
3. 分岐・行・ステートメントの未カバー箇所を記録する

### ステップ2: 未カバー分岐を潰す

1. `invokeWithTimeout` の ipcRenderer reject パスがカバーされているか確認する
2. `clearTimeout` が呼ばれることがテストで確認されているか確認する

### ステップ3: 記録する

1. coverage 結果を outputs に記録する
2. 全分岐カバーを確認する

## 成果物

| 成果物           | パス                                  | 説明         |
| ---------------- | ------------------------------------- | ------------ |
| coverage summary | `outputs/phase-7/coverage-summary.md` | 実測値の固定 |

## 完了条件

- [ ] `ipc-utils.ts` の coverage が計測されている
- [ ] `getChannelTimeout` の全分岐がカバーされている
- [ ] `invokeWithTimeout` の全分岐がカバーされている
- [ ] Phase 8 へ進める状態になっている

## サブタスク管理

1. coverage コマンド実行
2. `getChannelTimeout` coverage 確認
3. `invokeWithTimeout` coverage 確認
4. 未カバー分岐のテスト追加

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] 追加テストの coverage が記録されている
- [ ] Phase 8 で refactoring へ進める
