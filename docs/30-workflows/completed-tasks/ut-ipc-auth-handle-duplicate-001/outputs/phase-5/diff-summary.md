# Phase 5 差分一覧

| ファイル                                                              | 変更種別 | 変更概要                                   |
| --------------------------------------------------------------------- | -------- | ------------------------------------------ |
| `apps/desktop/src/main/ipc/authHandlers.ts`                           | refactor | AUTH 5チャネル登録を共通ヘルパー経由へ統一 |
| `apps/desktop/src/main/ipc/index.ts`                                  | refactor | fallback AUTH 5チャネル登録を配列+ループ化 |
| `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` | test     | fallback登録/応答互換の回帰テスト3件追加   |

## 差分の性質

- 仕様変更: なし
- 公開契約変更: なし
- 主要変更: 登録方式の重複排除（構造改善）
