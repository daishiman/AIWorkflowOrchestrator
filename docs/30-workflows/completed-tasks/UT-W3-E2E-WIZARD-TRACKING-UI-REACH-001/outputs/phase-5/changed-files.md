# Phase 5 変更ファイル一覧

## 新規作成ファイル

| ファイル                                           | 内容                                                    |
| -------------------------------------------------- | ------------------------------------------------------- |
| `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`  | Vite alias で差し替える renderer 側の trackEvent スタブ |
| `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` | `window.__trackEventCalls` capture ヘルパー             |
| `apps/desktop/e2e/skill-wizard-tracking.spec.ts`   | TC-03/05/06/08/09/11/12 の E2E テスト本体               |

## 修正ファイル

| ファイル                          | 変更内容                                                                   |
| --------------------------------- | -------------------------------------------------------------------------- |
| `apps/desktop/vite.e2e.config.ts` | `resolve.alias` に trackEvent.ts → trackEvent.e2e-stub.ts の差し替えを追加 |
| `.github/workflows/ci.yml`        | `e2e-desktop` ジョブを実際の Playwright 実行に改修（AC-9）                 |

## スタブ混入確認（grep 証跡）

```bash
grep -r "wizard-tracking-stub|trackEvent.e2e-stub" apps/desktop/src/
# 出力: なし（混入 0 件）
```
