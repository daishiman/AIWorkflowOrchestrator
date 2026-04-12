# スコープ境界の確定文書

## タスクID: UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001

## 含むもの

| ファイル                                           | 種別     | 説明                                                   |
| -------------------------------------------------- | -------- | ------------------------------------------------------ |
| `apps/desktop/e2e/skill-wizard-tracking.spec.ts`   | 新規作成 | Playwright E2E テストファイル（本体）                  |
| `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` | 新規作成 | trackEvent スタブ注入ヘルパー                          |
| `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`  | 新規作成 | renderer の trackEvent 差し替え用 E2E スタブ           |
| `.github/workflows/ci.yml`                         | 修正     | E2E テスト実行ステップ追加（`e2e-desktop` ジョブ改修） |
| `apps/desktop/vite.e2e.config.ts`                  | 修正     | trackEvent の E2E alias 追加                           |

## 含まないもの

| 項目                                                                      | 理由                                       |
| ------------------------------------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/renderer/utils/trackEvent.ts` の変更                    | 本番コードの変更は禁止（スタブで差し替え） |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` の変更 | 本番コードの変更は禁止                     |
| 既存ユニットテストの変更                                                  | 本タスクのスコープ外                       |
| 外部アナリティクスサービスへの実送信                                      | スタブで capture するのみ                  |
