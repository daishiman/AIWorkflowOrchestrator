# wizard-tracking-stub.ts 実装内容と設計説明

## 実装ファイル: apps/desktop/e2e/helpers/wizard-tracking-stub.ts

## 設計根拠

- `TrackEventEntry` 型は `SkillWizardEvents` の mapped type から導出（AC-8 型整合）
- `initTrackingCapture`: `page.addInitScript` で `page.goto()` より前に `window.__trackEventCalls = []` を設定
- `getTrackedEvents`: `page.evaluate` で `window.__trackEventCalls ?? []` を返す
- `clearTrackedEvents`: `page.evaluate` で配列をリセット（各テストケース間で独立した計測を保証）
- `assertEventFired`: イベント名 + ペイロード部分一致でアサート

## 型整合確認

```bash
pnpm --filter @repo/desktop typecheck
# 結果: PASS（エラー 0 件）
```
