# Phase 9: 品質保証

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 9                           |
| 機能名 | fix-ipc-timeout-per-channel |
| 作成日 | 2026-04-01                  |

## 目的

実装・リファクタリング完了後、出荷品質を確認するためのチェックリストを実施する。

---

## 自動品質チェック

```bash
# 1. 型チェック
pnpm --filter @repo/desktop typecheck

# 2. Lint チェック
pnpm --filter @repo/desktop lint

# 3. テスト（関連テストすべて）
pnpm --filter @repo/desktop vitest run

# 4. ビルド確認
pnpm --filter @repo/desktop build
```

---

## 品質チェックリスト

### コード品質

- [ ] `CHANNEL_TIMEOUTS` が `ipc-utils.ts` に追加されている
- [ ] `getChannelTimeout` が `export` されている
- [ ] `getChannelTimeout` の戻り値型が `number` である
- [ ] `invokeWithTimeout` が `getChannelTimeout(channel)` を使っている
- [ ] `IPC_TIMEOUT_MS` の値（5000）が変わっていない

### 後方互換性

- [ ] `invokeWithTimeout` の引数の型シグネチャが変わっていない
- [ ] `invokeWithTimeout` の戻り値の型シグネチャが変わっていない
- [ ] 呼び出し元（`index.ts` / `skill-api.ts` / `skill-creator-api.ts`）に変更が不要である
- [ ] 既存テストが全て PASS している

### チャンネル別タイムアウト正確性

- [ ] `auth:login` が `500ms` を使う
- [ ] `auth:get-session` が `10000ms` を使う
- [ ] `auth:refresh` が `10000ms` を使う
- [ ] `skill-creator:plan` が `30000ms` を使う
- [ ] `skill:execute` が `60000ms` を使う
- [ ] 未定義チャンネルが `5000ms`（`IPC_TIMEOUT_MS`）を使う

### セキュリティ・安全性

- [ ] `CHANNEL_TIMEOUTS` のキーが IPC チャンネル名文字列のみである
- [ ] タイムアウト値が全て正の整数である
- [ ] フォールバックが `IPC_TIMEOUT_MS` に正しく動作する

---

## 共通品質ゲート

| チェック項目          | コマンド                                 | 結果   |
| --------------------- | ---------------------------------------- | ------ |
| TypeScript 型チェック | `pnpm --filter @repo/desktop typecheck`  | （未） |
| ESLint                | `pnpm --filter @repo/desktop lint`       | （未） |
| ユニットテスト        | `pnpm --filter @repo/desktop vitest run` | （未） |
| ビルド                | `pnpm --filter @repo/desktop build`      | （未） |

全て PASS の場合 → Phase 10 へ進む
いずれかが FAIL の場合 → 原因を修正し、再度チェックする

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] 全チェックリストが確認されている
- [ ] Phase 10 へ進める
