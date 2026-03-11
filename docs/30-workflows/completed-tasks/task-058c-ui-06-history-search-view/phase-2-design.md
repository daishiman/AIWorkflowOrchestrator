# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 2                              |
| Phase名      | 設計                           |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | Phase 1                        |
| 後続Phase    | Phase 3                        |
| 担当SubAgent | SubAgent-B, SubAgent-C         |

## 目的

Phase 1 の要求を UI構造、Store、shared types、IPC、導線、アクセシビリティへ落とし込み、実装時に戻りが発生しない設計書へ変換する。

## 実行タスク

- UIアーキテクチャ設計: timeline group、item card、search bar、sentinel の責務を定義する
- Store設計: `historySearchSlice` の state shape と selector 境界を再設計する
- データ契約設計: `HistoryItem`、metadata、search/stats response を整理する
- 導線設計: ChatHistoryView、EditorView、skill detail への遷移条件を定義する
- 非機能設計: a11y、animation、performance、responsive 条件を定義する

## 参照資料

| 参照資料       | パス                                                           | 内容             |
| -------------- | -------------------------------------------------------------- | ---------------- |
| Phase 1 仕様   | `phase-1-requirements.md`                                      | 要件定義         |
| Phase 1 成果物 | `outputs/phase-1/`                                             | 要件入力         |
| 現行 view      | `apps/desktop/src/renderer/views/HistorySearchView/index.tsx`  | 差分基点         |
| 現行 slice     | `apps/desktop/src/renderer/store/slices/historySearchSlice.ts` | state 基点       |
| 現行 IPC       | `apps/desktop/src/main/ipc/historySearchHandlers.ts`           | 契約基点         |
| preload        | `apps/desktop/src/preload/channels.ts`                         | channel 登録基点 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容                              |
| ------------------ | ------------------------------------------------------------------------------------------- | --------------------------------- |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | selector 分離、state 責務         |
| UI基盤             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 既存 HistorySearch 実装同期       |
| ナビ導線           | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | view 遷移ラベル                   |
| デザインシステム   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | spacing、breakpoint               |
| UX原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | 文言と情報密度                    |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IntersectionObserver と test 環境 |
| 履歴型             | `.claude/skills/aiworkflow-requirements/references/ui-history-data-types.md`                | page 結果型                       |
| 会話履歴I/F        | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`              | Chat card から辿る session 契約   |
| IPC                | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | invoke response                   |
| API実装状況        | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | `history:search` の実装状況表     |
| Electron security  | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | preload expose 原則               |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | failure surface                   |

## 実行手順

### ステップ1: UI状態マトリクス作成

タイムライン通常表示、検索中、検索結果 0 件、履歴 0 件、エラー、追補中、全件表示完了、カード展開を UI状態マトリクスへ整理する。

### ステップ2: state と selector の再設計

`historySearchQuery`、`historySearchResults`、`historySearchHasMore`、`expandedItemId`、`historySearchError` の維持条件を定義し、filter と stats の扱いを再判定する。

### ステップ3: 契約差分の確定

`HistoryItem` の metadata と `history:search` response が timeline、accordion、導線に必要な情報を満たすかを確認し、追加型を定義する。

### ステップ4: 導線と境界の固定

Chat card、File card、Skill card の展開内容と遷移先、禁止操作、再利用可能な既存 API を表にまとめる。

### ステップ5: 非機能条件の固定

sticky header、IntersectionObserver、keyboard 操作、animation、breakpoint、error copy を設計へ入れる。

## 統合テスト連携

- Store: `historySearchSlice` と export selector の整合を統合観点に含める
- IPC: `history:search` / `history:get-stats` の request / response / error envelope を固定する
- Preload: channel whitelist と expose 面の変更有無を明記する
- Navigation: ChatHistoryView / EditorView への遷移条件を integration test 観点へ落とす

## 成果物

| 成果物                   | パス                                                   | 説明                                 |
| ------------------------ | ------------------------------------------------------ | ------------------------------------ |
| アーキテクチャ設計       | `outputs/phase-2/architecture-design.md`               | component と hook 構造               |
| UI状態マトリクス         | `outputs/phase-2/ui-state-matrix.md`                   | 表示状態一覧                         |
| データ契約差分           | `outputs/phase-2/data-contract-delta.md`               | shared types と IPC 差分             |
| タイムライングループ規則 | `outputs/phase-2/timeline-grouping-rules.md`           | 今日、昨日、今週、先週、月表示の規則 |
| 導線設計                 | `outputs/phase-2/navigation-link-matrix.md`            | 詳細リンクと view 遷移               |
| spec extraction matrix   | `outputs/phase-2/aiworkflow-spec-extraction-matrix.md` | 参照した system spec と適用先        |

## 完了条件

- [x] timeline group、card、search bar、sentinel の責務分離が定義されている
- [x] `historySearchSlice` の削除項目、維持項目、追加項目が明記されている
- [x] `HistoryItem` と IPC response の不足情報が差分表へ落ちている
- [x] 遷移先 view と trigger 条件がカード種別別に整理されている
- [x] responsive、a11y、animation の基準が検証可能な形で定義されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase実行記録

### 実行タスク

| タスク               | 結果      | 備考                                                    |
| -------------------- | --------- | ------------------------------------------------------- |
| UIアーキテクチャ設計 | completed | `architecture-design.md` と `ui-state-matrix.md` へ反映 |
| Store設計            | completed | `data-contract-delta.md` に state delta を記録          |
| データ契約設計       | completed | timeline / metadata / preload drift を整理              |
| 導線設計             | completed | `navigation-link-matrix.md` に集約                      |
| 非機能設計           | completed | sticky / debounce / observer / a11y 条件を固定          |

### 発見事項

- 良かった点: 058c の UI・Store・IPC を 1 枚の設計で接続できた
- 問題点: preload/types の旧 shape と task path drift が見つかった
- 改善提案: 設計レビュー前に preload 契約 diff を自動抽出したい

### 次Phaseへの引き継ぎ事項

- Phase 3 では sourceTask path drift と preload/types drift を重点監査する

## 次のPhase

Phase 3: 設計レビューゲートへ進む。
