# 受入基準（Acceptance Criteria）

**タスクID**: UT-W3-ANALYTICS-DASHBOARD-001
**作成日**: 2026-04-13
**フェーズ**: Phase 1 - 要件定義

---

## AC-1: 設定画面に AnalyticsDashboardPanel が統合されていること

- **検証方法**: コードレビュー / 目視
- **検証箇所**: `apps/desktop/src/renderer/views/SettingsView/index.tsx` に `AnalyticsDashboardPanel` のインポート・利用が確認できること
- **data-testid**: `analytics-dashboard-panel`
- **配置位置**: RAG設定セクションの直後（末尾付近）

## AC-2: オプトアウト状態の現在値（ON/OFF）が UI で確認できること

- **検証方法**: コードレビュー / 目視
- **検証箇所**: `AnalyticsDashboardPanel` 内で `analyticsAdapter.isOptedOut()` の返り値が `true`/`false` としてラベル表示されること
- **data-testid**: `analytics-opt-out-status`
- **表示文言**:
  - `isOptedOut() === true` → 「オプトアウト中」
  - `isOptedOut() === false` → 「有効」

## AC-3: 開発モード（NODE_ENV !== 'production'）で dev-only 診断ブロックが表示されること

- **検証方法**: テスト PASS / 目視
- **検証箇所**: `NODE_ENV !== 'production'` の条件分岐で `event-log-viewer` が表示されること
- **data-testid**: `event-log-viewer`
- **本番環境**: `NODE_ENV === 'production'` では完全に非表示（DOM から除外）

## AC-4: Playwright E2E テストが PASS すること

- **検証方法**: `pnpm --filter @repo/desktop exec playwright test` PASS
- **検証箇所**: `apps/desktop/e2e/analytics-dashboard.spec.ts` が全て PASS
- **テスト内容**: 設定画面に `[data-testid="analytics-dashboard-panel"]` が表示されていること

## AC-5: `pnpm typecheck && pnpm lint && pnpm test` が PASS すること

- **検証方法**: CI PASS
- **検証箇所**: Phase 9 で全コマンドを実行し、全て 0 エラー / 全テスト GREEN
- **対象コマンド**:
  - `pnpm --filter @repo/desktop typecheck`
  - `pnpm --filter @repo/desktop lint`
  - `pnpm --filter @repo/desktop test`

---

## 受入基準サマリー

| AC番号 | 概要                                       | 優先度 |
| ------ | ------------------------------------------ | ------ |
| AC-1   | `AnalyticsDashboardPanel` が設定画面に統合 | Must   |
| AC-2   | オプトアウト状態（ON/OFF）が UI で確認可能 | Must   |
| AC-3   | 開発モードで dev-only 診断ブロック表示     | Must   |
| AC-4   | Playwright E2E テスト PASS                 | Must   |
| AC-5   | typecheck / lint / test 全 PASS            | Must   |
