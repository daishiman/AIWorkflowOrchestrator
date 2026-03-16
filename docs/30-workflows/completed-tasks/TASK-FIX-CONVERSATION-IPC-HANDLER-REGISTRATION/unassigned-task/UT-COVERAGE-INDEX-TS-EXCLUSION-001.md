# UT-COVERAGE-INDEX-TS-EXCLUSION-001: vitest.config.ts のカバレッジ除外パターン精緻化

## メタ情報

| 項目      | 内容                                           |
| --------- | ---------------------------------------------- |
| 検出元    | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 検出Phase | Phase 7（カバレッジ確認）                      |
| 優先度    | LOW                                            |
| 検出日    | 2026-03-16                                     |

## 問題

`apps/desktop/vitest.config.ts` L111 の `coveragePathIgnorePatterns` で `**/index.ts` を除外しているが、この除外パターンはバレルエクスポート専用の `index.ts`（`export * from "./foo"` のみ）を想定している。しかし `apps/desktop/src/main/ipc/index.ts` は `registerAllIpcHandlers()` / `unregisterAllIpcHandlers()` 等の実装ロジックを含むため、このファイルのカバレッジが計測されない。

## 影響

- カバレッジレポートの精度が低下する
- 実装ロジックを含む `index.ts` のテスト漏れを検出できない

## 改善案

1. `**/index.ts` を除外パターンから削除し、代わりにバレルエクスポート専用ファイルを個別に除外する
2. `!apps/desktop/src/main/ipc/index.ts` のような否定パターンで対象から復帰させる
3. ファイル名を `ipc/register.ts` 等にリネームして除外パターンに該当しないようにする

## 受入基準

- [ ] `apps/desktop/src/main/ipc/index.ts` が v8 カバレッジ計測対象に含まれる
- [ ] 既存のバレルエクスポート `index.ts` は引き続き除外される
- [ ] 全テストが PASS する

## 関連ファイル

- `apps/desktop/vitest.config.ts` L111
- `apps/desktop/src/main/ipc/index.ts`
