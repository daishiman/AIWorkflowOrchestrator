# Phase 4 E2E テストスケルトン（TDD Red → Green）

## Red 確認

Phase 4 でスケルトンを作成した時点では `wizard-tracking-stub.ts` が未実装のため FAIL（Red）。
Phase 5 の実装後に全件 PASS（Green）。

## 実装ファイル

- `apps/desktop/e2e/skill-wizard-tracking.spec.ts` — テスト本体（TC-03/05/06/08/09/11/12）
- `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` — capture ヘルパー
- `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts` — renderer 差し替えスタブ

## ステータス: Phase 5 実装後に Green 確認済み
