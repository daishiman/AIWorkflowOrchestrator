# Phase 9 — 品質確認

## メタ情報

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| ドキュメントID | UT-FIX-IPC-MAIN-HANDLER-IMPL-001-PH9 |
| フェーズ       | Phase 9（品質確認）                  |
| ステータス     | completed                            |
| 前フェーズ     | Phase 8（リファクタリング）          |
| 次フェーズ     | Phase 10（最終レビュー）             |

---

## 1. Rule-2 PASS 確認

```bash
node scripts/verify-ipc-4layer.cjs
```

期待する出力（Rule-2 部分）:

```
[Rule-2] preload invoke ホワイトリストのチャネルが main ハンドラに未実装: PASS
  違反チャネル数: 0
```

この確認が FAIL の場合、Phase 10 以降には進まないこと。

---

## 2. TypeScript 型エラーなし確認

```bash
pnpm --filter @repo/desktop typecheck
```

期待する出力: エラーなし（exit code 0）

**確認ポイント:**

- `any` 型が使用されていないこと
- `IPCResponse<T>` の型パラメータが適切に設定されていること
- 新規追加したハンドラ引数の型がすべて明示されていること

---

## 3. ESLint エラーなし確認

```bash
pnpm --filter @repo/desktop lint
```

期待する出力: エラーなし（exit code 0）

---

## 4. 既存テスト全 PASS 確認

```bash
pnpm --filter @repo/desktop test
```

期待する出力: すべてのテストが PASS（exit code 0）

---

## 5. セキュリティバリデーション確認

### 5.1 `auth:test-callback` の本番環境ガード

最重要のセキュリティチェック。以下の条件をすべて満たすこと。

```bash
# 本番環境ガードの実装を確認
grep -n "NODE_ENV.*production\|production.*NODE_ENV" apps/desktop/src/main/ipc/authHandlers.ts
```

確認項目:

- [x] `process.env.NODE_ENV === 'production'` のチェックが存在する
- [x] 本番環境時は即座に `{ success: false }` を返す（処理を一切行わない）
- [x] `NODE_ENV` が未設定（`undefined`）の場合も本番扱いとなること、またはドキュメントに挙動が明記されていること

**NG パターン（使用禁止）:**

```typescript
// NG: NODE_ENV が 'production' 以外のすべて（undefined を含む）を開発扱いにしてしまう
if (process.env.NODE_ENV !== "production") {
  // この形式は NODE_ENV=undefined でも通過してしまう
}
```

**OK パターン:**

```typescript
// OK: 明示的に開発環境のみ許可
if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
  return { success: false, error: { code: "FORBIDDEN", message: "..." } };
}
// または
if (process.env.NODE_ENV === "production") {
  return { success: false, error: { code: "FORBIDDEN", message: "..." } };
}
// ※ どちらを採用するかは既存コードベースの慣習に従うこと
```

### 5.2 IPC 送信元バリデーション（Sender Validation）

追加したハンドラすべてで `validateIpcSender()` または `withValidation()` によるホワイトリスト検証が実施されていること。

```bash
# agentHandlers.ts の新規ハンドラで validateIpcSender が使われているか
grep -A 5 "AGENT_GET_SKILLS\|AGENT_GET_SKILL_DETAIL\|AGENT_EXECUTE\|AGENT_PERMISSION_RESPOND" apps/desktop/src/main/ipc/agentHandlers.ts | grep "validateIpcSender"

# authHandlers.ts の新規ハンドラで withValidation が使われているか
grep -B 2 "AUTH_START_OAUTH_FLOW\|AUTH_TEST_CALLBACK" apps/desktop/src/main/ipc/authHandlers.ts | grep "registerValidatedAuthHandler\|withValidation"
```

期待する出力: 各ハンドラに対してバリデーション呼び出しが存在すること。

### 5.3 引数バリデーション

各ハンドラで受け取る引数の型チェックが実施されていること。

| ハンドラ                   | 必須バリデーション                                      |
| -------------------------- | ------------------------------------------------------- |
| `auth:start-oauth-flow`    | `provider` が文字列かつ有効なプロバイダー名であること   |
| `auth:test-callback`       | `callbackUrl` が非空文字列であること                    |
| `settings:get`             | `key` が非空文字列であること（`validateStoreKey` 使用） |
| `settings:update`          | `key` が非空文字列、`value` が存在すること              |
| `agent:get-skill-detail`   | `skillId` が非空文字列であること                        |
| `agent:execute`            | `prompt` が文字列であること                             |
| `agent:permission-respond` | `requestId` が文字列、`approved` が boolean であること  |

### 5.4 エラーメッセージのサニタイズ

内部エラーメッセージをレンダラーに直接露出していないこと。

```bash
# catch ブロックで直接 error.message を返していないか確認
grep -n "error\.message" apps/desktop/src/main/ipc/authHandlers.ts apps/desktop/src/main/ipc/agentHandlers.ts
```

`authHandlers.ts` では `sanitizeErrorMessage()` 経由であること。`agentHandlers.ts` では `throw` 形式のため catch ブロックでのサニタイズは不要だが、ログ出力時に機密情報が含まれないこと。

---

## 6. 品質確認チェックリスト

| 確認項目                                    | 結果 |
| ------------------------------------------- | ---- |
| Rule-2 違反チャネル数: 0                    | [x]  |
| TypeScript 型エラーなし                     | [x]  |
| ESLint エラーなし                           | [x]  |
| 既存テスト全 PASS                           | [x]  |
| `auth:test-callback` 本番環境ガード実装済み | [x]  |
| 全新規ハンドラに IPC Sender Validation あり | [x]  |
| 全新規ハンドラに引数バリデーションあり      | [x]  |
| `any` 型使用なし                            | [x]  |
| エラーメッセージサニタイズ実施済み          | [x]  |

すべての項目にチェックが付いた状態で Phase 10 へ進むこと。
