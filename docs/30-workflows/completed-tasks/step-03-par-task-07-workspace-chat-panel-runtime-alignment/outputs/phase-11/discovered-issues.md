# Phase 11: 発見課題一覧

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 11                                           |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

## 発見課題

| #   | シナリオ | 発見事項                                                                 | 分類 | 対応方針                                                   |
| --- | -------- | ------------------------------------------------------------------------ | ---- | ---------------------------------------------------------- |
| 1   | TC-11-05 | Terminal launcher がWorkspaceView header に未統合                        | Note | RuntimeResolver 統合タスクで対応（Phase 10 MINOR-03 関連） |
| 2   | TC-11-06 | TranscriptProvenanceChip が WorkspaceChatPanel に未統合                  | Note | Phase 10 MINOR-02 で未タスク化済み                         |
| 3   | 全体     | CompactLayout が WorkspaceChatPanel に未統合、compact 幅の実画面検証不可 | Note | Phase 10 MINOR-02 で未タスク化済み                         |
| 4   | 全体     | esbuild 環境制約によりスクリーンショット取得不可                         | Info | P53 制約。worktree 外での Electron 起動で検証可能          |

## 分類サマリ

| 分類    | 件数 |
| ------- | ---- |
| Blocker | 0    |
| Note    | 3    |
| Info    | 1    |

Blocker は 0件のため、Phase 12 に進む。
