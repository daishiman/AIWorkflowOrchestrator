# Phase 6: テスト拡充 成果物

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 6                                        |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 追加したテストケース

`apps/desktop/src/__tests__/native/better-sqlite3-abi.test.ts` に以下を追加:

1. **複数テーブルの同時操作が正常動作すること** — 会話DB構造（conversations / messages）を模擬
2. **トランザクションが正常動作すること** — DB 書き込みの安全性確認

## postinstall 追加前後の動作比較

| シナリオ                                 | postinstall なし（修正前）     | postinstall あり（修正後） |
| ---------------------------------------- | ------------------------------ | -------------------------- |
| `pnpm install` 後の Electron 起動        | `ERR_DLOPEN_FAILED` が発生     | 正常起動                   |
| 新規クローン後の `pnpm install`          | 手動 rebuild が必要            | 自動 rebuild で即起動可能  |
| CI での `pnpm install --frozen-lockfile` | rebuild されないためクラッシュ | postinstall で自動修正     |

## テスト実行確認コマンド

```bash
pnpm --filter @repo/desktop test --reporter=verbose
```

## 完了条件チェック

- [x] 複数テーブル同時操作のテストケースが追加されている
- [x] トランザクションテストケースが追加されている
- [x] CI 環境での postinstall 検証手順が記述されている
- [x] クリーン環境での再現確認手順が記述されている
