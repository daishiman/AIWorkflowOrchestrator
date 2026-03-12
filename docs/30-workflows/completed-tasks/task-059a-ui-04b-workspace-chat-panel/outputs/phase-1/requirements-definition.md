# Phase 1 要件定義

## 目的

`WorkspaceView` の placeholder chat を本番運用可能な `WorkspaceChatPanel` へ置換し、ファイル背景情報付き対話を可能にする。

## 機能要件（FR）

| ID    | 要件                                                               |
| ----- | ------------------------------------------------------------------ |
| FR-01 | ゼロステートで提案バブルを表示する                                 |
| FR-02 | 選択中ファイルを背景情報として添付できる                           |
| FR-03 | 添付ファイルをチップで表示・削除できる                             |
| FR-04 | `@mention` でワークスペースファイル候補を補完できる                |
| FR-05 | mention 選択時に背景情報へ追加し preview を開ける                  |
| FR-06 | `conversationAPI` を用いて user / assistant メッセージを永続化する |
| FR-07 | `llm.streamChat` によるストリーミング応答を表示できる              |
| FR-08 | stream error / file read error を入力欄付近に surfacing する       |
| FR-09 | Enter送信・Shift+Enter改行・mention keyboard 操作を提供する        |
| FR-10 | 04A の layout/store 境界を崩さず 04B を内包する                    |

## 非機能要件（NFR）

| ID     | 要件                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| NFR-01 | `workspaceSlice` / `fileSelectionSlice` を再利用し、新規 global slice を追加しない       |
| NFR-02 | TypeScript strict を満たす（`pnpm exec tsc --noEmit` PASS）                              |
| NFR-03 | 04B対象テストを追加し、回帰を防ぐ                                                        |
| NFR-04 | Phase 11 で実スクリーンショット8件を取得し、Apple UI/UX観点で視覚評価する                |
| NFR-05 | Phase 12 で system spec（`.claude/skills/aiworkflow-requirements/references`）を同期する |

## 依存関係

- TASK-UI-04A（Workspace layout / watcher / file browser）
- `window.electronAPI.file.*`
- `window.electronAPI.llm.*`
- `window.conversationAPI.*`

## 制約

- コミット・PRは実施しない
- 既存未関連差分（task-058d移管差分）を巻き戻さない
