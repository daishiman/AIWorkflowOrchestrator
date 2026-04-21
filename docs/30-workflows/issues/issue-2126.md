# [#2126] test(analytics): UT-W3-ANALYTICS-E2E-OPTOUT-TOGGLE-001 Analytics オプトアウト ON/OFF 切替 E2E 検証

## メタ情報

```yaml
issue_number: 2126
title: test(analytics): UT-W3-ANALYTICS-E2E-OPTOUT-TOGGLE-001 Analytics オプトアウト ON/OFF 切替 E2E 検証
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-04-13
updated_date: 2026-04-13
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2126
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

Analytics Dashboard のオプトアウト ON/OFF 切替が UI に正しく反映されることを E2E レベルで検証する。

## タスク仕様書

- タスクID: `UT-W3-ANALYTICS-E2E-OPTOUT-TOGGLE-001`
- 仕様書: `docs/30-workflows/unassigned-task/UT-W3-ANALYTICS-E2E-OPTOUT-TOGGLE-001.md`
- 優先度: Low
- 起票日: 2026-04-13

## 背景・動機（Why）

現在の `analytics-dashboard.spec.ts` は `T4-08`（panel の表示確認）のみを検証する。オプトアウト設定の ON/OFF 切替が UI に実際に反映されるかは E2E レベルで確認されていない。

ユニットテスト（`T6-03: isOptedOut の変化が反映`）では `rerender()` による同一マウントでの状態変化を確認しているが、実際の Electron 環境でのエンドツーエンドの動作保証がない。オプトアウトはユーザーのプライバシーに直接関わる設定のため、E2E レベルでの動作保証が重要。

## 達成目標（What）

- オプトアウト ON 状態で Analytics Dashboard が「オプトアウト中」を表示することを E2E で確認する
- オプトアウト OFF 状態で Analytics Dashboard が通常状態を表示することを E2E で確認する
- `wizard-tracking-stub.ts` の `storeValues` 拡張を活用して、テスト実行時に `analyticsOptOut` を任意の値に設定できることを活かす

## 実装方針（How）

### 設計

- `analytics-dashboard.spec.ts` に `T4-09` / `T4-10` として 2 ケースを追加する
- `injectOnboardingStoreMock(page, { hasCompleted: true, analyticsOptOut: true })` でオプトアウト ON 状態を再現する
- `AnalyticsDashboardPanel` の `data-testid` および表示テキストでアサーションを行う

### 実装ステップ

1. `apps/desktop/e2e/analytics-dashboard.spec.ts` に以下のテストを追加：

   **T4-09: analyticsOptOut=true 時に オプトアウト状態が表示されること**
   - `injectOnboardingStoreMock(page, { hasCompleted: true, analyticsOptOut: true })`
   - 設定画面 → `analytics-dashboard-panel` を取得
   - `getByText(/オプトアウト/i)` または `data-testid="opt-out-status"` の表示を確認

   **T4-10: analyticsOptOut=false 時に 通常状態が表示されること**
   - `injectOnboardingStoreMock(page, { hasCompleted: true, analyticsOptOut: false })`
   - 設定画面 → `analytics-dashboard-panel` を取得
   - オプトアウト表示がないことを確認、またはキュー件数が表示されることを確認

2. `AnalyticsDashboardPanel.tsx` に `data-testid="opt-out-status"` を追加（未設定の場合）

### 注意事項

- `wizard-tracking-stub.ts` の `storeValues` パラメータに `analyticsOptOut` を渡すには、`addInitScript` による初期化が `analyticsAdapter.ts` の `resolveOptOut()` 実行前に完了している必要がある
- `waitForLoadState("networkidle")` 後にアサーションすることで、非同期の `resolveOptOut()` 完了後の状態を確認できる

### 影響ファイル

```
apps/desktop/e2e/analytics-dashboard.spec.ts  # 変更（T4-09 / T4-10 追加）
apps/desktop/src/renderer/components/analytics/AnalyticsDashboardPanel.tsx  # 変更（data-testid追加、必要な場合）
```

## 完了条件チェックリスト

- [ ] `T4-09`: `analyticsOptOut=true` でオプトアウト状態が UI に表示される
- [ ] `T4-10`: `analyticsOptOut=false` で通常状態が UI に表示される
- [ ] 既存 `T4-08` が引き続き green
- [ ] `AnalyticsDashboardPanel.tsx` に適切な `data-testid` が追加されている（アサーションに必要な場合）

## 関連 Issue / タスク

- 前提タスク: UT-W3-ANALYTICS-DASHBOARD-001（完了）
- 関連タスク: UT-W3-ANALYTICS-ADAPTER-001（completed）
