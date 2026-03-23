# 未タスク指示書: UT-RUNTIME-BUILDER-MIGRATION-001

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | UT-RUNTIME-BUILDER-MIGRATION-001                           |
| Issue      | #1461                                                      |
| 由来       | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 設計 GAP |
| ステータス | completed                                                  |
| 優先度     | high（Consumer Adapter 実装の前提）                        |
| 作成日     | 2026-03-22                                                 |
| 関連仕様書 | llm-workspace-chat-edit.md                                 |

## 目的

`TerminalHandoffBuilder` に `buildForSurface(request, surfaceType, reason)` 統一メソッドを追加し、旧メソッドに `@deprecated` タグを付与する。

## 背景

Phase 2 設計で `TerminalHandoffBuilder.buildForSurface()` を統一エントリーポイントとして定義した。現状の旧メソッド（surface ごとに個別の build メソッド）が混在しており、Consumer Adapter 実装者が誤った方法で DTO を生成するリスクがある。

## 実行タスク

1. `TerminalHandoffBuilder` の現在のメソッド一覧を調査する
2. `buildForSurface(request: BuildRequest, surfaceType: "chat-edit" | "runtime" | "skill-docs", reason: HandoffGuidance["reason"])` を追加実装する
3. 旧メソッドに `@deprecated` JSDoc タグを付与し、`buildForSurface()` への移行先を明記する
4. `buildForSurface()` の unit test を作成する（3 surfaceType × 4 reason パターン = 12 ケース以上）
5. 旧メソッドの呼び出し元を `buildForSurface()` に移行する
6. `llm-workspace-chat-edit.md` に `buildForSurface()` の仕様を追記する

## 参照資料

| 参照資料                   | パス                                                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| design-summary.md          | docs/30-workflows/completed-tasks/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md        |
| contract-matrix.md         | docs/30-workflows/completed-tasks/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/contract-matrix.md       |
| implementation-guide.md    | docs/30-workflows/completed-tasks/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/implementation-guide.md |
| llm-workspace-chat-edit.md | .claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md                                                        |

## 受入基準

- [ ] `buildForSurface()` メソッドが実装されている
- [ ] 旧メソッドに `@deprecated` が付与されている
- [ ] `buildForSurface()` の unit test が 12 件以上作成されている
- [ ] 旧メソッドの呼び出し元が全て `buildForSurface()` に移行されている（または migration コメントが付いている）
- [ ] `llm-workspace-chat-edit.md` の `buildForSurface()` 仕様が更新されている
- [ ] 未知の surfaceType でエラーが throw される（P62 対策）

## 注意事項

- P62 対策: `surfaceType` が未知の値の場合に `DEFAULT_CONFIG` へ fallback してはいけない — エラーを throw する
- P44 対策: 返却型は必ず `HandoffGuidance`（内部の `TerminalHandoffBundle` は Renderer に渡してはいけない）
