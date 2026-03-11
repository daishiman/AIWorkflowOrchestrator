# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 1                              |
| Phase名      | 要件定義                       |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | なし                           |
| 後続Phase    | Phase 2                        |
| 担当SubAgent | SubAgent-A                     |

## 目的

058c が求める「タイムライン主導の履歴体験」を、画面構造、state、導線、品質条件へ分解し、Phase 2 以降で解釈差分が出ない要件集合へ固定する。

## 実行タスク

- 要件抽出: 正本タスクから UI、導線、データ、非機能要件を抽出する
- 現行差分整理: 既存 `HistorySearchView` と `historySearchSlice` の不足点を列挙する
- 受入基準定義: 観測可能な完了条件へ変換する
- スコープ境界確定: 本タスクで変更する範囲と委譲範囲を分離する
- Concern 分離: SubAgent ごとの責務と成果物境界を固定する

## 参照資料

| 参照資料   | パス                                                                                                      | 内容                    |
| ---------- | --------------------------------------------------------------------------------------------------------- | ----------------------- |
| 正本タスク | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058c-ui-06-history-search-view.md` | 058c の要求本体         |
| 現行 view  | `apps/desktop/src/renderer/views/HistorySearchView/index.tsx`                                             | 現在の UI               |
| 現行 slice | `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`                                            | 現在の state と actions |
| 現行 test  | `apps/desktop/src/renderer/views/HistorySearchView/HistorySearchView.test.tsx`                            | 既存テスト観点          |
| 依存 task  | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/`                                | 履歴検索の初回実装仕様  |

### システム仕様（aiworkflow-requirements）

| 参照資料    | パス                                                                            | 内容                         |
| ----------- | ------------------------------------------------------------------------------- | ---------------------------- |
| UI実装正本  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 既存実装と苦戦箇所           |
| 状態管理    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | `historySearchSlice` の責務  |
| UX原則      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  | タイトル変換と文言ルール     |
| 画面一覧    | `.claude/skills/aiworkflow-requirements/references/master-design.md`            | `あなたの記録` の正本名      |
| 会話履歴I/F | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`  | Chat 詳細導線と session 概念 |
| 履歴 UI     | `.claude/skills/aiworkflow-requirements/references/ui-history-design.md`        | loading、error、a11y 基準    |
| 品質基準    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | coverage と test 原則        |

## 実行手順

### ステップ1: 正本要求の分解

親仕様を「画面主役」「カード表示」「展開挙動」「ページング」「ゼロステート」「導線」の 6 区分へ整理する。

### ステップ2: 現行差分の列挙

`HistorySearchView` の select、submit button、stats panel、フラット一覧を 058c 目標と比較し、差分一覧へ落とす。

### ステップ3: 受入基準への変換

各要求を UI 観測、Store state、IPC 契約、manual test のいずれで判定するか明記する。

### ステップ4: スコープ境界の確定

本タスクで触る箇所、依存 task が維持する箇所、今回対象外の箇所を 3 列表へまとめる。

### ステップ5: SubAgent 境界の固定

要件、UI設計、契約設計、テスト証跡の責務を SubAgent-A〜D に割り振る。

## 統合テスト連携

- Renderer: `HistorySearchView` の timeline、accordion、zero state を test 観点へ落とす
- Shared: `HistoryItem` / chat session metadata の必要項目を後続 Phase へ引き継ぐ
- Main/Preload: `history:search` / `history:get-stats` の契約観点を Phase 2 に渡す
- Navigation: ChatHistoryView / EditorView / skill detail への導線確認項目を Phase 4 に渡す

## 成果物

| 成果物          | パス                                         | 説明                     |
| --------------- | -------------------------------------------- | ------------------------ |
| 要件定義書      | `outputs/phase-1/requirements-definition.md` | FR/NFR 一覧              |
| 受入基準        | `outputs/phase-1/acceptance-criteria.md`     | AC-01〜AC-06             |
| スコープ定義    | `outputs/phase-1/scope-definition.md`        | 対象、委譲、対象外       |
| 現行差分分析    | `outputs/phase-1/baseline-gap-analysis.md`   | 現在の UI と 058c の差分 |
| SubAgent 分担表 | `outputs/phase-1/subagent-boundary-map.md`   | Concern 分離表           |

## 完了条件

- [x] 正本タスクの要求が UI、state、IPC、manual test 観点へ分解されている
- [x] 現行 `HistorySearchView` の不足点がファイル単位で列挙されている
- [x] 受入基準が検証方法付きで定義されている
- [x] 対象外の変更が明文化されている
- [x] Phase 2 が参照する入力成果物が固定されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase実行記録

### 実行タスク

| タスク           | 結果      | 備考                                                            |
| ---------------- | --------- | --------------------------------------------------------------- |
| 要件抽出         | completed | `requirements-definition.md` と `acceptance-criteria.md` に集約 |
| 現行差分整理     | completed | `baseline-gap-analysis.md` に整理                               |
| 受入基準定義     | completed | AC-01〜AC-06 を固定                                             |
| スコープ境界確定 | completed | `scope-definition.md` に反映                                    |
| Concern 分離     | completed | `subagent-boundary-map.md` に反映                               |

### 発見事項

- 良かった点: 正本タスク、現行 UI、system spec の三者差分を早期に固定できた
- 問題点: workflow が旧 sourceTask path を参照していた
- 改善提案: sourceTask drift を Phase 1 で自動検出する lint を追加したい

### 次Phaseへの引き継ぎ事項

- Phase 2 では `preload/types.ts` の旧契約と file deep-open 導線を設計対象へ含める

## 次のPhase

Phase 2: 設計へ進む。
