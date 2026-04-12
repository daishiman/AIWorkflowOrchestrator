# スコープ境界の確定文書

## 含むもの

- `apps/desktop/e2e/skill-wizard-tracking.spec.ts`（新規）
- `apps/desktop/e2e/helpers/wizard-tracking-stub.ts`（新規）
- `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`（新規）
- `.github/workflows/ci.yml`（`e2e-desktop` ジョブ改修）
- `apps/desktop/vite.e2e.config.ts`（trackEvent alias 追加）

## 含まないもの

- `apps/desktop/src/renderer/utils/trackEvent.ts`（変更禁止）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（変更禁止）
- 既存ユニットテストの変更
- 外部アナリティクスサービスへの実送信
