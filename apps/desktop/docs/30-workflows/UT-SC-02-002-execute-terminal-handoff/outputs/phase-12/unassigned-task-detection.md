# 未タスク検出レポート

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | UT-SC-02-002                    |
| タスク名 | execute terminal handoff 本実装 |
| Phase    | 12 (ドキュメント)               |
| 検出日   | 2026-03-23                      |
| 検出件数 | 1件                             |

## 検出観点と確認結果

### 観点1: `terminal_handoff` 以外の `execution_type` 追加の必要性

- **結論**: 現時点では不要
- **理由**: `integrated_api` と `terminal_handoff` の2パターンで、スキル実行の主要ユースケースを網羅している。`integrated_api` は SDK 経由の API 呼び出し、`terminal_handoff` はターミナルでの対話的実行を担当し、これ以外の実行モードは現在の要件に存在しない。

### 観点2: `RuntimeSkillCreatorFacade` のエラーハンドリング強化の余地

- **結論**: 現状で十分
- **理由**: `execute()` メソッド内の `SkillExecutor` 呼び出しに対する個別の try-catch は存在しないが、上位の IPC ハンドラ（`creatorHandlers.ts`）で catch されており、エラーはサニタイズされた形で Renderer に返される。二重の try-catch は冗長であり、現在のレイヤー構成で適切にエラーが伝播している。

### 観点3: Preload 型定義 `skill-creator-api.ts` の `RuntimeSkillCreatorExecuteResponse` 未対応

- **結論**: 未タスク候補として検出（P44/P45 パターン）
- **理由**: Main Process 側の `creatorHandlers.ts` は `RuntimeSkillCreatorExecuteResponse` 型のレスポンスを返すが、Preload 側の `skill-creator-api.ts` では execute の戻り値型がこの型に更新されていない。IPC ハンドラと Preload の型定義が乖離している状態であり、P44（IPC インターフェース不整合）および P45（引数命名の契約ドリフト）に該当する。

## 検出された未タスク一覧

| No. | 未タスクID   | タイトル                                                                                         | 優先度 | 関連パターン |
| --- | ------------ | ------------------------------------------------------------------------------------------------ | ------ | ------------ |
| 1   | UT-SC-02-003 | Preload `skill-creator-api.ts` の execute 戻り値型を `RuntimeSkillCreatorExecuteResponse` に更新 | Medium | P44, P45     |

### UT-SC-02-003 詳細

- **対象ファイル**: `apps/desktop/src/preload/skill-creator-api.ts`
- **問題**: Main Process の `creatorHandlers.ts` が返す `RuntimeSkillCreatorExecuteResponse`（`execution_type`, `terminal_handoff_command` 等を含む）に対して、Preload 側の型定義が追従していない
- **影響**: Renderer 側で `execution_type` や `terminal_handoff_command` フィールドにアクセスする際、TypeScript の型チェックが効かない
- **修正方針**: Preload の execute メソッドの戻り値型を `RuntimeSkillCreatorExecuteResponse` に更新し、必要に応じて `packages/shared` に型定義を移動する

## 備考

本タスクは worktree 環境で実施しているため、未タスク指示書の `docs/30-workflows/unassigned-task/` への配置および `task-workflow.md` 残課題テーブルへの登録は、PR マージ時に実施する。
