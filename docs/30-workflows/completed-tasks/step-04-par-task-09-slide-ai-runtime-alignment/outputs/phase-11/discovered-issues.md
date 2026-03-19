# Phase 11: 発見事項

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 11                                      |
| 作成日   | 2026-03-19                              |

## 発見事項一覧

| #   | シナリオ | 発見事項                                                                                                       | 分類 | 対応方針                                                                                | 関連タスク                 |
| --- | -------- | -------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------- | -------------------------- |
| 1   | TC-11-02 | `registerSlideIpcHandlers()` が `apps/desktop/src/main/ipc/index.ts` で登録されていない                        | Note | slide Main/Renderer 経路の実装タスクで接続する                                          | `UT-SLIDE-IMPL-001`        |
| 2   | TC-11-02 | `slide/agent-client.ts` が `@anthropic-ai/sdk`、`safeStorage`、`electron-store`、env fallback を直接使っている | Note | RuntimeResolver 統合と legacy client 廃止を formalize する                              | `UT-SLIDE-IMPL-001`        |
| 3   | TC-11-03 | IPC チャネル名が canonical set と不一致（`slide:startWatching`、`slide:manualSync` など旧名）                  | Note | channel rename と preload allowlist 更新を実装 backlog へ送る                           | `UT-SLIDE-IMPL-001`        |
| 4   | TC-11-03 | `manualSync()` が reverse-sync ではなく `syncManager.sync(projectPath)` の forward sync を呼んでいる           | Note | 用語と実処理の整合を実装時に是正する                                                    | `UT-SLIDE-IMPL-001`        |
| 5   | TC-11-04 | `modifier-skill.ts` が独立実装として残り、`skill-executor.ts` と責務が分散している                             | Note | modifier の統合・廃止方針を follow-up task で固定する                                   | `UT-SLIDE-IMPL-001`        |
| 6   | TC-11-02 | `SlideWorkspace.tsx` に runtime/auth badge、watch status、guidance block、terminal launcher が存在しない       | Note | UI 4領域コンポーネントを別タスクで formalize する                                       | `UT-SLIDE-UI-001`          |
| 7   | TC-11-05 | degraded state で error alert は見えるが handoff reason と terminal fallback CTA が見えない                    | Note | `SlideGuidanceBlock` と terminal launcher を UI 正本へ反映済みとし、実装 backlog へ送る | `UT-SLIDE-UI-001`          |
| 8   | TC-11-04 | `useSlideProject()` が store 全体参照を useEffect 依存に保持しており P31 follow-up 候補が残る                  | Note | selector migration を独立未タスクとして formalize する                                  | `UT-SLIDE-P31-001`         |
| 9   | TC-11-05 | `HandoffBlock.tsx` のローカル `HandoffGuidance` 定義重複が slide handoff 横展開時の drift 要因になる           | Info | 既存共通型への統一を軽量 follow-up として登録する                                       | `UT-SLIDE-HANDOFF-DUP-001` |
| 10  | 共通     | Phase 11 は live preview ではなく static fallback capture で実施した                                           | Info | metadata に理由を固定し、実装後に live current build で再撮影する                       | `UT-SLIDE-UI-001`          |

## まとめ

- Blocker: 0 件
- Note: 8 件
- Info: 2 件

本 Phase は「task 09 の仕様に対して current code が未反映であること」を確認する監査として完了した。未反映項目は Phase 12 で unassigned task と system spec 正本へ引き継ぐ。
