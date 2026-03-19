# Phase 1: スコープ定義

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 1                                       |
| 作成日   | 2026-03-19                              |

## 対象範囲

### Main Process（6 ファイル）

| ファイル          | パス                                            | 行数 | 対象理由                                   |
| ----------------- | ----------------------------------------------- | ---- | ------------------------------------------ |
| agent-client.ts   | `apps/desktop/src/main/slide/agent-client.ts`   | 328  | Direct SDK / electron-store / env fallback |
| skill-executor.ts | `apps/desktop/src/main/slide/skill-executor.ts` | 224  | phase 分岐 / modifier 呼び出し / runtime   |
| modifier-skill.ts | `apps/desktop/src/main/slide/modifier-skill.ts` | 322  | 二重実装 / 孤立モジュール                  |
| ipc-handlers.ts   | `apps/desktop/src/main/slide/ipc-handlers.ts`   | 286  | validateIpcSender 欠如 / チャネル名不統一  |
| sync-manager.ts   | `apps/desktop/src/main/slide/sync-manager.ts`   | 165  | reverseSync 未接続 / SyncStatus 管理       |
| file-watcher.ts   | `apps/desktop/src/main/slide/file-watcher.ts`   | 150  | onHtmlChange 未登録 / watcher lifecycle    |

### Renderer（5 ファイル）

| ファイル                | パス                                                      | 行数 | 対象理由                          |
| ----------------------- | --------------------------------------------------------- | ---- | --------------------------------- |
| SlideWorkspace.tsx      | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`      | 146  | degraded/guidance 表示なし        |
| store.ts                | `apps/desktop/src/renderer/slide/store.ts`                | 115  | slideSlice 拡張                   |
| useSlideProject.ts      | `apps/desktop/src/renderer/slide/useSlideProject.ts`      | 203  | P31 リスク / window.slideApi 呼出 |
| SkillPhasePanel.tsx     | `apps/desktop/src/renderer/slide/SkillPhasePanel.tsx`     | 124  | フェーズ表示 UI                   |
| SyncStatusIndicator.tsx | `apps/desktop/src/renderer/slide/SyncStatusIndicator.tsx` | 50   | 同期状態表示                      |

### Shared Types（3 ファイル）

| ファイル         | パス                                         | 行数 | 対象理由                             |
| ---------------- | -------------------------------------------- | ---- | ------------------------------------ |
| types.ts         | `packages/shared/src/slide/types.ts`         | 144  | SyncStatus / SkillPhase / SlideError |
| index.ts         | `packages/shared/src/slide/index.ts`         | 35   | 共有 export                          |
| slide-project.ts | `packages/shared/src/slide/slide-project.ts` | 61   | SlideProject / isValidProjectPath    |

### 合計: 14 ファイル / 2,353 行

## 除外範囲

| 除外対象              | 理由                                                  |
| --------------------- | ----------------------------------------------------- |
| slideSettings 系      | 既に実装済み（別タスクで完了）                        |
| Preload slide-api.ts  | Phase 5 での IPC チャネル名統一時に変更対象として扱う |
| channels.ts           | Phase 5 での IPC チャネル名統一時に変更対象として扱う |
| テストファイル（7本） | Phase 4-7 でテスト仕様として扱う                      |
| dependency-manager.ts | 純粋な utility で runtime/auth 経路に無関係           |

## スコープ外の未タスク候補

| 候補                                     | 理由                                                                |
| ---------------------------------------- | ------------------------------------------------------------------- |
| useSlideProject の P31 個別セレクタ移行  | AI runtime alignment のスコープ外。状態管理改善として別タスク化     |
| useSlideProject の P5 リスナー再登録防止 | AI runtime alignment のスコープ外。リスナー管理改善として別タスク化 |
| SlideErrorCode 体系の execute 契約整合   | error code 体系の統一は cross-task 課題として別タスク化             |
