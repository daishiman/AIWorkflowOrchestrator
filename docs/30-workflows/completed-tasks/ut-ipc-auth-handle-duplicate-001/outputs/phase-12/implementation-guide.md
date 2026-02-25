# 実装ガイド

## Part 1: 中学生向けの説明（やさしい版）

### これは何を直したのか

この修正は、同じ作業を5回くり返していた部分を、1つのやり方にまとめたものです。

### 日常のたとえ

学校で、同じお知らせを5クラスに配るとき、
毎回ゼロから同じ文を書いて配るより、
「お知らせ配布テンプレート」を1つ作って配るほうがミスが減ります。

今回の修正は、まさにこの「テンプレート化」です。

### 何が良くなったか

| 良くなった点 | 内容                               |
| ------------ | ---------------------------------- |
| ミスが減る   | 追加や修正の場所が1か所に近づく    |
| 見つけやすい | 認証IPCの登録ルールを追いやすい    |
| 監査しやすい | 重複コードが消え、差分が読みやすい |

---

## Part 2: 技術者向け詳細

### 変更対象

- `apps/desktop/src/main/ipc/authHandlers.ts`
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`

### 実装方針

1. `authHandlers.ts` に共通登録ヘルパー `registerValidatedAuthHandler` を導入
2. `AUTH_*` 5チャネルをヘルパー経由で登録
3. fallback経路（Supabase未設定時）も配列 + ループ登録へ統一
4. fallback応答互換の回帰テストを追加

### 主要型・契約

- 対象チャネル:
  `AUTH_LOGIN`, `AUTH_LOGOUT`, `AUTH_GET_SESSION`, `AUTH_REFRESH`, `AUTH_CHECK_ONLINE`
- 応答契約:
  `IPCResponse<T>` を維持
- セキュリティ:
  通常経路は `withValidation` を維持

### エッジケース

| ケース                      | 挙動                                          |
| --------------------------- | --------------------------------------------- |
| 不正providerでlogin         | `AUTH_ERROR_CODES.INVALID_PROVIDER`           |
| refresh tokenなし           | `AUTH_ERROR_CODES.REFRESH_FAILED`             |
| Supabase未設定              | `AUTH_NOT_CONFIGURED`（login/logout/refresh） |
| Supabase未設定でget-session | `success: true, data: null`                   |

### 検証コマンド

```bash
cd apps/desktop
./node_modules/.bin/vitest run src/main/ipc/authHandlers.test.ts src/main/ipc/__tests__/ipc-double-registration.test.ts
./node_modules/.bin/tsc --noEmit
```

### 監査コマンド

```bash
rg -n "ipcMain\.handle\(\s*IPC_CHANNELS\.AUTH_" apps/desktop/src/main/ipc/authHandlers.ts apps/desktop/src/main/ipc/index.ts
```

期待結果: 0件
