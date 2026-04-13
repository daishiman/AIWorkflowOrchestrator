# Phase 5: 実装

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 5                             |
| 機能名 | UT-W3-ANALYTICS-DASHBOARD-001 |
| 前提   | Phase 4（Red 確認済み）       |
| 後続   | Phase 6（テスト拡充）         |
| 作成日 | 2026-04-13                    |
| Issue  | #2098                         |

## 目的

TDD Green フェーズ。Phase 4 で Red にしたテストをすべて PASS させるため、
`AnalyticsDashboardPanel` を実装し、`SettingsView` に統合する。

- `AnalyticsDashboardPanel` を新規作成する
- 開発モードの診断ブロックを内部に持たせる
- `SettingsView` に `AnalyticsDashboardPanel` を統合する

---

## 実行タスク

- **タスク1**: 実装前の既存テスト baseline 確認
- **タスク2**: `AnalyticsDashboardPanel.tsx` 新規作成
- **タスク3**: `SettingsView/index.tsx` への統合
- **タスク4**: `SettingsView.test.tsx` への統合テスト追加
- **タスク5**: Green 確認（Phase 4 テストが PASS になること）

---

## 参照資料

| 資料名                   | パス                                                  | 説明                        |
| ------------------------ | ----------------------------------------------------- | --------------------------- |
| Phase 4 テストマトリクス | `outputs/phase-4/test-matrix.md`                      | Green にすべき T4-01〜T4-08 |
| analyticsAdapter 実装    | `apps/desktop/src/renderer/utils/analyticsAdapter.ts` | `isOptedOut()`, `getQueueSi |
| Red確認結果              | `outputs/phase-4/red-confirmation.md`                 | Phase 4 成果物              |

ze()`API    |
| SettingsView 実装        |`apps/desktop/src/renderer/views/SettingsView/index.tsx`            | 統合先コンポーネント（修正対象）       |
| SettingsView テスト      |`apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx` | 既存テスト回帰確認対象 |

---

## 実装計画

### 新規作成ファイル

| ファイル                                                                     | 変更種別 | 変更内容                                                         |
| ---------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/analytics/AnalyticsDashboardPanel.tsx` | 新規作成 | analytics ダッシュボード本体。統計表示と dev-only 診断を内包する |

### 修正ファイル

| ファイル                                                             | 変更種別 | 変更内容                                               |
| -------------------------------------------------------------------- | -------- | ------------------------------------------------------ |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`             | 修正     | `AnalyticsDashboardPanel` を import し、セクション追加 |
| `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx` | 修正     | `AnalyticsDashboardPanel` の vi.mock 追加              |

---

## 実装方針（重要な設計判断）

### AnalyticsDashboardPanel の設計

- `getAnalyticsAdapter()` をコンポーネント内で直接呼び出す
- `queuedEventCount` と `isOptedOut` を同期で表示する
- dev-only 診断ブロックは内部の表示領域として扱い、`data-testid="event-log-viewer"` を持たせる
- 追加の IPC、Preload、Store は導入しない

```typescript
import { getAnalyticsAdapter } from "../../utils/analyticsAdapter";

export interface AnalyticsDashboardPanelProps {
  className?: string;
}
```

### `NODE_ENV` による分岐

```typescript
const isDevMode = process.env.NODE_ENV !== "production";
```

`isDevMode` が true のときだけ `event-log-viewer` を描画する。

### data-testid 命名

| 要素                   | data-testid                 |
| ---------------------- | --------------------------- |
| パネル全体             | `analytics-dashboard-panel` |
| オプトアウト状態ラベル | `analytics-opt-out-status`  |
| キューサイズ表示       | `analytics-queue-size`      |
| 診断ブロック           | `event-log-viewer`          |

---

## 実行手順

### ステップ0: 既存テスト baseline 確認【必須】

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/SettingsView/SettingsView.test.tsx
```

- [ ] 既存テストが GREEN であることを確認済み

### ステップ1: `AnalyticsDashboardPanel.tsx` の実装

1. `getAnalyticsAdapter()` を呼び出して現在値を取得する
2. `data-testid="analytics-dashboard-panel"` を持つラッパーを実装する
3. `analytics-opt-out-status` と `analytics-queue-size` を表示する
4. `NODE_ENV !== 'production'` のときのみ `event-log-viewer` を表示する

### ステップ2: `SettingsView/index.tsx` への統合

1. `AnalyticsDashboardPanel` を import する
2. 既存の `SettingsCard` 群の後半に analytics セクションを追加する
3. `SettingsView` のレイアウトが崩れないことを確認する

### ステップ3: `SettingsView.test.tsx` への統合テスト追加

`AnalyticsDashboardPanel` を vi.mock でスタブ化し、
SettingsView テスト内に統合確認テストを追加する。

### ステップ4: Green 確認

```bash
# Phase 4 で追加したテストが GREEN になることを確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx

pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/SettingsView/SettingsView.test.tsx
```

---

## 統合テスト連携

- `AnalyticsDashboardPanel` は `SettingsView` に統合されるため、`SettingsView.test.tsx` に回帰ケースを追加する
- dev-only 診断ブロックの分岐は `AnalyticsDashboardPanel.test.tsx` で確認する

---

## サブタスク管理

| ID     | タスク名                       | ステータス |
| ------ | ------------------------------ | ---------- |
| T-05-1 | 既存テスト baseline 確認       | 未実施     |
| T-05-2 | `AnalyticsDashboardPanel` 実装 | 未実施     |
| T-05-3 | `SettingsView` 統合            | 未実施     |
| T-05-4 | `SettingsView.test.tsx` 追加   | 未実施     |
| T-05-5 | Green 確認                     | 未実施     |

---

## 成果物

| 成果物         | 配置先                                     | 形式     |
| -------------- | ------------------------------------------ | -------- |
| 実装結果       | `outputs/phase-5/implementation-result.md` | Markdown |
| Green 確認結果 | `outputs/phase-5/green-confirmation.md`    | Markdown |

---

## 完了条件

- [ ] `AnalyticsDashboardPanel.tsx` が `data-testid="analytics-dashboard-panel"` を持って実装されていること
- [ ] `event-log-viewer` が `NODE_ENV !== "production"` のときのみ表示されること
- [ ] `SettingsView/index.tsx` に `AnalyticsDashboardPanel` が統合されていること
- [ ] `SettingsView.test.tsx` の既存テストが壊れていないこと
- [ ] `AnalyticsDashboardPanel.test.tsx` が PASS していること
- [ ] `outputs/phase-5/` に全成果物が生成されていること

---

## 次Phase

**Phase 6: テスト拡充** — boundary と regression を追加して、診断ブロックと統合の安定性を補強する。

**Phase 5 開始条件**: Phase 4 の Red テストが準備済みであること。
