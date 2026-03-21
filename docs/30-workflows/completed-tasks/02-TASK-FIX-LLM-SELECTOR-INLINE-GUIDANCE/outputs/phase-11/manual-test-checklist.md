# Phase 11 Manual Test Checklist

| TC-ID    | シナリオ                                   | 実施方法                      | 実施日時             | 実施者 | 結果 |
| -------- | ------------------------------------------ | ----------------------------- | -------------------- | ------ | ---- |
| TC-11-01 | ChatView guidance banner と Settings CTA   | Playwright capture + metadata | 2026-03-21 09:20 JST | Codex  | PASS |
| TC-11-02 | Workspace blocked guidance と Settings CTA | Playwright capture + metadata | 2026-03-21 09:20 JST | Codex  | PASS |
| TC-11-03 | ChatView dark theme guidance               | Playwright capture + metadata | 2026-03-21 09:20 JST | Codex  | PASS |
| TC-11-04 | ChatView CTA keyboard focus                | Playwright capture + metadata | 2026-03-21 09:20 JST | Codex  | PASS |

## 実行コマンド

```bash
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop screenshot:llm-selector-inline-guidance
```
