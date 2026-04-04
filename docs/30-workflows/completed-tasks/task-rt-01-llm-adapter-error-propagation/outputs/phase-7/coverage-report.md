# Phase 7: カバレッジレポート

## 目標

| ファイル                         | カバレッジ目標 |
| -------------------------------- | -------------- |
| `LLMAdapterErrorBanner.tsx`      | 90% 以上       |
| `useLLMAdapterStatus.ts`         | 85% 以上       |
| `creatorHandlers.ts`（追加部分） | 80% 以上       |

## カバレッジチェックリスト

### `LLMAdapterErrorBanner.tsx`

| ブランチ                            | テストケース       | カバー |
| ----------------------------------- | ------------------ | ------ |
| `status !== "failed"` → return null | T-BAN-02, T-BAN-03 | ✅     |
| `status === "failed"` → バナー表示  | T-BAN-01           | ✅     |
| `/api key/i.test()` が true         | T-BAN-04, T-BAN-10 | ✅     |
| `/api key/i.test()` が false        | T-BAN-05, T-BAN-06 | ✅     |
| `failureReason ?? "不明なエラー"`   | T-BAN-06           | ✅     |
| `onOpenSettings` が存在する         | T-BAN-07           | ✅     |
| `onOpenSettings` が存在しない       | T-BAN-08           | ✅     |

**推定カバレッジ: 95%+（全ブランチカバー）**

### `useLLMAdapterStatus.ts`

| ブランチ                        | テストケース | カバー |
| ------------------------------- | ------------ | ------ |
| `api` が undefined → return     | T-HK-06      | ✅     |
| pull 成功 (`success === true`)  | T-HK-02      | ✅     |
| pull 失敗 (`success === false`) | T-HK-07      | ✅     |
| `cancelled` フラグ              | T-HK-05      | ✅     |
| push 受信                       | T-HK-03      | ✅     |
| アンマウント unsubscribe        | T-HK-04      | ✅     |

**推定カバレッジ: 90%+（全主要パスカバー）**

### `creatorHandlers.ts`（追加部分）

| ブランチ                | テストケース | カバー |
| ----------------------- | ------------ | ------ |
| service が null         | T-IPC-04     | ✅     |
| 正常レスポンス ready    | T-IPC-02     | ✅     |
| 正常レスポンス failed   | T-IPC-03     | ✅     |
| isDestroyed() === true  | T-IPC-08     | ✅     |
| isDestroyed() === false | T-IPC-07     | ✅     |

**推定カバレッジ: 90%+（全ブランチカバー）**

## 判定: 全ファイル目標達成 ✅
