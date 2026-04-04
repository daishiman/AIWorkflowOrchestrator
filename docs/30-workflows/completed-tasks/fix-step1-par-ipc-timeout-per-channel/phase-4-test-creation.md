# Phase 4: テスト作成

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 4                           |
| 機能名 | fix-ipc-timeout-per-channel |
| 作成日 | 2026-04-01                  |

## 目的

Phase 3 のレビュー結果をもとに、実装前に `getChannelTimeout` の動作と `invokeWithTimeout` のチャンネル別タイムアウトを固定するテストを定義する。

## 実行タスク

- `getChannelTimeout` のユニットテストケースを定義する
- `invokeWithTimeout` のチャンネル別タイムアウト動作テストを定義する
- テストファイルの追加先を確定する

## 参照資料

| 資料名                 | パス                                    | 参照理由                  |
| ---------------------- | --------------------------------------- | ------------------------- |
| ipc-utils current code | `apps/desktop/src/preload/ipc-utils.ts` | テスト対象の current code |
| Phase 2 設計           | `phase-2-design.md`                     | テスト仕様の根拠          |

## テストファイルの追加先

| ファイル                                                                 | 内容                                               |
| ------------------------------------------------------------------------ | -------------------------------------------------- |
| `apps/desktop/src/preload/__tests__/ipc-utils.test.ts`（新規または既存） | `getChannelTimeout` + `invokeWithTimeout` のテスト |

## テスト方針

- `getChannelTimeout` は各チャンネルの期待値と未定義チャンネルのフォールバックを網羅する
- `invokeWithTimeout` はタイムアウト値が `getChannelTimeout` から取得されていることを確認する
- 既存の `invokeWithTimeout` テストが引き続き pass することを確認する

## テストケース詳細

### getChannelTimeout

| ID    | シナリオ                                  | 期待結果       |
| ----- | ----------------------------------------- | -------------- |
| T-001 | `getChannelTimeout("auth:login")`         | `500` を返す   |
| T-002 | `getChannelTimeout("auth:get-session")`   | `10000` を返す |
| T-003 | `getChannelTimeout("auth:refresh")`       | `10000` を返す |
| T-004 | `getChannelTimeout("skill-creator:plan")` | `30000` を返す |
| T-005 | `getChannelTimeout("skill:execute")`      | `60000` を返す |
| T-006 | `getChannelTimeout("unknown:channel")`    | `5000` を返す  |
| T-007 | `getChannelTimeout("")`                   | `5000` を返す  |
| T-008 | `IPC_TIMEOUT_MS` の値が `5000` である     | `5000` を確認  |

### invokeWithTimeout のタイムアウト動作

| ID    | シナリオ                                                        | 期待結果                                  |
| ----- | --------------------------------------------------------------- | ----------------------------------------- |
| T-009 | `skill:execute` チャンネルで 60000ms 以内に応答があれば resolve | resolve する                              |
| T-010 | `skill:execute` チャンネルで 60000ms を超えると timeout error   | `did not respond within 60000ms` でreject |
| T-011 | 未定義チャンネルで 5000ms を超えると timeout error              | `did not respond within 5000ms` でreject  |
| T-012 | 許可されていないチャンネルは即座に reject                       | `Channel X is not allowed` でreject       |

## 成果物

| 成果物         | パス                                                   | 説明             |
| -------------- | ------------------------------------------------------ | ---------------- |
| テスト計画     | `phase-4-test-creation.md`                             | RED phase の固定 |
| テストファイル | `apps/desktop/src/preload/__tests__/ipc-utils.test.ts` | 実装前の RED     |

## 完了条件

- [ ] `getChannelTimeout` のテストケースが全チャンネルと未定義ケースを網羅している
- [ ] `invokeWithTimeout` のタイムアウト動作テストが定義されている
- [ ] 既存テストとの競合がない

## サブタスク管理

1. `getChannelTimeout` テストケースの定義
2. `invokeWithTimeout` タイムアウト動作テストの定義
3. テストファイルの追加先確認
4. 既存テストとの競合確認

## 統合テスト連携

- Phase 5 の実装対象と Phase 6 の拡張観点へ、RED テストを引き継ぐ

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] テストケースが受入基準に 1:1 対応している
- [ ] Phase 5 で RED から GREEN に進める
