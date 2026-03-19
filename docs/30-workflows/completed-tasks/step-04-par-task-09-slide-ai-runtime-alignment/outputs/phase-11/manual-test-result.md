# Phase 11: 手動テスト結果

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001      |
| Phase      | 11                                           |
| 実施日     | 2026-03-19                                   |
| 実施方式   | static fallback screenshot + code/spec audit |
| ステータス | completed                                    |

## 実施コンテキスト

- intended harness: `/phase11-slide-ai-runtime-alignment.html`
- capture metadata: `outputs/phase-11/screenshots/phase11-capture-metadata.json`
- fallback reason: current worktree では esbuild native binary mismatch により `electron-vite` preview を起動できなかった
- judgement policy: 画面が存在するかだけでなく、task 09 の設計仕様に対する不足分も同時に評価した

## 画面カバレッジマトリクス

| TC-ID    | 検証観点            | 期待仕様                                                   | 現在の確認結果                                                                                  | 判定    | 証跡                                                        |
| -------- | ------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| TC-11-01 | empty state         | project 未選択時に open CTA が成立している                 | dashed empty state と open button を確認                                                        | PASS    | `screenshots/TC-11-01-slide-workspace-empty-state.png`      |
| TC-11-02 | synced state        | sync/watch/runtime/auth 状態が user-facing に見える        | project path と sync indicator はあるが watch 状態、runtime/auth banner、handoff 情報は見えない | PARTIAL | `screenshots/TC-11-02-slide-workspace-synced-state.png`     |
| TC-11-03 | out-of-sync CTA     | reverse-sync 導線と guidance が明示される                  | `手動同期` ボタンのみ表示。reverse-sync 命名、direction 表示、guidance block は未反映           | PARTIAL | `screenshots/TC-11-03-slide-workspace-manual-sync-cta.png`  |
| TC-11-04 | running progress    | 実行中 progress・cancel・phase 状態を追跡できる            | progress/cancel はあるが syncDirection、watch status、runtime/handoff 表示は未反映              | PARTIAL | `screenshots/TC-11-04-slide-workspace-running-progress.png` |
| TC-11-05 | degraded / guidance | error 時に degraded guidance と terminal fallback が見える | red alert は表示されるが guidance block、terminal launcher、handoff reason は未反映             | PARTIAL | `screenshots/TC-11-05-slide-workspace-sync-error.png`       |

## コード実体との突合

| 観点                   | 現在の実体                                                                                                  | 判定         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- | ------------ |
| slide IPC registration | `apps/desktop/src/main/ipc/index.ts` に `registerSlideIpcHandlers()` 呼び出しがない                         | 未接続       |
| runtime resolver 統合  | `slide/agent-client.ts` が `@anthropic-ai/sdk` + `safeStorage` + `electron-store` + env fallback を直接利用 | 未反映       |
| modifier 統合          | `modifier-skill.ts` が独立ファイルとして残存                                                                | 未反映       |
| IPC canonical names    | `slide:startWatching` / `slide:manualSync` など旧名を使用                                                   | 未反映       |
| reverse-sync semantics | `manualSync()` が `syncManager.sync(projectPath)` を呼ぶ forward path                                       | 未反映       |
| slide UI 4領域         | `SlideSyncCard` / `SlideProgressRow` / `SlideWatchStatus` / `SlideGuidanceBlock` は未実装                   | 未反映       |
| P31 follow-up          | `useSlideProject()` が `store` 全体参照を effect 依存に持つ                                                 | follow-up 要 |

## 結果サマリー

| 合計 | PASS | PARTIAL | FAIL | BLOCKED |
| ---- | ---- | ------- | ---- | ------- |
| 5    | 1    | 4       | 0    | 0       |

## Phase 12 への申し送り

1. `UT-SLIDE-IMPL-001` と `UT-SLIDE-UI-001` を formalize し、slide runtime/auth-mode alignment の実装 backlog を台帳化する。
2. system spec 側には「正本契約は更新済み、現行コードは legacy drift が残る」という状態を明示する。
3. screenshot 証跡は static fallback 由来であるため、実装完了後に live current build で再取得する follow-up を前提に扱う。
