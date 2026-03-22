# Phase 11 Manual Test Checklist

| TC-ID    | シナリオ                               | 実施方法                               | 実施日時             | 実施者 | 結果 |
| -------- | -------------------------------------- | -------------------------------------- | -------------------- | ------ | ---- |
| TC-11-01 | API_KEY_MISSING / Settings CTA / light | Playwright capture + screenshot review | 2026-03-22 08:52 JST | Codex  | PASS |
| TC-11-02 | NETWORK_ERROR / Retry CTA / light      | Playwright capture + screenshot review | 2026-03-22 08:52 JST | Codex  | PASS |
| TC-11-03 | RATE_LIMIT / hint + Retry / dark       | Playwright capture + screenshot review | 2026-03-22 08:52 JST | Codex  | PASS |
| TC-11-04 | dismiss 後の回復状態 / light           | Playwright capture + screenshot review | 2026-03-22 08:52 JST | Codex  | PASS |
| TC-11-05 | VALIDATION_ERROR / no-action / dark    | Playwright capture + screenshot review | 2026-03-22 08:52 JST | Codex  | PASS |

## 実行コマンド

```bash
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop screenshot:workspace-chat-stream-error
```
