# UT-W3-ANALYTICS-E2E-OPTOUT-TOGGLE-001: Analytics オプトアウト ON/OFF 切替の E2E 検証

## メタ情報

| 項目         | 値                                                                                |
| ------------ | --------------------------------------------------------------------------------- |
| ステータス   | 未着手                                                                            |
| 優先度       | Low                                                                               |
| 起票日       | 2026-04-13                                                                        |
| issue番号    | #2126                                                                             |
| 起票元       | UT-W3-ANALYTICS-DASHBOARD-001 Phase 12（ブランチ状況分析での指摘）                |
| 関連タスク   | UT-W3-ANALYTICS-DASHBOARD-001（完了）<br>UT-W3-ANALYTICS-ADAPTER-001（completed） |
| 対象ファイル | `apps/desktop/e2e/analytics-dashboard.spec.ts`（既存 E2E に追加）                 |

---

## 1. なぜこのタスクが必要か（Why）

現在の `analytics-dashboard.spec.ts` は `T4-08`（panel の表示確認）のみを検証する。オプトアウト設定の ON/OFF 切替が UI に実際に反映されるかは E2E レベルで確認されていない。

ユニットテスト（`T6-03: isOptedOut の変化が反映`）では `rerender()` による同一マウントでの状態変化を確認しているが、実際の Electron 環境で `electronAPI.store.set` → `analyticsOptOut` 変化 → Dashboard 表示反映のエンドツーエンドの動作が保証されていない。

オプトアウトはユーザーのプライバシーに直接関わる設定のため、E2E レベルでの動作保証が重要である。

---

## 2. 何を達成するか（What）

- オプトアウト ON 状態で Analytics Dashboard が「オプトアウト中」を表示することを E2E で確認する
- オプトアウト OFF 状態で Analytics Dashboard が通常状態を表示することを E2E で確認する
- `wizard-tracking-stub.ts` の `storeValues` 拡張（UT-W3-ANALYTICS-DASHBOARD-001 で実装済み）を活用して、テスト実行時に `analyticsOptOut` を任意の値に設定できることを活かす

---

## 3. どのように実行するか（How）

### 設計方針

- `analytics-dashboard.spec.ts` に `T4-09` / `T4-10` として 2 ケースを追加する
- `injectOnboardingStoreMock(page, { hasCompleted: true, analyticsOptOut: true })` でオプトアウト ON 状態を再現する
- `AnalyticsDashboardPanel` の `data-testid` および表示テキストでアサーションを行う

### 実装ステップ

1. `apps/desktop/e2e/analytics-dashboard.spec.ts` に以下のテストを追加：

   **T4-09: analyticsOptOut=true 時に オプトアウト状態が表示されること**
   - `injectOnboardingStoreMock(page, { hasCompleted: true, analyticsOptOut: true })`
   - 設定画面 → `analytics-dashboard-panel` を取得
   - `getByText(/オプトアウト/i)` または `data-testid="opt-out-status"` などの表示を確認

   **T4-10: analyticsOptOut=false 時に 通常状態が表示されること**
   - `injectOnboardingStoreMock(page, { hasCompleted: true, analyticsOptOut: false })`
   - 設定画面 → `analytics-dashboard-panel` を取得
   - オプトアウト表示がないことを確認、またはキュー件数が表示されることを確認

2. `AnalyticsDashboardPanel.tsx` に `data-testid="opt-out-status"` を追加（未設定の場合）
   - 現在の表示内容を確認してアサーション可能な要素を特定する

### 注意事項

- `wizard-tracking-stub.ts` の `storeValues` パラメータに `analyticsOptOut` を渡すには、`addInitScript` による初期化が `analyticsAdapter.ts` の `resolveOptOut()` 実行前に完了している必要がある
- `waitForLoadState("networkidle")` 後にアサーションすることで、非同期の `resolveOptOut()` 完了後の状態を確認できる

---

## 3.5 苦戦箇所と解決策（UT-W3-ANALYTICS-DASHBOARD-001 での知見）

| 苦戦箇所                                                    | 原因                                                                                                       | 解決策                                                                                   |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| E2E でオンボーディングモーダルが被さる                      | `onboarding.hasCompleted` が false のためモーダルが出現し、設定画面に到達できない                          | `injectOnboardingStoreMock` に `hasCompleted: true` を渡して事前にモーダルをスキップする |
| `analyticsOptOut` の初期値が非同期で解決される              | `resolveOptOut()` は非同期で store から値を取得するため、mount 直後は `lastKnownOptOut = false` のまま     | `waitForLoadState("networkidle")` で非同期完了を待ってからアサーションする               |
| `storeValues` の型定義が `AnalyticsOptOut` を含まない可能性 | `wizard-tracking-stub.ts` の `storeValues` の型が `analyticsOptOut` を含んでいない場合、型エラーが発生する | 型定義に `analyticsOptOut?: boolean` を追加するか、`as` キャストを使用する               |

---

## 4. 実行手順

1. `AnalyticsDashboardPanel.tsx` の現在の表示内容を確認し、アサーション可能な `data-testid` を特定する
2. `analytics-dashboard.spec.ts` に T4-09 / T4-10 を追加する
3. 必要に応じて `AnalyticsDashboardPanel.tsx` に `data-testid="opt-out-status"` を追加する
4. E2E テストを実行して green を確認する

---

## 5. 完了条件チェックリスト

- [ ] `T4-09`: `analyticsOptOut=true` でオプトアウト状態が UI に表示される
- [ ] `T4-10`: `analyticsOptOut=false` で通常状態が UI に表示される
- [ ] 既存 `T4-08` が引き続き green
- [ ] `AnalyticsDashboardPanel.tsx` に適切な `data-testid` が追加されている（アサーションに必要な場合）

---

## 6. 検証方法

```bash
# Analytics E2E テスト実行
pnpm --filter @repo/desktop e2e -- analytics-dashboard

# 全 E2E テスト実行（デグレ確認）
pnpm --filter @repo/desktop e2e
```

---

## 7. リスクと対策

- **リスク**: `storeValues.analyticsOptOut` が `addInitScript` で設定される前に `resolveOptOut()` が実行される
- **対策**: `page.addInitScript` は `goto()` よりも前に実行されるため、`injectOnboardingStoreMock` を `goto` より前に呼び出していれば問題ない（現在の `analytics-dashboard.spec.ts` は正しい順序）

---

## 8. 参照情報

- `apps/desktop/e2e/analytics-dashboard.spec.ts`（既存 T4-08 の追加先）
- `apps/desktop/e2e/helpers/wizard-tracking-stub.ts`（`storeValues` 拡張実装）
- `apps/desktop/src/renderer/components/analytics/AnalyticsDashboardPanel.tsx`（対象コンポーネント）
- `apps/desktop/src/renderer/utils/analyticsAdapter.ts`（`resolveOptOut()` の動作）

---

## 9. 備考

本タスクは Low 優先度の品質改善タスク。ユニットテストで `T6-03` にて `isOptedOut` 変化の検証は済んでいるが、実際の Electron 環境での E2E 保証として追加価値がある。
着手時は `AnalyticsDashboardPanel.tsx` の現在の表示ロジックを読み、`isOptedOut()` が `true` の場合に何が表示されるかを確認してからアサーションを設計すること。
