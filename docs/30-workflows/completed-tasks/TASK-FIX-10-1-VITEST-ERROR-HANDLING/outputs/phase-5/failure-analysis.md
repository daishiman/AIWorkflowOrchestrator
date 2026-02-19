# Phase 5: 失敗テスト分析と修正内容

## タスク: TASK-FIX-10-1-VITEST-ERROR-HANDLING

## 修正前の状態

- `dangerouslyIgnoreUnhandledErrors: true` を `false` に変更した場合、252テストが失敗
- 失敗の3カテゴリ:
  1. @repo/shared サブパスエイリアス不足 (約150テスト)
  2. chat-history 非同期クリーンアップ不備 (約30テスト)
  3. Worker 予期せぬ終了 (1件、P22既知問題)

## 根本原因分析

### カテゴリ1: @repo/shared サブパスエイリアス不足

**根本原因**: `vitest.config.ts` の `resolve.alias` セクションには、以前から登録されていた6つのエイリアスのみが存在していた。しかしプロジェクトのコードベースは24種類の `@repo/shared` サブパスインポートを使用しており、18種類が未登録だった。

未登録のエイリアスのモジュール解決は `node_modules` 経由で `packages/shared/dist/` を参照するが、テスト実行時にビルド済み `dist/` が古い、または存在しないケースでモジュール解決エラーが発生していた。`dangerouslyIgnoreUnhandledErrors: true` はこのエラーを隠蔽していた。

**修正**: 18種類の不足エイリアスを `vitest.config.ts` に追加。全てソースファイルを直接参照するようにマッピング。

### カテゴリ2: chat-history 非同期クリーンアップ不備

**根本原因の再分析**: 当初、happy-dom の AsyncTaskManager 破壊後にスクリプト実行が継続するという分析だったが、実際にはカテゴリ1のモジュール解決エラーの連鎖的な失敗であった。

`@repo/shared` のエイリアス追加により、chat-history テストを含む全テストがパスした。追加のテストコード修正は不要だった。

### カテゴリ3: Worker 予期せぬ終了

**状態**: P22 既知問題。tinypool の Worker プロセスの終了であり、テスト結果自体には影響しない。タスクスコープ外。

## 修正後の状態

```
Test Files  458 passed | 3 skipped (462)
     Tests  10189 passed | 62 skipped (10260)
    Errors  1 error (Worker exited unexpectedly - P22既知問題)
```

- 全458テストファイルがパス
- 全10189テストがパス
- 252テストの失敗が完全に解消

## 変更ファイル一覧

| ファイル                                             | 変更内容                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `apps/desktop/vitest.config.ts`                      | `dangerouslyIgnoreUnhandledErrors: true` を削除、18個のエイリアスを追加 |
| `apps/desktop/src/test/vitest-config.test.ts`        | 新規: 設定検証テスト (5テスト)                                          |
| `apps/desktop/src/test/async-error-handling.test.ts` | 新規: 非同期エラーハンドリング検証テスト (8テスト)                      |

## プロダクションコード変更

なし。変更は全て設定ファイルとテストファイルのみ。
