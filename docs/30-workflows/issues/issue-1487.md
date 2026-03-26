# [#1487] UT-EXECUTION-ENV-TERMINAL-RENDERER-ERROR-UI-001: Renderer側 Provider/Model 未選択エラー表示UI

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-EXECUTION-ENV-TERMINAL-RENDERER-ERROR-UI-001                          |
| 由来       | UT-EXECUTION-ENV-TERMINAL-001 30種思考法レビュー AC-5 設計乖離           |
| 優先度     | 中                                                                       |
| 関連仕様書 | docs/30-workflows/execution-env-terminal/phase-2-design.md (Concern C-3) |

## 目的

Phase 2 設計 Concern C-3 で規定された Renderer 側エラー表示 UI を実装する。Provider/Model 未選択時にユーザーへエラーメッセージを表示し、設定画面への遷移 CTA を提供する。

## 受入基準

- [ ] Provider/Model 未選択時に Renderer 側でエラーメッセージが表示される
- [ ] 設定画面への遷移 CTA が表示される
- [ ] `data-testid="terminal-config-error"` が DOM に存在する
- [ ] unit test でエラー表示・CTA の動作が検証されている

## タスク仕様書

`docs/30-workflows/unassigned-task/UT-EXECUTION-ENV-TERMINAL-RENDERER-ERROR-UI-001.md`
