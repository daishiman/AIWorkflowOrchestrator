# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 8                           |
| 機能名 | fix-ipc-timeout-per-channel |
| 作成日 | 2026-04-01                  |

## 目的

機能を変えずに、読みやすさと保守性だけを上げる。

## 実行タスク

- `CHANNEL_TIMEOUTS` のコメントが保守担当者に意図を伝えるか確認する
- `getChannelTimeout` の JSDoc が十分かを確認する
- `invokeWithTimeout` の修正箇所が読みやすいかを確認する

## 参照資料

| 資料名    | パス                                    | 参照理由      |
| --------- | --------------------------------------- | ------------- |
| ipc-utils | `apps/desktop/src/preload/ipc-utils.ts` | refactor 対象 |

## リファクタリング観点

### CHANNEL_TIMEOUTS

- 各チャンネルのコメントに「なぜその値か」の根拠が書いてあるか
- 新しいチャンネルを追加する際にどこに書けばよいかが一目でわかるか
- 過剰なコメントにならないか（1 行コメントで十分）

### getChannelTimeout

- JSDoc が「何を返すか」を明確に説明しているか
- `IPC_TIMEOUT_MS` へのフォールバックが明示されているか
- 関数名が動作を正確に表しているか

### invokeWithTimeout

- `const timeout = getChannelTimeout(channel);` の配置が読みやすいか
- タイムアウトエラーメッセージが保守者に役立つか
- 余分なコメントを増やさない

## 実行手順

### ステップ1: コメントを整える

1. `CHANNEL_TIMEOUTS` の各エントリにインラインコメントで根拠を書く
2. モジュール JSDoc（`@module`）を更新する

### ステップ2: JSDoc を整える

1. `getChannelTimeout` の JSDoc に `@returns` と `@remarks`（フォールバック動作）を追加する
2. 既存の `invokeWithTimeout` JSDoc に `getChannelTimeout` の参照を追記する

### ステップ3: 再実行する

1. `pnpm --filter @repo/desktop test:run` でテストが引き続き pass することを確認する
2. `pnpm --filter @repo/desktop typecheck` でエラーがないことを確認する

## 成果物

| 成果物              | パス                                     | 説明           |
| ------------------- | ---------------------------------------- | -------------- |
| refactoring summary | `outputs/phase-8/refactoring-summary.md` | 変更内容の記録 |

## 完了条件

- [ ] 機能変更なしで可読性が上がっている
- [ ] `CHANNEL_TIMEOUTS` に根拠コメントがある
- [ ] テストが引き続き pass する

## サブタスク管理

1. `CHANNEL_TIMEOUTS` コメント整備
2. `getChannelTimeout` JSDoc 整備
3. 再実行と確認

## 統合テスト連携

- Phase 9 の品質保証へ、リファクタ後の挙動を引き継ぐ

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] 実装の意図がコメントで伝わる
- [ ] Phase 9 へ進める
