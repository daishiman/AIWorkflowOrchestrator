# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 5                                       |
| Phase名    | 実装                                    |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| 前提Phase  | Phase 4（テスト作成）                   |
| 後続Phase  | Phase 6（テスト拡充）                   |
| ステータス | completed                               |
| 作成日     | 2026-03-13                              |
| 機能名     | slide-ai-runtime-alignment              |

## 目的

Slide / Modifier / Legacy Agent 経路の runtime 整流 の実装順序と変更境界を整理し、integrated runtime への統合を完了する。

## 実行タスク

- T-5-1: IPC チャネル名を正本仕様に統一する
- T-5-2: validateIpcSender + P42 3段バリデーションを追加する
- T-5-3: agent-client.ts を廃止し、IAuthKeyService / RuntimeResolver を統合する
- T-5-4: ModifierSkill の二重実装を解消し skill-executor.ts に統合する
- T-5-5: onHtmlChange → SyncManager 自動パスを接続する
- T-5-6: Zustand slideSlice を新設し IPC リスナーを接続する
- T-5-7: UI 4 領域コンポーネントを実装する

## 参照資料

| 参照資料              | パス                                                 | 内容                                                       |
| --------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Phase 4（テスト作成） | `phase-4-test-creation.md`                           | 依存する前提成果物を確認する                               |
| slide skill-executor  | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する             |
| slide agent-client    | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する（廃止対象） |
| modifier-skill        | `apps/desktop/src/main/slide/modifier-skill.ts`      | modifier skill の二重実装を確認する                        |
| ipc-handlers          | `apps/desktop/src/main/slide/ipc-handlers.ts`        | IPC ハンドラの現状を確認する                               |
| sync-manager          | `apps/desktop/src/main/slide/sync-manager.ts`        | SyncManager の現状を確認する                               |
| file-watcher          | `apps/desktop/src/main/slide/file-watcher.ts`        | FileWatcher の現状を確認する                               |
| SlideWorkspace        | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する      |
| store                 | `apps/desktop/src/renderer/slide/store.ts`           | Renderer 側 store の現状を確認する                         |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「実装境界を固定する根拠」だけを重点確認する。

| 参照資料                             | パス                                                                                        | 内容                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| api-ipc-system                       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | slide IPC 契約と rename 対象の正本                        |
| interfaces-auth                      | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                      | auth-mode / capability transport の正本                   |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | modifier / slide sync 契約の正本                          |
| interfaces-agent-sdk-executor        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`        | execute 契約と error code の正本                          |
| llm-workspace-chat-edit              | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`              | RuntimeResolver / guidance / handoff DTO の再利用元       |
| security-electron-ipc-core           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`           | validateIpcSender 順序、secret 非中継、auth-mode IPC 境界 |
| arch-electron-services-details-part2 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | RuntimeResolver / handoff builder / DI 注入順の正本       |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | guidance / error / CTA surface の正本                     |

## 実装順序

| 順序 | サブタスク | 実装タスク                                                  | 対象ファイル                                      | 依存         |
| ---- | ---------- | ----------------------------------------------------------- | ------------------------------------------------- | ------------ |
| 1    | T-5-1      | IPC チャネル名を正本に統一                                  | ipc-handlers.ts, channels.ts, preload             | なし         |
| 2    | T-5-2      | validateIpcSender + P42 バリデーション追加                  | ipc-handlers.ts                                   | T-5-1        |
| 3    | T-5-3      | agent-client.ts 廃止 + IAuthKeyService/RuntimeResolver 統合 | agent-client.ts, skill-executor.ts                | T-5-1, T-5-2 |
| 4    | T-5-4      | ModifierSkill 統合                                          | modifier-skill.ts, skill-executor.ts              | T-5-3        |
| 5    | T-5-5      | onHtmlChange → SyncManager 自動パス接続                     | ipc-handlers.ts, file-watcher.ts, sync-manager.ts | T-5-3, T-5-4 |
| 6    | T-5-6      | Zustand slideSlice 新設 + IPC リスナー                      | store.ts, SlideWorkspace.tsx                      | T-5-1        |
| 7    | T-5-7      | UI 4 領域コンポーネント実装                                 | SlideWorkspace.tsx                                | T-5-6        |

### 実装詳細

#### T-5-1: IPC チャネル名統一

正本チャネル名に rename する 4 チャネル:

- `slide:reverse-sync` (Renderer→Main)
- `slide:watch-start` / `slide:watch-stop` (Renderer→Main)
- `slide:sync-status` / `slide:sync-progress` / `slide:sync-error` (Main→Renderer push)
- `slide:executePhase` / `slide:cancelExecution` (Renderer→Main)

変更対象: ipc-handlers.ts のハンドラ登録、channels.ts の定数定義、preload の safeInvoke/safeOn 呼び出し

#### T-5-2: セキュリティ追加

- validateIpcSender を全 IPC ハンドラに追加
- P42 準拠 3段バリデーション: `typeof === "string"` → `=== ""` → `.trim() === ""`
- パストラバーサル検出: `..` / 絶対パス / null byte を含む引数を拒否

#### T-5-3: agent-client.ts 廃止

- Direct SDK (`@anthropic-ai/sdk`) の直接呼び出しを削除
- electron-store 直読みを削除
- env fallback を削除
- Task01 の RuntimeResolver を slide 経路にも適用
- IAuthKeyService による認証キー取得に統一

#### T-5-4: ModifierSkill 統合

- modifier-skill.ts の実行ロジックを skill-executor.ts に統合
- modifier-skill.ts を廃止（呼び出し元を skill-executor.ts に差し替え）

#### T-5-5: 自動パス接続

- FileWatcher の onHtmlChange コールバックで SyncManager.reverseSync() を呼び出す
- SyncManager が SkillExecutor 経由で integrated runtime を使用する

#### T-5-6: slideSlice 新設

- SyncStatus (`idle` / `syncing` / `synced` / `error`) 状態管理
- SyncDirection (`forward` / `reverse`) 管理
- syncProgress (0-100) 管理
- IPC push リスナー（sync-status / sync-progress / sync-error）を safeOn で登録

#### T-5-7: UI コンポーネント

- SlideSyncCard: 同期状態の概要表示
- SlideProgressRow: 進捗バー表示
- SlideWatchStatus: ファイル監視状態表示
- SlideGuidanceBlock: degraded 時の failure reason + 次アクション表示

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、対象範囲を固定する。

### ステップ2: 既存テスト回帰確認を先行実行する（P50 対策）

```bash
cd apps/desktop && pnpm vitest run src/main/slide/ src/renderer/slide/
```

既存テストが全 PASS することを確認してから実装に着手する。

### ステップ3: 実行タスクを T-5-1 から T-5-7 まで順に実施する

依存関係テーブルの順序を厳守し、各タスク完了後にテストを実行して回帰を確認する。

### ステップ4: IPC ハンドラ register/unregister ペアを確認する（P5 対策）

全 IPC ハンドラに対応する unregister が実装されていることを確認する。

### ステップ5: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ6: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

reverse-sync、watcher、guidance、streaming feedback、sync status の実装順序と接続点を記録する。

## 多角的チェック観点

| 観点               | チェック内容                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| セキュリティ       | validateIpcSender が全ハンドラに適用されているか、P42 3段バリデーションが漏れなく実装されているか |
| アーキテクチャ     | agent-client.ts の Direct SDK / electron-store / env fallback が完全に削除されているか            |
| DI / DIP           | IPC ハンドラ登録関数の引数型がインターフェースか（P61 対策）、Setter Injection が必要な箇所の特定 |
| 状態管理           | slideSlice の個別セレクタ設計（P31 対策）、useShallow の適用（P48 対策）                          |
| リスナー管理       | IPC ハンドラの register/unregister ペア確認（P5 対策）                                            |
| IPC 契約           | チャネル名が IPC_CHANNELS 定数で参照されているか（P27 対策）                                      |
| エラーハンドリング | Error Code（AGENT_ERROR / FILE_ERROR / TIMEOUT / VALIDATION_ERROR）が正本と一致しているか         |

## サブタスク管理

1. T-5-1: IPC チャネル名を正本に統一
2. T-5-2: validateIpcSender + P42 3段バリデーション追加
3. T-5-3: agent-client.ts 廃止 + IAuthKeyService/RuntimeResolver 統合
4. T-5-4: ModifierSkill 統合（modifier-skill.ts → skill-executor.ts）
5. T-5-5: onHtmlChange → SyncManager 自動パス接続
6. T-5-6: Zustand slideSlice 新設 + IPC リスナー
7. T-5-7: UI 4 領域コンポーネント（SlideSyncCard / SlideProgressRow / SlideWatchStatus / SlideGuidanceBlock）

## 成果物

| 成果物   | パス                                     | 内容                         |
| -------- | ---------------------------------------- | ---------------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 実装順序と変更対象を整理する |

## タスク100%実行確認【必須】

- [ ] IPC チャネル名が正本仕様の名前に統一されている（4 チャネル rename 確認）
- [ ] validateIpcSender が全 slide IPC ハンドラに適用されている
- [ ] P42 3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全文字列引数に適用されている
- [ ] パストラバーサル検出（`..` / 絶対パス / null byte）が実装されている
- [ ] agent-client.ts が廃止され、Direct SDK / electron-store 直読み / env fallback が削除されている
- [ ] RuntimeResolver が slide 経路に統合されている
- [ ] modifier-skill.ts のロジックが skill-executor.ts に統合されている
- [ ] FileWatcher の onHtmlChange から SyncManager.reverseSync() への自動パスが接続されている
- [ ] slideSlice が新設され、IPC push 3チャネルのリスナーが safeOn で登録されている
- [ ] UI 4 領域（SlideSyncCard / SlideProgressRow / SlideWatchStatus / SlideGuidanceBlock）が実装されている
- [ ] 全 IPC ハンドラに register/unregister ペアが存在する（P5 対策）
- [ ] IPC チャネル名が全て IPC_CHANNELS 定数で参照されている（P27 対策）
- [ ] 既存テストが回帰なしで全 PASS する

## 完了条件

- [ ] 実装順序テーブル（T-5-1 ~ T-5-7）が全て完了している
- [ ] agent-client.ts が廃止され、integrated runtime に統合されている
- [ ] 依存タスクとの接続点が整理されている
- [ ] 全テスト（Phase 4 で定義した TC-04-01 ~ TC-04-11）が PASS する

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
