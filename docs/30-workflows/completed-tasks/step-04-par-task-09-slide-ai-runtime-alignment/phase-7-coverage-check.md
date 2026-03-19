# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 7                                       |
| Phase名    | カバレッジ確認                          |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）  |
| 後続Phase  | Phase 8（リファクタリング）             |
| ステータス | completed                               |
| 作成日     | 2026-03-13                              |
| 機能名     | slide-ai-runtime-alignment              |

## 目的

Slide / Modifier / Legacy Agent 経路の runtime 整流 の coverage 目標と gap を確認し、基準未達の場合は Phase 6 に戻る。

## 実行タスク

- T-7-1: カバレッジ計測を実行する
- T-7-2: ファイル別カバレッジをカバレッジ目標テーブルと照合する
- T-7-3: 基準未達ファイルの gap 分析を行う
- T-7-4: カバレッジ計画成果物を作成する

## 参照資料

| 参照資料              | パス                                                 | 内容                                                       |
| --------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Phase 5（実装）       | `phase-5-implementation.md`                          | 依存する前提成果物を確認する                               |
| Phase 6（テスト拡充） | `phase-6-test-expansion.md`                          | 依存する前提成果物を確認する                               |
| slide skill-executor  | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する             |
| slide agent-client    | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する（廃止済み） |
| sync-manager          | `apps/desktop/src/main/slide/sync-manager.ts`        | SyncManager の実装を確認する                               |
| file-watcher          | `apps/desktop/src/main/slide/file-watcher.ts`        | FileWatcher の実装を確認する                               |
| ipc-handlers          | `apps/desktop/src/main/slide/ipc-handlers.ts`        | IPC ハンドラの実装を確認する                               |
| SlideWorkspace        | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する      |
| store（slideSlice）   | `apps/desktop/src/renderer/slide/store.ts`           | slideSlice の実装を確認する                                |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「coverage の抜けを見つける根拠」だけを重点確認する。

| 参照資料                        | パス                                                                                   | 内容                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| api-ipc-system                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                  | slide IPC 契約と rename 対象の正本                        |
| interfaces-auth                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                 | auth-mode / capability transport の正本                   |
| llm-workspace-chat-edit         | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`         | RuntimeResolver / guidance / handoff DTO の再利用元       |
| api-ipc-agent-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`              | `handoff` / `guidance` / `AUTHENTICATION_ERROR` transport |
| security-electron-ipc-core      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`      | sender / auth-mode / secret 境界の正本                    |
| arch-state-management-reference | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md` | handoffGuidance / stale state 防止 / dismiss 契約の正本   |

## カバレッジ目標

| ファイル               | Line Coverage 目標 | Branch Coverage 目標 | Function Coverage 目標 |
| ---------------------- | ------------------ | -------------------- | ---------------------- |
| skill-executor.ts      | 80%                | 60%                  | 80%                    |
| ipc-handlers.ts        | 80%                | 60%                  | 80%                    |
| sync-manager.ts        | 80%                | 60%                  | 80%                    |
| file-watcher.ts        | 80%                | 60%                  | 80%                    |
| SlideWorkspace.tsx     | 80%                | 60%                  | 80%                    |
| slideSlice（store.ts） | 90%                | 70%                  | 90%                    |

> slideSlice は新設ファイルのため、推奨基準（Line 90% / Branch 70% / Function 90%）を適用する。

## カバレッジ確認コマンド

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/slide/ src/renderer/slide/
```

### v8 カバレッジプロバイダの注意事項（P41 対策）

- v8 プロバイダはインライン arrow function を独立した関数としてカウントする
- validateIpcSender のオプションオブジェクト内コールバック等が実行されないと Function Coverage が低下する
- テストで `mockValidateIpcSender.mock.calls[i][2].getAllowedWindows()` 等のコールバック呼び出し確認を追加する

## 実行手順

### ステップ1: カバレッジ計測を実行する（T-7-1）

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/slide/ src/renderer/slide/
```

### ステップ2: ファイル別カバレッジを目標テーブルと照合する（T-7-2）

カバレッジ出力の各ファイルの Line / Branch / Function Coverage を上記目標テーブルと比較する。

### ステップ3: 基準未達ファイルの gap 分析（T-7-3）

基準未達のファイルについて以下を分析する:

- 未カバー行の特定（`--coverage` 出力の uncovered lines）
- 未カバーブランチの特定（if/else、switch case、三項演算子）
- 未カバー関数の特定（インライン arrow function 含む）

### ステップ4: 判定と次アクション

| 判定 | 条件                    | 次アクション                               |
| ---- | ----------------------- | ------------------------------------------ |
| PASS | 全ファイルが目標を達成  | Phase 8 へ進む                             |
| 未達 | 1ファイル以上が目標未達 | Phase 6 に戻り、gap 箇所のテストを追加する |

### ステップ5: カバレッジ計画成果物を作成する（T-7-4）

計測結果と gap 分析を `outputs/phase-7/coverage-plan.md` に記録する。

## 統合テスト連携

reverse-sync、watcher、guidance、streaming feedback、sync status の coverage 目標と gap を確認する。

## 多角的チェック観点

| 観点           | チェック内容                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------ |
| カバレッジ精度 | v8 プロバイダのインライン関数カウント（P41）が Function Coverage に影響していないか              |
| セキュリティ   | validateIpcSender / P42 バリデーションのブランチが全てカバーされているか                         |
| エラーパス     | 全 Error Code（AGENT_ERROR / FILE_ERROR / TIMEOUT / VALIDATION_ERROR）のパスがカバーされているか |
| 新設ファイル   | slideSlice（新設）が推奨基準（90% / 70% / 90%）を達成しているか                                  |
| 廃止ファイル   | agent-client.ts が廃止済みの場合、カバレッジ対象から除外されているか                             |

## サブタスク管理

1. T-7-1: カバレッジ計測実行
2. T-7-2: ファイル別カバレッジの目標テーブル照合
3. T-7-3: 基準未達ファイルの gap 分析
4. T-7-4: カバレッジ計画成果物（`outputs/phase-7/coverage-plan.md`）の作成

## 成果物

| 成果物         | パス                               | 内容                              |
| -------------- | ---------------------------------- | --------------------------------- |
| カバレッジ計画 | `outputs/phase-7/coverage-plan.md` | coverage 目標と不足箇所を整理する |

## タスク100%実行確認【必須】

- [ ] カバレッジ計測コマンドが正常に実行され、全ファイルの数値が取得されている
- [ ] skill-executor.ts: Line >= 80%, Branch >= 60%, Function >= 80%
- [ ] ipc-handlers.ts: Line >= 80%, Branch >= 60%, Function >= 80%
- [ ] sync-manager.ts: Line >= 80%, Branch >= 60%, Function >= 80%
- [ ] file-watcher.ts: Line >= 80%, Branch >= 60%, Function >= 80%
- [ ] SlideWorkspace.tsx: Line >= 80%, Branch >= 60%, Function >= 80%
- [ ] slideSlice（store.ts）: Line >= 90%, Branch >= 70%, Function >= 90%
- [ ] 基準未達ファイルがある場合、gap 分析が完了し Phase 6 への戻りが判定されている
- [ ] v8 プロバイダのインライン関数カウント（P41）の影響が確認されている
- [ ] カバレッジ計画成果物が `outputs/phase-7/coverage-plan.md` に出力されている

## 完了条件

- [ ] 全ファイルがカバレッジ目標を達成している（未達の場合は Phase 6 に戻る）
- [ ] coverage 目標が明文化されている
- [ ] gap 分析結果が記録されている

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md) に進む
