# Phase 11: 手動テスト結果

## 実行形態

NON_VISUAL

## 理由

- `apps/desktop/src/main/ipc/index.ts` の runtime 注入に閉じた変更であり、新しい画面要素はない
- 既存 ExecutionConsole の表示要件は IPC 応答値の整合で確認できる

## テスト結果

| テストケース | 内容                                       | 結果 | 証跡                                                             |
| ------------ | ------------------------------------------ | ---- | ---------------------------------------------------------------- |
| NV-11-01     | subscription 時に `Claude Code CLI` を返す | PASS | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` |
| NV-11-02     | api-key 時に `Anthropic API` を返す        | PASS | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` |
| NV-11-03     | fallback で `unknown` を返す               | PASS | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` |
| NV-11-04     | API key / token 非含有                     | PASS | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` |
| NV-11-05     | 不正 sender は `UNAUTHORIZED`              | PASS | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` |

## 補足

- branch 内の `GovernanceSummaryPanel` 追加は別 task であり、本 workflow の Phase 11 証跡として流用しない
