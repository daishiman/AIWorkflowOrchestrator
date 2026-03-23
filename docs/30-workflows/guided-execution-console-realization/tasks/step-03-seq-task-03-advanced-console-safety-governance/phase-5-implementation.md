# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 5                                               |
| Phase名    | 実装                                            |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 1-4                                       |
| 後続Phase  | Phase 6（テスト拡充）                           |
| ステータス | not_started                                     |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

approval、disclosure、manual boundary enforcement、advanced console gate の実装順と ownership を定義する。

## 実行タスク

- approval 実装方針定義
- disclosure 実装方針定義
- boundary enforcement 定義
- advanced console gate 定義

## 参照資料

- 依存Phase: Phase 4
- task テスト作成: `phase-4-test-creation.md`
- root pack: `../../phase-5-implementation.md`
- upstream tasks: `../step-01-seq-task-01-guided-execution-shell-foundation/index.md`, `../step-02-seq-task-02-session-dock-artifact-bridge/index.md`

## 変更対象ファイル一覧

| ファイル                                                                     | 変更種別 | 目的                        |
| ---------------------------------------------------------------------------- | -------- | --------------------------- |
| `apps/desktop/src/main/ipc/terminalHandlers.ts`                              | 修正     | open flow の明示条件        |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`            | 修正     | lane authority              |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`        | 修正     | handoff / disclosure bundle |
| `apps/desktop/src/preload/index.ts`                                          | 修正     | exposed API boundary        |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`             | 修正     | advanced console gate       |
| `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`           | 新規     | approval UI                 |
| `apps/desktop/src/renderer/components/execution/SessionDisclosureBanner.tsx` | 新規     | AI / send disclosure        |
| `apps/desktop/src/renderer/components/execution/AdvancedConsolePanel.tsx`    | 新規     | opt-in raw terminal         |

## 実行手順

### ステップ1: authority を先に定義する

Main / Preload / Renderer のどこで何を止めるかを先に固定する。

### ステップ2: disclosure を session start に入れる

AI 利用と外部送信の開示を surface entry と session start の両面で扱う。

### ステップ3: advanced console を最後に接続する

front default surface へ逆流しないよう、最後に opt-in detail layer を繋ぐ。

## 統合テスト連携

approval と disclosure は UI テストだけでなく IPC / runtime policy との境界も確認する。

## 成果物

| 成果物   | パス                                     | 説明           |
| -------- | ---------------------------------------- | -------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 実装順序       |
| 変更範囲 | `outputs/phase-5/file-change-scope.md`   | file ownership |

## 完了条件

- [ ] authority 境界が定義されている
- [ ] disclosure の差し込み位置が定義されている
- [ ] advanced console を最後に接続する理由が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md)
