# Phase 2: 設計

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| Phase        | 2                                     |
| Phase名      | 設計                                  |
| 前提Phase    | Phase 1                               |
| 後続Phase    | Phase 3                               |
| ステータス   | completed                             |
| 作成日       | 2026-03-11                            |
| 機能名       | task-058d-ui-07-dashboard-enhancement |
| 担当SubAgent | SubAgent-B / SubAgent-C               |

## 目的

`DashboardView` の責務を再設計し、
既存 atoms を壊さずにホーム画面の 3 要素構成を実装できる設計へ落とし込む。

## 実行タスク

- コンポーネント設計: `DashboardView` の責務分割と view-local component 方針を決める
- データ設計: `dashboardSlice` と selector の利用方法、サジェスチョン導出規則を決める
- 導線設計: `workspace` / `skillCenter` / `historySearch` への遷移契約を決める
- トレーサビリティ設計: 要件IDと設計IDの対応表を作る

## 参照資料

| 参照資料             | パス                                                                                                                       | 内容             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 1仕様          | `phase-1-requirements.md`                                                                                                  | 要件定義         |
| 要件成果物           | `outputs/phase-1/requirements-definition.md`                                                                               | FR/NFR 詳細      |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                                                                                   | AC 一覧          |
| 現行 DashboardView   | `apps/desktop/src/renderer/views/DashboardView/index.tsx`                                                                  | 修正対象         |
| 現行 atoms           | `apps/desktop/src/renderer/components/atoms/`                                                                              | 再利用部品       |
| AppDock/Nav Contract | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` / `apps/desktop/src/renderer/navigation/navContract.ts` | 共有ナビとの境界 |

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容                                              |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| UI設計原則           | `.agents/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Tap & Discover、やさしい文言                      |
| マスターデザイン     | `.agents/skills/aiworkflow-requirements/references/master-design.md`              | Dashboard→ホーム、共通 component の位置づけ       |
| デザインシステム     | `.agents/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | motion / spacing / semantic color                 |
| Atoms 実装パターン   | `.agents/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md`       | pill atom の制約と mood 運用                      |
| UI構造ルール         | `.agents/skills/aiworkflow-requirements/references/arch-ui-components.md`         | atom / molecule / organism の境界                 |
| ディレクトリ構造     | `.agents/skills/aiworkflow-requirements/references/directory-structure.md`        | view-local components / helper 配置規約           |
| UI機能コンポーネント | `.agents/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | TASK-UI-03 の Tap & Discover 参照                 |
| UIコンポーネント台帳 | `.agents/skills/aiworkflow-requirements/references/ui-ux-components.md`           | atoms 再利用方針                                  |
| 状態管理             | `.agents/skills/aiworkflow-requirements/references/arch-state-management.md`      | selector と viewHistory 取扱い                    |
| ナビゲーション       | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | `dashboard` / `historySearch` の正本              |
| API サマリー         | `.agents/skills/aiworkflow-requirements/references/api-endpoints.md`              | HistorySearch の既存 API                          |
| IPC 契約             | `.agents/skills/aiworkflow-requirements/references/api-ipc-system.md`             | `history:search` / `history:get-stats` の既存契約 |
| エラーハンドリング   | `.agents/skills/aiworkflow-requirements/references/error-handling.md`             | invalid timestamp / empty / loading fallback      |
| セキュリティ原則     | `.agents/skills/aiworkflow-requirements/references/security-principles.md`        | 新規 IPC / Preload / secret 追加禁止              |
| テストパターン       | `.agents/skills/aiworkflow-requirements/references/testing-component-patterns.md` | store mock と interaction test                    |
| A11y テスト          | `.agents/skills/aiworkflow-requirements/references/testing-accessibility.md`      | focus / keyboard / role                           |

## 実行手順

### ステップ1: コンポーネント分割を決める

- `DashboardView/index.tsx` は container として state 取得と導線定義に専念する
- view-local components を `views/DashboardView/components/` 配下へ追加する
- `SuggestionBubble` は square card へ無理に拡張せず、トークンと motion を再利用した `DashboardSuggestionCard` molecule を新設する

### ステップ2: データ導出規則を決める

- 挨拶文は `useDisplayName()` と現在時刻から導出する
- サジェスチョンは `activityFeed.length` と `dashboardStats.pending` を入力に 2〜3 件へ絞り込む
- タイムラインは `activityFeed.slice(0, 5)` を使い、時刻表示は `RelativeTime` に統一する

### ステップ3: 導線と境界を決める

- CTA は既存 `ViewType` のみへ遷移する
- 「もっと見る」は `setCurrentView("historySearch")`
- `NavContract.label` の変更は本タスク対象外とし、画面内文言だけを更新する

### ステップ4: トレーサビリティを作る

- FR と component / helper / test 観点の 1対1 対応を固定する
- `TASK-UI-06` 依存と `TASK-UI-02` 境界を明記する

## 統合テスト連携

| 観点            | 内容                                                                         |
| --------------- | ---------------------------------------------------------------------------- |
| Selector 連携   | `useDisplayName` と `dashboardSlice` の state を同時にモックする             |
| ナビ連携        | 各 CTA の `setCurrentView` 引数を固定する                                    |
| EmptyState 連携 | `activityFeed=[]` 時に `EmptyState` + suggestions が出ることを検証対象にする |

## 多角的チェック観点

| 観点               | 適用判断                                         | 仕様参照先                                          |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| UI/UX              | 画面再設計なので適用                             | `aiworkflow-requirements: ui-ux-*.md`               |
| アーキテクチャ     | component 境界を変えるので適用                   | `aiworkflow-requirements: architecture-*.md`        |
| API設計            | 新規 IPC 不要の確認のため限定適用                | `aiworkflow-requirements: api-*.md`                 |
| アクセシビリティ   | CTA とタイムラインの操作性確認で適用             | `aiworkflow-requirements: testing-accessibility.md` |
| セキュリティ       | 新規 IPC / Preload を増やさない確認で適用        | `aiworkflow-requirements: security-*.md`            |
| エラーハンドリング | loading / empty / invalid data の分岐設計で適用  | `aiworkflow-requirements: error-handling.md`        |
| テスタビリティ     | helper / selector / interaction の分離設計で適用 | `aiworkflow-requirements: testing-*.md`             |

## 成果物

| 成果物             | パス                                                 | 内容                             |
| ------------------ | ---------------------------------------------------- | -------------------------------- |
| コンポーネント設計 | `outputs/phase-2/component-architecture.md`          | file plan と責務境界             |
| データ契約設計     | `outputs/phase-2/data-contract-and-content-plan.md`  | state 利用とサジェスチョン導出   |
| 導線設計           | `outputs/phase-2/interaction-and-routing-design.md`  | CTA / timeline / loading / empty |
| aiworkflow 抽出表  | `outputs/phase-2/aiworkflow-requirements-extract.md` | 正本適用ポイント                 |
| トレーサビリティ   | `outputs/phase-2/traceability-matrix.md`             | FR/AC/設計の対応                 |

## 完了条件

- [x] `DashboardView` の container/presentational 境界が明記されている
- [x] `SuggestionBubble` を破壊せずにカード化する方針が明記されている
- [x] `dashboard` ID 維持と「ホーム」文言化の境界が明記されている
- [x] CTA が既存 `ViewType` だけに閉じている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. コンポーネント設計
3. データ設計
4. 導線設計
5. トレーサビリティ作成

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] Phase 1成果物を参照している
- [x] `outputs/phase-2/` の成果物名が確定している
- [x] `artifacts.json` の Phase 2 記述と整合している

## 次のPhase

Phase 3: 設計レビューゲート
