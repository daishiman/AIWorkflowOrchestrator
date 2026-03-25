# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                             |
| ------ | ---------------------------------------------- |
| Phase  | 1                                              |
| 機能名 | ut-imp-navcontract-execution-console-entry-001 |
| 作成日 | 2026-03-24                                     |

## 目的

`navContract.ts` に `executionConsole` エントリを追加し、GlobalNavStrip から実行コンソールへのナビゲーション導線を確立する。

## 実行タスク

- 要件抽出: ユーザー要求および未タスク指示書から機能要件・非機能要件を抽出する
- 受入基準作成: 各要件に対して検証可能な受入基準を定義する
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定する
- P50チェック実施: 対象ファイルの既実装状態を調査し、未実装箇所を特定する

## P50チェック: 既実装状態の調査

| チェック項目                                      | 結果                            |
| ------------------------------------------------- | ------------------------------- |
| `ViewType` に `executionConsole` が存在するか     | 存在する（`store/types.ts:20`） |
| `DockViewType` に `executionConsole` が存在するか | **未追加**（ブロッカー）        |
| `NAV_SECTIONS` に `executionConsole` が存在するか | **未追加**（ブロッカー）        |
| `IconName` に `play-circle` が存在するか          | **未追加**（前提条件）          |
| `NAV_SHORTCUT_TO_VIEW` に登録されているか         | **未登録**                      |

結論: `ViewType` のみ既追加済み。`DockViewType` / `NAV_SECTIONS` / `IconName` / ショートカットの4箇所が未実装。

## 機能要件（FR）

| ID    | 要件                                                                  | 優先度 |
| ----- | --------------------------------------------------------------------- | ------ |
| FR-01 | `DockViewType` union に `"executionConsole"` を追加する               | 必須   |
| FR-02 | `NAV_SECTIONS` の `sub` セクションに実行コンソールエントリを追加する  | 必須   |
| FR-03 | `NAV_SHORTCUT_TO_VIEW` に `Cmd+9` → `executionConsole` を登録する     | 必須   |
| FR-04 | `IconName` に `"play-circle"` を追加し Lucide `PlayCircle` と紐付ける | 必須   |
| FR-05 | 既存テストの期待値を更新する                                          | 必須   |

## 非機能要件（NFR）

| ID     | 要件                                                     | 優先度 |
| ------ | -------------------------------------------------------- | ------ |
| NFR-01 | `pnpm --filter @repo/desktop typecheck` が PASS すること | 必須   |
| NFR-02 | 既存の navContract テストが全て PASS すること            | 必須   |
| NFR-03 | P32 準拠: `ViewType` と `DockViewType` の型整合を維持    | 必須   |

## 受入基準

- [ ] AC-1: `grep "executionConsole" apps/desktop/src/renderer/navigation/navContract.ts` が 3 件以上ヒット（DockViewType + NAV_SECTIONS + NAV_SHORTCUT_TO_VIEW）
- [ ] AC-2: `pnpm --filter @repo/desktop typecheck` PASS
- [ ] AC-3: GlobalNavStrip に実行コンソールの nav item が表示される
- [ ] AC-4: 全テスト PASS

## スコープ

### 含む

- `navContract.ts` の `DockViewType`、`NAV_SECTIONS`、`NAV_SHORTCUT_TO_VIEW` 更新
- `Icon/index.tsx` への `play-circle` アイコン追加
- `navContract.test.ts` の期待値更新
- `types.test.ts` の ViewType member count 更新

### 含まない

- `ExecutionConsoleView` コンポーネントの実装（別タスク）
- `renderView()` 分岐追加（別タスク）
- `openExecutionConsole()` shared action の作成（別タスク）
- CTA 統一配線（別タスク）

## 参照資料

| 資料名         | パス                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 設計サマリー   | `docs/30-workflows/completed-tasks/step-01-seq-task-01-guided-execution-shell-foundation/outputs/phase-2/design-summary.md`       |
| 最終レビュー   | `docs/30-workflows/completed-tasks/step-01-seq-task-01-guided-execution-shell-foundation/outputs/phase-10/final-review-report.md` |
| 未タスク指示書 | `docs/30-workflows/unassigned-task/ut-imp-navcontract-execution-console-entry-001.md`                                             |

## 統合テスト連携

本タスクはnavContract.tsのエントリ追加であり、UI表示に直接影響する。以下の統合テスト観点で確認する:

| テスト項目         | 確認内容                                   | 期待結果                                                 |
| ------------------ | ------------------------------------------ | -------------------------------------------------------- |
| GlobalNavStrip表示 | 新規nav itemがGlobalNavStripに表示されるか | executionConsoleエントリが補助機能セクションに表示される |
| ショートカット動作 | Cmd+9でexecutionConsoleに遷移するか        | getViewFromNavigationShortcut が正しいビューを返す       |
| モバイルナビ分類   | executionConsoleがsecondaryに分類されるか  | MOBILE_SECONDARY_NAV_ITEMSに含まれる                     |

## 多角的チェック観点

| 観点             | 適用 | 確認事項                                                      |
| ---------------- | ---- | ------------------------------------------------------------- |
| 型安全           | 適用 | DockViewType が Extract<ViewType, ...> の部分型を維持すること |
| UI/UX            | 適用 | nav itemの配置順序とショートカットが直感的であること          |
| アクセシビリティ | 適用 | Iconのaria-hidden="true"が維持されること                      |
| P32準拠          | 適用 | ViewType と DockViewType の型整合が維持されること             |

## 成果物

| 成果物     | パス                              | 説明                                                     |
| ---------- | --------------------------------- | -------------------------------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 機能要件・非機能要件・受入基準・スコープを定義した仕様書 |

## 完了条件

- [x] 機能要件（FR-01〜FR-05）が定義されている
- [x] 非機能要件（NFR-01〜NFR-03）が定義されている
- [x] 受入基準が検証可能な形式で記述されている
- [x] スコープ（含む/含まない）が明確に定義されている
- [x] P50 チェックで既実装状態が調査されている
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（要件抽出、受入基準作成、FR/NFR分類、P50チェック）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次の Phase

Phase 2: 設計
