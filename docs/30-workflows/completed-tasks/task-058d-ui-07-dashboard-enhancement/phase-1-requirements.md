# Phase 1: 要件定義

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| Phase        | 1                                     |
| Phase名      | 要件定義                              |
| 前提Phase    | なし                                  |
| 後続Phase    | Phase 2                               |
| ステータス   | completed                             |
| 作成日       | 2026-03-11                            |
| 機能名       | task-058d-ui-07-dashboard-enhancement |
| 担当SubAgent | SubAgent-A / SubAgent-C               |

## 目的

既存 `DashboardView` の問題点を整理し、
「ホーム」体験として必要な機能要件・非機能要件・受け入れ基準を固定する。

## 実行タスク

- 要件抽出: 統計中心 UI から行動中心 UI へ置き換える要件を整理する
- 受け入れ基準定義: 挨拶、サジェスチョン、タイムラインの判定条件を決める
- スコープ定義: 本タスク内と `TASK-UI-02` / `TASK-UI-06` 側へ委譲する責務を切り分ける

## 参照資料

| 参照資料              | パス                                                                   | 内容                           |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| 親タスク仕様          | `../../completed-task/task-058d-ui-07-dashboard-enhancement.md`        | 目的、画面構成、制約           |
| 現行 DashboardView    | `apps/desktop/src/renderer/views/DashboardView/index.tsx`              | 既存 UI と責務                 |
| 現行 Dashboard テスト | `apps/desktop/src/renderer/views/DashboardView/DashboardView.test.tsx` | 現行期待値の棚卸し             |
| Dashboard Slice       | `apps/desktop/src/renderer/store/slices/dashboardSlice.ts`             | 利用可能な state               |
| Store Selector        | `apps/desktop/src/renderer/store/index.ts`                             | `useDisplayName` 等の selector |
| Nav Contract          | `apps/desktop/src/renderer/navigation/navContract.ts`                  | 既存 `dashboard` 導線          |

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容                                                    |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------- |
| UI設計原則           | `.agents/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Tap & Discover とやさしい文言                           |
| マスターデザイン     | `.agents/skills/aiworkflow-requirements/references/master-design.md`              | Dashboard→ホーム の正本                                 |
| デザインシステム     | `.agents/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | CSS 変数と motion token                                 |
| Atoms 実装パターン   | `.agents/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md`       | SuggestionBubble / EmptyState / RelativeTime の制約     |
| UIコンポーネント台帳 | `.agents/skills/aiworkflow-requirements/references/ui-ux-components.md`           | SuggestionBubble / EmptyState / RelativeTime の利用可否 |
| ナビゲーション       | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | `dashboard` / `historySearch` の導線境界                |
| 状態管理             | `.agents/skills/aiworkflow-requirements/references/arch-state-management.md`      | selector 再利用、`historySearch` 導線                   |
| テストパターン       | `.agents/skills/aiworkflow-requirements/references/testing-component-patterns.md` | `useAppStore` モック方針                                |
| 品質要件             | `.agents/skills/aiworkflow-requirements/references/quality-requirements.md`       | UI 層の品質閾値                                         |

## 実行手順

### ステップ0: P50 チェック

- `DashboardView` は既に存在するため、本タスクは完全新規ではなく既存画面の再設計として扱う
- `DashboardView/index.tsx` と `DashboardView.test.tsx` の現状責務を棚卸しし、既存実装を置換する前提を明記する

### ステップ1: 現行 UI の課題を固定する

- 統計カード、会話数、ストレージ表示が「次の一手」に直結していない点を要件化する
- 既存の `dashboardStats` / `activityFeed` で実現できる範囲を切り分ける

### ステップ2: 望ましいホーム体験を定義する

- h1 表示は「ホーム」とする
- 挨拶、サジェスチョン 2〜3 件、タイムライン最大 5 件を Level 1 要素として定義する
- EmptyState は `mood="welcoming"` を使う

### ステップ3: 境界と委譲先を固定する

- `ViewType` は `dashboard` を維持し、文言だけを「ホーム」へ変える
- `historySearch` の検索詳細は `TASK-UI-06` の責務とする
- ナビ共有ラベルの変更は `TASK-UI-02` と競合するため、本タスクでは画面内文言に限定する

## 統合テスト連携

| 観点       | 内容                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| Store 接続 | `dashboardStats` / `activityFeed` / `isLoading` / `useDisplayName` の接続を固定 |
| ナビ導線   | サジェスチョンと「もっと見る」が既存 `ViewType` に遷移する条件を定義            |
| 文言       | 画面内では「ホーム」を使い、内部 ID は `dashboard` を維持する                   |

## 多角的チェック観点

| 観点               | 適用判断                                        | 仕様参照先                                          |
| ------------------ | ----------------------------------------------- | --------------------------------------------------- |
| UI/UX              | 本Phaseの主目的なので適用                       | `aiworkflow-requirements: ui-ux-*.md`               |
| アーキテクチャ     | 画面責務の切り分けが必要なので適用              | `aiworkflow-requirements: architecture-*.md`        |
| アクセシビリティ   | ボタン・タイムライン・EmptyState を扱うので適用 | `aiworkflow-requirements: testing-accessibility.md` |
| セキュリティ       | 新規 IPC / Preload を増やさない境界確認で適用   | `aiworkflow-requirements: security-*.md`            |
| エラーハンドリング | 無効データや空状態を扱うので適用                | `aiworkflow-requirements: error-handling.md`        |
| テスタビリティ     | selector / helper 分離要件を固定するため適用    | `aiworkflow-requirements: testing-*.md`             |

## 成果物

| 成果物       | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR 一覧      |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能条件     |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象/対象外/依存 |

## 完了条件

- [x] 統計カード撤去とホーム化の目的が文書化されている
- [x] 挨拶、サジェスチョン、タイムラインの要件が個別に定義されている
- [x] `dashboard` ID 維持と「ホーム」文言変更の境界が明記されている
- [x] `TASK-UI-02` と `TASK-UI-06` への委譲範囲が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. P50 チェック
3. 要件抽出
4. 受け入れ基準定義
5. スコープ定義

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物パスが `outputs/phase-1/` に確定している
- [x] `artifacts.json` の Phase 1 記述と整合している
- [x] P50 前提が明記されている

## 次のPhase

Phase 2: 設計
