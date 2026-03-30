# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| Phase    | 11         |
| タスクID | TASK-P0-03 |
| 種別     | NON_VISUAL |

## NON_VISUAL 判定理由

本タスクは workflow-manifest.json ファイルの配置と検証であり、UI/UX を持たない。
screenshot は不要であり、代わりにコマンド実行結果と判断理由を証跡として記録する。

## チェック項目

### manifest loading 確認

| 確認項目                          | 確認方法                                        | 結果    |
| --------------------------------- | ----------------------------------------------- | ------- |
| JSON.parse でエラーなく読み込める | `node -e "require('./workflow-manifest.json')"` | ✅ PASS |
| workflowId が "skill-creator"     | コンソール出力で確認                            | ✅ PASS |
| phases 数が 5                     | コンソール出力で確認                            | ✅ PASS |
| resources 数が 7                  | コンソール出力で確認                            | ✅ PASS |
| entry hooks 数が 5                | コンソール出力で確認                            | ✅ PASS |
| exit hooks 数が 5                 | コンソール出力で確認                            | ✅ PASS |

### resource path walkthrough

| resource path                        | 行数  | 存在確認 |
| ------------------------------------ | ----- | -------- |
| ./agents/analyze-request.md          | 149行 | ✅ OK    |
| ./agents/define-boundary.md          | 116行 | ✅ OK    |
| ./agents/analyze-feedback.md         | 178行 | ✅ OK    |
| ./references/core-principles.md      | 139行 | ✅ OK    |
| ./references/codex-best-practices.md | 278行 | ✅ OK    |
| ./schemas/agent-definition.json      | 238行 | ✅ OK    |
| ./schemas/boundary.json              | 39行  | ✅ OK    |

### hook 確認

| hook id       | command                      | 意味的妥当性              |
| ------------- | ---------------------------- | ------------------------- |
| rg-entry      | validate requirements input  | ✅ 要件入力の検証         |
| plan-entry    | validate plan prerequisites  | ✅ 計画前提条件の検証     |
| execute-entry | validate execution context   | ✅ 実行コンテキストの検証 |
| verify-entry  | validate verification scope  | ✅ 検証スコープの検証     |
| improve-entry | validate improvement targets | ✅ 改善対象の検証         |
| rg-exit       | handoff requirements summary | ✅ 要件サマリーの引き渡し |
| plan-exit     | handoff plan artifacts       | ✅ 計画成果物の引き渡し   |
| execute-exit  | handoff generated artifacts  | ✅ 生成成果物の引き渡し   |
| verify-exit   | handoff verification report  | ✅ 検証レポートの引き渡し |
| improve-exit  | handoff improvement summary  | ✅ 改善サマリーの引き渡し |

### mirror parity

| 確認項目                                             | 結果         |
| ---------------------------------------------------- | ------------ |
| `diff` で canonical と mirror に差分がないことを確認 | ✅ PARITY OK |
