# Phase 12 Task 4: 未タスク検出レポート

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 12                            |
| タスクID | UT-EXECUTION-ENV-TERMINAL-001 |
| 実行日   | 2026-03-23                    |

## 検出ソース確認

| ソース                | 確認結果              | 未タスク件数 |
| --------------------- | --------------------- | ------------ |
| 元タスク仕様書        | スコープ外項目確認    | 0 件         |
| Phase 10 レビュー結果 | MINOR 指摘なし        | 0 件         |
| Phase 11 手動テスト   | スコープ外発見なし    | 0 件         |
| コードコメント        | TODO/FIXME なし       | 0 件         |
| 30種思考法レビュー    | AC-5/P62 設計乖離検出 | 2 件         |

## 検出件数

**2 件**（30種思考法レビューにより追加検出）

## 検出した未タスク

### 1. UT-EXECUTION-ENV-TERMINAL-RENDERER-ERROR-UI-001

| 項目     | 値                                                                                     |
| -------- | -------------------------------------------------------------------------------------- |
| タスク名 | Renderer 側 Provider/Model 未選択エラー表示 UI                                         |
| 優先度   | 中                                                                                     |
| 検出元   | 30種思考法レビュー: AC-5 と Phase 2 設計 C-3 の乖離                                    |
| 指示書   | `docs/30-workflows/unassigned-task/UT-EXECUTION-ENV-TERMINAL-RENDERER-ERROR-UI-001.md` |
| 概要     | 設計 C-3 で規定された `data-testid="terminal-config-error"` エラー UI が未実装         |

### 2. UT-ASSERT-NO-SILENT-FALLBACK-WIRING-001

| 項目     | 値                                                                                      |
| -------- | --------------------------------------------------------------------------------------- |
| タスク名 | assertNoSilentFallback の既存 LLM エントリポイント結線                                  |
| 優先度   | 中                                                                                      |
| 検出元   | 30種思考法レビュー: P62 対策の網羅性検証                                                |
| 指示書   | `docs/30-workflows/unassigned-task/UT-ASSERT-NO-SILENT-FALLBACK-WIRING-001.md`          |
| 概要     | `assertNoSilentFallback()` が `aiHandlers.ts` 等の LLM 呼び出しエントリポイントに未結線 |

## 3ステップ完了状況

| ステップ | 内容                              | 状態 |
| -------- | --------------------------------- | ---- |
| 1        | `unassigned-task/` に指示書作成   | 完了 |
| 2        | `task-workflow-backlog.md` に登録 | 完了 |
| 3        | 関連仕様書に参照リンク追加        | 完了 |

## 備考

スコープ外として元タスク仕様書で明示されている以下の項目は、既存の未タスク管理で追跡されており、本タスクで新規に未タスク化する必要はない:

- Persistent Launcher button
- Terminal session dock / panel
- Consumer adapter 関数 `toHandoffGuidance()`
- Zustand store の `handoffGuidance` slice
- terminal transcript display
