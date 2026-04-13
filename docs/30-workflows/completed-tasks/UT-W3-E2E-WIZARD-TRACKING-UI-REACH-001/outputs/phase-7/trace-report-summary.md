# Phase 7 トレースレポートサマリー

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec playwright test e2e/skill-wizard-tracking.spec.ts --project=chromium --trace on --reporter=html
```

## UI 到達証跡

本タスクは NON_VISUAL（E2E テストコード・設定変更のみ）のため、
Playwright HTML レポートを代替証跡として使用。

各 TC の `window.__trackEventCalls` 記録がイベント発火の証跡。
