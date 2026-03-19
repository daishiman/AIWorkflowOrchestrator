# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 4                                                             |
| Phase名    | テスト作成                                                    |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001                       |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）                                               |
| ステータス | completed                                                     |
| 作成日     | 2026-03-13                                                    |
| 機能名     | slide-ai-runtime-alignment                                    |

## 目的

Slide / Modifier / Legacy Agent 経路の runtime 整流 に必要な成功系、異常系、回帰系テストを定義する。

## 実行タスク

- T-4-1: Phase 4 事前確認（IPC レスポンス形式合意、既存ユーティリティ重複検出、import 副作用チェック）
- T-4-2: Runtime 成功系・失敗系テスト定義（TC-04-01 ~ TC-04-03）
- T-4-3: Reverse-sync / Watcher テスト定義（TC-04-04 ~ TC-04-06）
- T-4-4: Security テスト定義（TC-04-07 ~ TC-04-08）
- T-4-5: UI 状態系テスト定義（TC-04-09 ~ TC-04-10）
- T-4-6: Zustand slideSlice テスト定義（TC-04-11）
- T-4-7: テストマトリクス成果物の作成

## 参照資料

| 参照資料                | パス                                                 | 内容                                                  |
| ----------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義）     | `phase-1-requirements.md`                            | 依存する前提成果物を確認する                          |
| Phase 2（設計）         | `phase-2-design.md`                                  | 依存する前提成果物を確認する                          |
| Phase 3（設計レビュー） | `phase-3-design-review.md`                           | 依存する前提成果物を確認する                          |
| slide skill-executor    | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する        |
| slide agent-client      | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する        |
| SlideWorkspace          | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「テスト観点を定義する根拠」だけを重点確認する。

| 参照資料                        | パス                                                                                   | 内容                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| api-ipc-system                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                  | slide IPC 契約と rename 対象の正本                        |
| interfaces-auth                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                 | auth-mode / capability transport の正本                   |
| interfaces-agent-sdk-executor   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`   | execute 契約と error code の正本                          |
| llm-workspace-chat-edit         | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`         | RuntimeResolver / guidance / handoff DTO の再利用元       |
| api-ipc-agent-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`              | `handoff` / `guidance` / `AUTHENTICATION_ERROR` transport |
| security-electron-ipc-core      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`      | validateIpcSender 順序、secret 非中継、auth-mode IPC 境界 |
| arch-state-management-reference | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md` | state 遷移 / stale handoff 防止の正本                     |

## Phase 4 事前確認

### IPC レスポンス形式の事前合意（P60 対策）

Phase 5 実装との齟齬を防ぐため、テスト設計前に IPC レスポンス形式を確定する。

- 成功時: `{ success: true, data: T }`
- 失敗時: `{ success: false, error: { code: string, message: string } }`
- 既存ハンドラの形式を `grep -rn "success:" apps/desktop/src/main/handlers/` で確認してから合わせる

### 既存ユーティリティ重複検出

- `grep -rn "validateIpcSender\|safeInvoke\|safeOn" apps/desktop/src/` で既存ユーティリティを確認
- 重複実装を防止し、既存関数を再利用する

### テスト対象ファイルの import 副作用チェック

- `apps/desktop/src/main/slide/` 配下の各ファイルがモジュールスコープで副作用（グローバル変数、タイマー等）を持つか確認
- 副作用がある場合は `vi.mock` でモジュール全体をモックし、テスト間リーク（P9）を防止する

## テストケース定義

### Runtime テスト（TC-04-01 ~ TC-04-03）

| TC-ID    | カテゴリ       | テスト名                                      | 期待結果                                                      | 対象ファイル      |
| -------- | -------------- | --------------------------------------------- | ------------------------------------------------------------- | ----------------- |
| TC-04-01 | Runtime 成功系 | integrated runtime で slide:executePhase 成功 | `{ success: true, data: SkillExecutionResponse }` が返る      | skill-executor.ts |
| TC-04-02 | Runtime 失敗系 | API key 未設定時の handoff                    | `{ success: true, data: { handoff: true, guidance } }` が返る | skill-executor.ts |
| TC-04-03 | Runtime 失敗系 | API key 無効時の AUTHENTICATION_ERROR         | `{ success: false, error: { code: "AGENT_ERROR" } }` が返る   | skill-executor.ts |

### Reverse-sync / Watcher テスト（TC-04-04 ~ TC-04-06）

| TC-ID    | カテゴリ                  | テスト名                             | 期待結果                                                         | 対象ファイル                     |
| -------- | ------------------------- | ------------------------------------ | ---------------------------------------------------------------- | -------------------------------- |
| TC-04-04 | Reverse-sync 成功系       | slide:reverse-sync 実行              | SyncManager.reverseSync() が呼ばれ sync status が更新される      | sync-manager.ts, ipc-handlers.ts |
| TC-04-05 | Reverse-sync 自動トリガー | onHtmlChange 発火で自動 reverseSync  | FileWatcher → SyncManager → SkillExecutor の自動パスが実行される | file-watcher.ts, sync-manager.ts |
| TC-04-06 | Watcher 系                | slide:watch-start / slide:watch-stop | FileWatcher lifecycle の開始/停止が正常に動作する                | file-watcher.ts, ipc-handlers.ts |

### Security テスト（TC-04-07 ~ TC-04-08）

| TC-ID    | カテゴリ    | テスト名                                                          | 期待結果                                                         | 対象ファイル    |
| -------- | ----------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- | --------------- |
| TC-04-07 | Security 系 | validateIpcSender 未認可 sender                                   | sender 検証エラーが返り、ハンドラが実行されない                  | ipc-handlers.ts |
| TC-04-08 | Security 系 | P42 3段バリデーション（空文字 / トリム空文字 / パストラバーサル） | `{ success: false, error: { code: "VALIDATION_ERROR" } }` が返る | ipc-handlers.ts |

### UI 状態系テスト（TC-04-09 ~ TC-04-10）

| TC-ID    | カテゴリ  | テスト名                                        | 期待結果                                                        | 対象ファイル       |
| -------- | --------- | ----------------------------------------------- | --------------------------------------------------------------- | ------------------ |
| TC-04-09 | UI 状態系 | degraded 状態の guidance 表示                   | SlideGuidanceBlock に failure reason と次アクションが表示される | SlideWorkspace.tsx |
| TC-04-10 | UI 状態系 | synced / running / degraded / guidance 状態遷移 | 各状態で正しい CTA が表示される                                 | SlideWorkspace.tsx |

### Zustand テスト（TC-04-11）

| TC-ID    | カテゴリ   | テスト名                    | 期待結果                                                                  | 対象ファイル |
| -------- | ---------- | --------------------------- | ------------------------------------------------------------------------- | ------------ |
| TC-04-11 | Zustand 系 | slideSlice の IPC push 受信 | sync-status / sync-progress / sync-error が slideSlice に正しく反映される | store.ts     |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Slide / Modifier / Legacy Agent 経路の runtime 整流 の対象範囲を固定する。

### ステップ2: Phase 4 事前確認を実施する

- IPC レスポンス形式の事前合意（既存ハンドラの形式確認）
- 既存ユーティリティ重複検出
- テスト対象ファイルの import 副作用チェック

### ステップ3: 実行タスクを上から順に実施する

テスト作成 の実行タスクを T-4-1 から T-4-7 まで順に処理し、成果物へ反映する。

### ステップ4: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ5: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

reverse-sync、watcher、guidance、streaming feedback、sync status の成功系、異常系、回帰系テストを定義する。

## 多角的チェック観点

| 観点               | チェック内容                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------- |
| セキュリティ       | validateIpcSender テスト、P42 3段バリデーションテスト、パストラバーサル検出テストが含まれるか |
| アーキテクチャ     | IPC レスポンス wrapper 形式の一貫性（P60 対策）                                               |
| UI/UX              | degraded / guidance 状態の表示テストが含まれるか                                              |
| 状態管理           | slideSlice の IPC push 受信テスト、P48 useShallow 必要性の確認                                |
| テスト設計         | テスト間の状態リーク防止（P9）、happy-dom 環境での fireEvent 使用（P39）                      |
| エラーハンドリング | 全 Error Code（AGENT_ERROR / FILE_ERROR / TIMEOUT / VALIDATION_ERROR）のテストカバー          |

## サブタスク管理

1. T-4-1: Phase 4 事前確認（IPC レスポンス形式合意、ユーティリティ重複検出、import 副作用チェック）
2. T-4-2: Runtime 成功系・失敗系テスト定義（TC-04-01 ~ TC-04-03）
3. T-4-3: Reverse-sync / Watcher テスト定義（TC-04-04 ~ TC-04-06）
4. T-4-4: Security テスト定義（TC-04-07 ~ TC-04-08）
5. T-4-5: UI 状態系テスト定義（TC-04-09 ~ TC-04-10）
6. T-4-6: Zustand slideSlice テスト定義（TC-04-11）
7. T-4-7: テストマトリクス成果物（`outputs/phase-4/test-matrix.md`）の作成

## 成果物

| 成果物           | パス                             | 内容                               |
| ---------------- | -------------------------------- | ---------------------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | 成功系、異常系、回帰対象を整理する |

## タスク100%実行確認【必須】

- [ ] IPC レスポンス形式（`{ success, data }` / `{ success, error }` wrapper）が既存ハンドラと一致している
- [ ] TC-04-01 ~ TC-04-11 の全テストケースが定義されている
- [ ] 全テストケースの期待結果が具体的な値（Error Code、レスポンス構造）で記述されている
- [ ] Security テスト（TC-04-07, TC-04-08）が validateIpcSender と P42 3段バリデーションを網羅している
- [ ] UI 状態テスト（TC-04-09, TC-04-10）が degraded / guidance の表示内容を検証している
- [ ] Zustand テスト（TC-04-11）が IPC push 3チャネル（sync-status / sync-progress / sync-error）を網羅している
- [ ] テスト対象ファイルの import 副作用が確認され、モック戦略が決定している
- [ ] テストマトリクス成果物が `outputs/phase-4/test-matrix.md` に出力されている
- [ ] happy-dom 環境での fireEvent 使用（P39 対策）が考慮されている

## 完了条件

- [ ] 主要成功系と異常系のテストが TC-ID 形式で定義されている
- [ ] IPC レスポンス形式が Phase 5 実装と事前合意されている
- [ ] Security / UI / Zustand のテストケースが全て定義されている

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
