# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 2                                       |
| Phase名    | 設計                                    |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| 前提Phase  | Phase 1（要件定義）                     |
| 後続Phase  | Phase 3（設計レビュー）                 |
| ステータス | completed                               |
| 作成日     | 2026-03-13                              |
| 更新日     | 2026-03-19                              |
| 機能名     | slide-ai-runtime-alignment              |

## 目的

Slide / Modifier / Legacy Agent が同じ runtime 契約を使いながら責務分離を保つ設計を作る。Direct SDK / electron-store 直読み / Silent Fallback を排除し、IAuthKeyService + RuntimeResolver 経由の integrated runtime に統一する。

## 設計方針

- access capability 解決は execute 入口で行い local 判定を増やさない
- internal role（watcher, modifier, reverse-sync）は UI の mode 切替にしない
- direct SDK read や simulated 実行は production 経路に残さない
- reverse-sync / watch IPC は shared runtime resolver と guidance を通す
- IPC チャネル名は正本仕様に統一する

## 実行タスク

- T-2-1 Shared Runtime Policy 設計: integrated / handoff 分岐と capability 境界を設計する
- T-2-2 Role 設計: watcher / modifier / reverse-sync の責務と DI を固定する
- T-2-3 Authority 設計: IPC / state / push channel の authority を固定する
- T-2-4 Direct SDK 排除設計: direct SDK / store key read / env fallback の排除境界を決める
- T-2-5 IPC セキュリティ設計: validateIpcSender / P42 / path guard / preload whitelist を設計する
- T-2-6 IPC チャネル名統一設計: 現行 channel を canonical 名へ寄せる
- T-2-7 UI/UX 設計: guidance / progress / watch / sync card の4領域を固める

### T-2-1: Shared Runtime Policy 設計（Concern 1: Runtime Routing）

access capability 解決と engine 選択を分離した shared runtime policy を定義する。

| 設計項目             | 内容                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| RuntimeResolver 統合 | Task01 の RuntimeResolver を slide 経路にも適用する                                                                 |
| API Key 取得経路     | `IAuthKeyService.getKey()` を唯一の正規経路とし、未設定/無効時は `handoff` または `AUTHENTICATION_ERROR` へ明示分岐 |
| agent-client.ts 排除 | Direct SDK (`@anthropic-ai/sdk`) と electron-store 直読みを全て削除する                                             |
| 分岐ルール           | `integrated`: API key 有効 → SkillExecutor 経由実行。`handoff`: API key 未設定 → guidance + terminal handoff        |

**設計成果物**: Runtime Routing のフロー図（現行 → 目標）

```
[現行]
SlideWorkspace → ipc-handlers → skill-executor → agent-client → Anthropic SDK 直呼び出し
                                                    ↓
                                              electron-store 直読み + env fallback

[目標]
SlideWorkspace → ipc-handlers → skill-executor → RuntimeResolver → SkillExecutor
                                                    ↓                    ↓
                                              integrated path      handoff path
                                              (IAuthKeyService)    (guidance UI)
```

### T-2-2: Role 設計（Concern 2: Lifecycle Orchestration）

watcher、modifier、reverse-sync を internal orchestration として定義する。

| Role          | 責務                                                   | Runtime 依存                             | DI 注入点                           |
| ------------- | ------------------------------------------------------ | ---------------------------------------- | ----------------------------------- |
| FileWatcher   | chokidar でファイル変更を検知し、callback を発火する   | なし（ファイルシステム操作のみ）         | `SyncManager` コンストラクタ        |
| SyncManager   | reverse-sync を orchestrate し、sync status を管理する | `SkillExecutor` 経由で AI 処理を呼び出す | `ipc-handlers.ts` の handler 登録時 |
| ModifierSkill | reverse-sync 時に使用する modifier prompt を構成する   | `SkillExecutor` 経由で AI 処理を呼び出す | `SyncManager` コンストラクタ        |

**modifier-skill.ts の二重実装解消**: `skill-executor.ts` 内の `phase === "modifier"` ハンドリングと `modifier-skill.ts` の `createModifierSkill()` を統合し、`ModifierSkill` クラスとして SyncManager に DI する。

### T-2-3: Authority 設計（Concern 3: IPC / State）

reverse-sync、watch-start/stop、sync status/progress/error の authority をどこに置くか決める。

| 状態                                        | Authority     | 保持先       | Push 先                                          |
| ------------------------------------------- | ------------- | ------------ | ------------------------------------------------ |
| SyncStatus (`idle\|syncing\|synced\|error`) | SyncManager   | Main Process | `slide:sync-status` → Renderer slideSlice        |
| SyncDirection (`forward\|reverse`)          | SyncManager   | Main Process | `slide:sync-status` → Renderer slideSlice        |
| SyncProgress (`{ percent, message }`)       | SyncManager   | Main Process | `slide:sync-progress` → Renderer slideSlice      |
| SyncError (`{ code, message }`)             | SyncManager   | Main Process | `slide:sync-error` → Renderer slideSlice         |
| IsWatching                                  | FileWatcher   | Main Process | `slide:watch-status` → Renderer slideSlice       |
| ExecutionProgress                           | SkillExecutor | Main Process | `slide:execution-progress` → Renderer slideSlice |

**Zustand slideSlice 設計**:

```typescript
interface SlideSlice {
  projectPath: string | null;
  syncStatus: SyncStatus;
  syncDirection: SyncDirection;
  syncProgress: { percent: number; message: string } | null;
  syncError: { code: string; message: string } | null;
  isWatching: boolean;
  currentPhase: SkillPhase | "idle";
  executionProgress: number;
}
```

### T-2-4: Direct SDK 排除設計（Concern 4: Security）

slide agent-client の direct SDK / store key read をどこで遮断するか決める。

| 排除対象                                      | 現行ファイル:箇所         | 排除方法                                   |
| --------------------------------------------- | ------------------------- | ------------------------------------------ |
| `import Anthropic from "@anthropic-ai/sdk"`   | `agent-client.ts:9`       | ファイル削除（agent-client.ts 全体を廃止） |
| `new Store<{ anthropic_api_key?: string }>()` | `agent-client.ts:11,99`   | ファイル削除                               |
| `process.env.ANTHROPIC_API_KEY` fallback      | `agent-client.ts:127-129` | ファイル削除                               |
| `client.messages.create()`                    | `agent-client.ts:248-256` | SkillExecutor 経由に置換                   |

**agent-client.ts 廃止の影響分析**:

| 呼び出し元        | 現行の呼び出し方                                 | 移行先                                      |
| ----------------- | ------------------------------------------------ | ------------------------------------------- |
| skill-executor.ts | `agentClient.executeAgentQuery()`                | `SkillExecutor.execute()` + RuntimeResolver |
| sync-manager.ts   | `skillExecutor.execute("modifier", projectPath)` | 変更なし（skill-executor 経由のまま）       |
| ipc-handlers.ts   | 間接的（skill-executor 経由）                    | 変更なし                                    |

### T-2-5: IPC セキュリティ設計

| 設計項目                    | 内容                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| validateIpcSender           | 全 slide IPC ハンドラに `validateIpcSender()` を追加する                                  |
| P42 準拠 3 段バリデーション | `projectPath` 引数に型チェック → 空文字列 → トリム空文字列の 3 段バリデーションを適用する |
| パストラバーサル検出        | `detectPathTraversal()` を `projectPath` 引数に適用する（slideSettings と同じパターン）   |
| ALLOWED_INVOKE_CHANNELS     | Preload の whitelist に slide 系チャネルを登録する                                        |
| ALLOWED_ON_CHANNELS         | Preload の whitelist に slide 系 push チャネルを登録する                                  |

### T-2-6: IPC チャネル名統一設計

Phase 1 T-1-5 で特定した差異を解消する方針を決定する。

| 現行名                | 正本名               | 統一方針       | 影響範囲                                         |
| --------------------- | -------------------- | -------------- | ------------------------------------------------ |
| `slide:startWatching` | `slide:watch-start`  | 正本に合わせる | ipc-handlers.ts, channels.ts, SlideWorkspace.tsx |
| `slide:stopWatching`  | `slide:watch-stop`   | 正本に合わせる | 同上                                             |
| `slide:manualSync`    | `slide:reverse-sync` | 正本に合わせる | 同上                                             |
| `slide:getSyncStatus` | `slide:sync-status`  | 正本に合わせる | 同上                                             |

### T-2-7: UI/UX 設計（Slide / Modifier surface）

ui-ux-realization.md の Slide/Modifier 行に基づき、4 領域で構成する。

| 領域                     | コンポーネント       | 表示内容                                                                   |
| ------------------------ | -------------------- | -------------------------------------------------------------------------- |
| Sync Card                | `SlideSyncCard`      | sync status badge (`synced`/`running`/`degraded`/`guidance`)、最終同期時刻 |
| Progress Row             | `SlideProgressRow`   | sync progress bar、percent、message                                        |
| Watch Status             | `SlideWatchStatus`   | watcher active/inactive badge、watch 対象パス                              |
| Manual Fallback Guidance | `SlideGuidanceBlock` | failure reason、再設定手順、terminal handoff CTA                           |

**状態と CTA の対応**:

| 状態       | 表示                            | Primary CTA           | Secondary CTA            |
| ---------- | ------------------------------- | --------------------- | ------------------------ |
| `synced`   | 「同期済み」badge (green)       | `reverse-sync を実行` | `watch status を確認`    |
| `running`  | progress bar + message          | `キャンセル`          | —                        |
| `degraded` | warning badge (orange) + reason | `再試行`              | `manual fallback を開く` |
| `guidance` | guidance block (blue)           | `API key を設定`      | `terminal を開く`        |

**マイクロコピー**: degraded 状態では「いま何が失敗しているか」と「次に手動で何をするか」を同時に示す（ui-ux-realization.md 体験原則「回復導線の同居」準拠）。

## 3 Lane / SubAgent 分担

| Lane | 主担当タスク        | 閉じる Concern                                              |
| ---- | ------------------- | ----------------------------------------------------------- |
| 1    | T-2-1, T-2-2, T-2-4 | runtime routing / lifecycle orchestration / Direct SDK 排除 |
| 2    | T-2-3, T-2-5, T-2-6 | IPC / state / security / channel rename                     |
| 3    | T-2-7               | user-facing UI / guidance / progress / watch surface        |

## Concern / AC 対応

| Concern                 | 主タスク     | 閉じる AC        |
| ----------------------- | ------------ | ---------------- |
| Runtime Routing         | T-2-1, T-2-6 | AC-1, AC-3, AC-4 |
| Lifecycle Orchestration | T-2-2        | AC-1, AC-2       |
| IPC / State / Security  | T-2-3, T-2-5 | AC-2, AC-5       |
| UI / UX                 | T-2-7        | AC-6             |

## Validation Matrix

| Concern            | 確認コマンド                 | 期待する確認        | 戻り先            |
| ------------------ | ---------------------------- | ------------------- | ----------------- | --------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------- | ------------------------------------------------- | ------------ |
| Runtime Routing    | `rg -n "RuntimeResolver      | IAuthKeyService     | @anthropic-ai/sdk | electron-store                    | process\\.env\\.ANTHROPIC_API_KEY" apps/desktop/src/main/slide/` | `RuntimeResolver` / `IAuthKeyService` が正規経路で、Direct SDK / store / env fallback が排除対象として特定できる | T-2-1, T-2-4 |
| IPC Naming         | `rg -n "slide:(startWatching | stopWatching        | manualSync        | getSyncStatus                     | watch-start                                                      | watch-stop                                                                                                       | reverse-sync | sync-status)" apps/desktop/src/`   | 現行名と正本名の rename 対象が 4 系統で確認できる | T-2-6        |
| Security / Preload | `rg -n "validateIpcSender    | detectPathTraversal | ALLOWED\_(INVOKE  | ON)\_CHANNELS" apps/desktop/src/` | sender guard / path guard / whitelist の反映点が確認できる       | T-2-5                                                                                                            |
| State / UI         | `rg -n "sync-status          | sync-progress       | sync-error        | watch-status                      | Slide(SyncCard                                                   | ProgressRow                                                                                                      | WatchStatus  | GuidanceBlock)" apps/desktop/src/` | push channel と 4 領域 UI の対応が確認できる      | T-2-3, T-2-7 |

## 参照資料

| 参照資料             | パス                                                                       | 内容                                                      |
| -------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- |
| Phase 1（要件定義）  | `phase-1-requirements.md`                                                  | 依存する前提成果物を確認する                              |
| pack parent index    | `docs/30-workflows/ai-runtime-authmode-unification/index.md`               | 実行順序、依存グラフ、共通方針の正本を確認する            |
| pack design audit    | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md` | 多角的監査の結論、禁止事項、依存整合を確認する            |
| pack UI/UX 図解      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`      | 5 図セットの画面構成、状態遷移、CTA 導線を確認する        |
| pack UI/UX 正本      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`   | slide sync card、progress row、manual fallback を確認する |
| slide skill-executor | `apps/desktop/src/main/slide/skill-executor.ts`                            | slide skill execute の current path を確認する            |
| slide agent-client   | `apps/desktop/src/main/slide/agent-client.ts`                              | legacy agent client の current path を確認する            |
| modifier-skill       | `apps/desktop/src/main/slide/modifier-skill.ts`                            | reverse-sync modifier の current path を確認する          |
| slide IPC handlers   | `apps/desktop/src/main/slide/ipc-handlers.ts`                              | reverse-sync / watch IPC の current path を確認する       |
| sync-manager         | `apps/desktop/src/main/slide/sync-manager.ts`                              | watcher と sync status の authority を確認する            |
| SlideWorkspace       | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`                       | slide renderer surface と reverse-sync 導線を確認する     |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「設計判断に直接使う正本」だけを重点確認する。

| 参照資料                             | パス                                                                                            | 内容                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| api-ipc-system                       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | slide reverse-sync / watch IPC の正本                                    |
| workflow-ai-runtime-authmode         | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | step-01 foundation 契約、Task03 完了同期、canonical set の正本           |
| interfaces-auth                      | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | capability / auth-mode DTO / status transport の正本                     |
| llm-ipc-types                        | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                            | runtime health / auth-mode transport DTO の正本                          |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | guidance / error / CTA surface の正本                                    |
| llm-workspace-chat-edit              | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | RuntimeResolver / TerminalHandoffBuilder / integrated-handoff の再利用元 |
| api-ipc-agent-core                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                       | `handoff` / `guidance` / `AUTHENTICATION_ERROR` transport                |
| security-electron-ipc-core           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`               | sender 検証順序、secret 非中継、auth-mode IPC 境界の正本                 |
| arch-state-management-reference      | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md`          | handoffGuidance / stale state 防止 / dismiss 契約の正本                  |
| arch-electron-services-details-part2 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`     | RuntimeResolver / handoff builder / DI 注入順の正本                      |

## 実行手順

### ステップ1: Phase 1 成果物を確認する

Phase 1 の `requirements-definition.md` と `scope-definition.md` を読み、経路マップ / Direct SDK 箇所一覧 / IPC 契約比較表 / role 対応付けを入力とする。

### ステップ2: T-2-1〜T-2-7 を Concern ごとに実施する

4 Concern を以下の順序で設計する:

1. Runtime Routing（T-2-1, T-2-4）— agent-client.ts 廃止と RuntimeResolver 統合
2. Lifecycle Orchestration（T-2-2）— FileWatcher / SyncManager / ModifierSkill の DI 設計
3. IPC / Security（T-2-3, T-2-5, T-2-6）— チャネル統一 / セキュリティ / Zustand slice
4. UI/UX（T-2-7）— sync card / progress / guidance の 4 領域設計

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、foundation、runtime routing、handoff DTO、UI、security、state、DI 配線のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

reverse-sync、watch-start/stop、sync status/progress/error、legacy agent client、guidance の契約、state、IPC、security 境界を設計へ反映する。

| 統合テスト観点            | 設計への反映                                                            |
| ------------------------- | ----------------------------------------------------------------------- |
| reverse-sync 自動トリガー | T-2-2 で FileWatcher → SyncManager → SkillExecutor の自動パスを設計する |
| watch lifecycle           | T-2-3 で watch-start/stop の state 管理と push チャネルを設計する       |
| sync status push          | T-2-3 で Main → Renderer の push 経路と Zustand slideSlice を設計する   |
| runtime 分岐              | T-2-1 で integrated / handoff の分岐テスト観点を定義する                |
| guidance 表示             | T-2-7 で degraded / guidance 状態の UI テスト観点を定義する             |
| security                  | T-2-5 で validateIpcSender / パストラバーサル検出のテスト観点を定義する |

## 多角的チェック観点

| 観点               | 適用判断             | チェック項目                                                                             |
| ------------------ | -------------------- | ---------------------------------------------------------------------------------------- |
| セキュリティ       | IPC ハンドラ設計     | validateIpcSender / パストラバーサル検出が全チャネルに適用されているか                   |
| アーキテクチャ     | DI 設計              | IPC ハンドラの依存先が Port/Interface であること（P61 対策）                             |
| アーキテクチャ     | agent-client.ts 廃止 | 呼び出し元への影響が全て分析されているか                                                 |
| UI/UX              | Slide surface        | ui-ux-realization.md の 4 状態（synced/running/degraded/guidance）が全て設計されているか |
| State Management   | Zustand slice        | slideSlice の設計が P31/P48 リスクを回避しているか（個別セレクタ使用）                   |
| API 設計           | IPC チャネル         | 正本仕様との名称統一が完了しているか                                                     |
| エラーハンドリング | error code           | 4 種類の error code が execute 契約と整合しているか                                      |

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. Phase 1 成果物の確認
2. T-2-1 Shared Runtime Policy 設計
3. T-2-2 Role 設計
4. T-2-3 Authority 設計
5. T-2-4 Direct SDK 排除設計
6. T-2-5 IPC セキュリティ設計
7. T-2-6 IPC チャネル名統一設計
8. T-2-7 UI/UX 設計
9. 統合テスト連携の設計反映
10. 成果物の作成・配置

## 成果物

| 成果物       | パス                                   | 内容                                             |
| ------------ | -------------------------------------- | ------------------------------------------------ |
| 設計サマリー | `outputs/phase-2/design-summary.md`    | 責務境界、依存関係、接続順序を整理する           |
| 契約一覧     | `outputs/phase-2/contract-matrix.md`   | IPC、state、runtime 契約を一覧化する             |
| UI/UX 実体化 | `outputs/phase-2/ui-ux-realization.md` | sync card、progress、guidance の見せ方を整理する |

## 完了条件

- [ ] shared runtime policy が slide reverse-sync / modifier / legacy agent まで定義されている
- [ ] agent-client.ts 廃止の影響分析が完了し、全呼び出し元の移行先が明記されている
- [ ] direct SDK read 排除と UI surface の責務分離が明文化されている
- [ ] IPC チャネル名が正本仕様に統一されている（4 チャネルの rename 方針確定）
- [ ] validateIpcSender + P42 準拠 3 段バリデーション + パストラバーサル検出が全チャネルに設計されている
- [ ] slide sync / degraded / manual fallback の UI 状態が 4 領域で定義されている
- [ ] Zustand slideSlice の型定義と個別セレクタが設計されている（P31/P48 対策込み）
- [ ] ModifierSkill の二重実装解消方針が明記されている
- [ ] **本 Phase 内の全タスク（T-2-1〜T-2-7）を 100% 実行完了**

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（T-2-1〜T-2-7）を 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次の Phase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
- Phase 1-3 完了前に Phase 4 へ進まないこと
