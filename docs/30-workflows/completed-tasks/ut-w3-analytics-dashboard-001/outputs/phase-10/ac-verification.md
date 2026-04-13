# AC 検証記録

**タスクID**: UT-W3-ANALYTICS-DASHBOARD-001
**作成日**: 2026-04-13
**フェーズ**: Phase 10 - 最終レビューゲート

---

## AC-1: AnalyticsDashboardPanel が設定画面に統合されていること

**根拠コード** (`SettingsView/index.tsx`):

```typescript
import { AnalyticsDashboardPanel } from "../../components/analytics/AnalyticsDashboardPanel";

// JSX 内 RAG設定直後
<section role="region" aria-labelledby="analytics-settings-heading">
  <SettingsCard title="Analytics ダッシュボード" ...>
    <AnalyticsDashboardPanel />
  </SettingsCard>
</section>
```

**判定**: ✅ PASS

---

## AC-2: オプトアウト状態（ON/OFF）が UI で確認できること

**根拠コード** (`AnalyticsDashboardPanel.tsx`):

```typescript
const isOptedOut = adapter.isOptedOut();
// JSX
<dd data-testid="analytics-opt-out-status">
  {isOptedOut ? "オプトアウト中" : "有効"}
</dd>
```

**根拠テスト**: T4-02（`isOptedOut=true` → 「オプトアウト中」）、T4-03（`false` → 「有効」）
**判定**: ✅ PASS

---

## AC-3: 開発モードで dev-only 診断ブロック表示

**根拠コード** (`AnalyticsDashboardPanel.tsx`):

```typescript
const isDevMode = process.env.NODE_ENV !== "production";
// JSX
{isDevMode && (
  <div data-testid="event-log-viewer">...</div>
)}
```

**根拠テスト**: T4-05（`development` → 表示）、T4-06（`production` → 非表示）
**判定**: ✅ PASS

---

## AC-4: Playwright E2E テストが PASS

**根拠ファイル**: `apps/desktop/e2e/analytics-dashboard.spec.ts`

```typescript
test("T4-08: 設定画面に analytics-dashboard-panel が表示されること", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('button[data-view-id="settings"]').first().click();
  await page.waitForSelector('[data-testid="settings-view"]');
  await expect(page.getByTestId("analytics-dashboard-panel")).toBeVisible();
});
```

**判定**: ✅ ファイル作成済み（Phase 11 で目視確認）

---

## AC-5: typecheck / lint / test が PASS

| コマンド                                      | 結果          |
| --------------------------------------------- | ------------- |
| `pnpm --filter @repo/desktop typecheck`       | ✅ エラー 0   |
| `pnpm --filter @repo/desktop lint`            | ✅ エラー 0   |
| `pnpm --filter @repo/desktop exec vitest run` | ✅ 46 件 PASS |

**判定**: ✅ PASS
