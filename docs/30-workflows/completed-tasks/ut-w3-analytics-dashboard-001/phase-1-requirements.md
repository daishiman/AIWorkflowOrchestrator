# Phase 1: 要件定義

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 1                             |
| 機能名 | ut-w3-analytics-dashboard-001 |
| 作成日 | 2026-04-13                    |

## 目的

設定画面に Analytics ダッシュボード UI を追加するための要件を定義し、
修正範囲・受入基準・依存関係を確定する。
既存の `analyticsAdapter.ts` が持つ `getQueueSize()` / `isOptedOut()` を直接再利用し、
`AnalyticsDashboardPanel` 内の dev-only 診断ブロックで AC-3 を満たす。
追加の IPC、Preload API、状態ストアは導入しない。

---

## Step 0: P50チェック【必須】

Phase 1 開始前に、対象ファイルの実装状態を確認し、既実装コードとの重複・齟齬を防止する。

```bash
# analyticsAdapter の現在の公開インターフェース確認
grep -n "export\|interface\|getQueueSize\|isOptedOut\|flush" \
  apps/desktop/src/renderer/utils/analyticsAdapter.ts

# trackEvent の dev/prod 分岐確認
grep -n "NODE_ENV\|console.info\|getAnalyticsAdapter" \
  apps/desktop/src/renderer/utils/trackEvent.ts

# 設定画面のコンポーネント構造確認
find apps/desktop/src/renderer/views/SettingsView -name "*.tsx" 2>/dev/null

# 既存の analytics ストア設定確認
grep -rn "analyticsOptOut\|analytics" apps/desktop/src/renderer/store/ 2>/dev/null | head -20
```

**確認事項**:

- [ ] `analyticsAdapter.ts` に `getQueueSize()` または相当する公開APIが存在すること（または不在を確認）
- [ ] `analyticsAdapter.ts` に `isOptedOut()` または相当する公開APIが存在すること（または不在を確認）
- [ ] 設定画面コンポーネント（`apps/desktop/src/renderer/views/SettingsView/index.tsx`）が既に存在すること
- [ ] `analyticsOptOut` の状態管理がどこで行われているかを確認済みであること

---

## 実行タスク

- **タスク1**: P50チェック — 対象ファイルの現状実装状態を確認
- **タスク2**: 問題分析 — 現状のAnalytics基盤で設定画面表示に不足しているAPIを特定
- **タスク3**: スコープ確定 — 変更ファイル一覧・変更種別・スコープ外の明確化
- **タスク4**: 受入基準（AC-1〜AC-5）の定義
- **タスク5**: 依存関係・前提条件の整理

---

## 受入基準

| AC番号 | 基準                                                                                            | 検証方法              |
| ------ | ----------------------------------------------------------------------------------------------- | --------------------- |
| AC-1   | 設定画面に `AnalyticsDashboardPanel` が統合されていること（キュー件数・オプトアウト状態を表示） | コードレビュー / 目視 |
| AC-2   | オプトアウト状態の現在値（ON/OFF）がUIで確認できること                                          | コードレビュー / 目視 |
| AC-3   | 開発モード（`NODE_ENV !== 'production'`）で dev-only 診断ブロックが表示されること               | テスト PASS / 目視    |
| AC-4   | Playwright E2E テストが PASS すること                                                           | `pnpm test:e2e` PASS  |
| AC-5   | `pnpm typecheck && pnpm lint && pnpm test` が PASS すること                                     | CI PASS               |

---

## 参照資料

| 資料名                     | パス                                                     | 説明                                   |
| -------------------------- | -------------------------------------------------------- | -------------------------------------- |
| analyticsAdapter 実装      | `apps/desktop/src/renderer/utils/analyticsAdapter.ts`    | キュー管理・オプトアウト制御・同期 API |
| trackEvent 実装            | `apps/desktop/src/renderer/utils/trackEvent.ts`          | イベント計装関数・dev/prod 分岐        |
| 設定画面コンポーネント     | `apps/desktop/src/renderer/views/SettingsView/index.tsx` | 統合先コンポーネント                   |
| システム仕様（aiworkflow） | `.claude/skills/aiworkflow-requirements/references/`     | 設計・責務境界・命名整合確認           |

---

## 実行手順

### ステップ1: analyticsAdapter の公開 API 確認

```bash
# analyticsAdapter.ts の全エクスポートと公開 API を確認
cat apps/desktop/src/renderer/utils/analyticsAdapter.ts

# trackEvent.ts の dev/prod 分岐を確認
cat apps/desktop/src/renderer/utils/trackEvent.ts
```

**確認すべき事実**:

- `analyticsAdapter` がキューサイズ取得 API (`getQueueSize` 等) を公開しているか否か
- `analyticsAdapter` がオプトアウト状態取得 API (`isOptedOut` 等) を公開しているか否か
- 在メモリキュー（最大500件/TTL7日）のデータ構造
- `trackEvent.ts` が development / production で異なる sink を使い分けるか

### ステップ2: 設定画面の現状確認

```bash
# 設定画面のコンポーネント構造を調査
find apps/desktop/src/renderer/views/SettingsView -name "*.tsx" 2>/dev/null

# 設定画面のエントリポイントを確認
grep -rn "SettingsView\|settings" \
  apps/desktop/src/renderer/views/SettingsView/ \
  apps/desktop/src/renderer/App.tsx \
  apps/desktop/src/renderer/routes/ 2>/dev/null | head -20
```

**把握すべき情報**:

- 設定画面コンポーネントの具体的なファイルパス
- `AnalyticsDashboardPanel` を配置する場所（どのセクションに追加するか）
- 設定画面のレイアウト構造（パネル分割方式・スクロール構造等）

### ステップ3: スコープ確定と受入基準の文書化

**変更ファイル（コード・新規）**:

| ファイル                                                                     | 変更種別 | 変更内容                                                 |
| ---------------------------------------------------------------------------- | -------- | -------------------------------------------------------- |
| `apps/desktop/src/renderer/components/analytics/AnalyticsDashboardPanel.tsx` | 新規     | 統計表示 + dev-only 診断ブロックを内包するコンポーネント |
| 設定画面コンポーネント（P50チェックで特定）                                  | 修正     | `AnalyticsDashboardPanel` の統合                         |

**変更ファイル（テスト・新規）**:

| ファイル                                                                                    | 変更種別 | 変更内容              |
| ------------------------------------------------------------------------------------------- | -------- | --------------------- |
| `apps/desktop/src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx` | 新規     | ユニットテスト        |
| `apps/desktop/e2e/analytics-dashboard.spec.ts`                                              | 新規     | Playwright E2E テスト |

**スコープ外（変更しない）**:

- `apps/desktop/src/renderer/utils/analyticsAdapter.ts` — 既存実装を活用（基本的に変更不要）
- `apps/desktop/src/renderer/utils/trackEvent.ts` — 既存実装を活用（変更不要）
- `apps/desktop/src/main/ipc/analyticsHandler.ts` / `apps/desktop/src/preload/*` — 本タスクでは変更しない
- 外部分析基盤・リアルタイム集計基盤 — 本タスクのスコープ外

---

## 統合テスト連携

- `analyticsAdapter.ts` の公開 API（`getQueueSize`, `isOptedOut` 等）を設計に引き継ぐ
- `NODE_ENV !== 'production'` チェックによる開発モード分岐を Phase 2 設計・Phase 4 テストに引き継ぐ
- Playwright E2E テストシナリオを Phase 4 テスト作成の前提インプットとして記録

---

## 多角的チェック観点（AIが判断）

### システム系

- **データフロー**: `trackEvent` → `analyticsAdapter` → Renderer-local UI 表示の流れを理解した上で、どのレイヤで状態を表示するかを設計
- **責務境界**: Renderer 側の `analyticsAdapter.ts` が持つキュー情報と、UI 表示責務の境界を明確化
- **状態所有権**: オプトアウト設定の真の状態（source of truth）がどこにあるかを確認

### 価値・コスト系

- **価値**: 開発者がAnalyticsパイプラインの動作状況をUIから確認できるようになる。オプトアウト状態の透明性向上
- **コスト**: 新規コンポーネント1ファイル + E2Eテスト。追加の IPC や store を増やさない
- **トレードオン**: 実ログ一覧ではなく、現在値の確認にスコープを絞る

### 問題解決系

- **優先順位**: AC-3（開発モード分岐）が実装の核心。`NODE_ENV` チェックはコンポーネント内に閉じる
- **リスク**: 設定画面の既存レイアウトへの統合が想定外の変更を要する場合があるため、P50チェックで構造を先に確認

---

## サブタスク管理

| ID     | タスク名                 | 担当 | ステータス |
| ------ | ------------------------ | ---- | ---------- |
| T-01-1 | P50チェック              | -    | 未実施     |
| T-01-2 | 問題分析（不足要素特定） | -    | 未実施     |
| T-01-3 | スコープ確定             | -    | 未実施     |
| T-01-4 | 受入基準定義             | -    | 未実施     |
| T-01-5 | 依存関係整理             | -    | 未実施     |

---

## 成果物

| 成果物               | 配置先                                   | 形式     |
| -------------------- | ---------------------------------------- | -------- |
| 受入基準ドキュメント | `outputs/phase-1/acceptance-criteria.md` | Markdown |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`    | Markdown |
| スコープ定義書       | `outputs/phase-1/scope-definition.md`    | Markdown |

---

## 完了条件

- [ ] P50チェックを実行し、対象ファイルの現状実装状態が確認済みであること
- [ ] `analyticsAdapter.ts` の公開 API（`getQueueSize`, `isOptedOut` 等）の有無が確認済みであること
- [ ] 設定画面コンポーネントの具体的なファイルパスが特定済みであること
- [ ] 受入基準 AC-1〜AC-5 が全て定義・文書化されていること
- [ ] 変更対象ファイル一覧（新規コンポーネント + E2E）が確定していること
- [ ] `outputs/phase-1/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認して記録すること:

- [ ] T-01-1: P50チェック実行済み（analyticsAdapter・設定画面・dev/prod 分岐を確認）
- [ ] T-01-2: 不足API特定結果を `outputs/phase-1/p50-check-result.md` に記録済み
- [ ] T-01-3: スコープを `outputs/phase-1/scope-definition.md` に記録済み
- [ ] T-01-4: 受入基準 AC-1〜AC-5 を `outputs/phase-1/acceptance-criteria.md` に記録済み
- [ ] T-01-5: 依存関係（前提タスク `UT-W3-ANALYTICS-ADAPTER-001` 完了確認）を記録済み

---

## 次Phase

**Phase 2: 設計** — `AnalyticsDashboardPanel` コンポーネントの設計、dev-only 診断ブロックの表示方針、状態管理方針を確定する。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。
