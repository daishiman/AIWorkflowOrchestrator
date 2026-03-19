# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 1                                       |
| Phase名    | 要件定義                                |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| 前提Phase  | なし                                    |
| 後続Phase  | Phase 2（設計）                         |
| ステータス | completed                               |
| 作成日     | 2026-03-13                              |
| 更新日     | 2026-03-19                              |
| 機能名     | slide-ai-runtime-alignment              |

## 目的

Slide / Modifier / Legacy Agent の現状 runtime / 認証経路を網羅的に棚卸しし、integrated runtime への整流要件と維持すべき reverse-sync / watcher / guidance 契約を定義する。

## 実行タスク

- T-1-1 経路棚卸し: slide main / renderer / shared type の current path を棚卸しする
- T-1-2 Direct SDK / Silent Fallback の特定: 排除対象を file:line で固定する
- T-1-3 既存保証抽出: slide IPC 契約と維持対象を正本仕様から抜き出す
- T-1-4 Role 対応付け: watcher / modifier / reverse-sync / legacy agent の責務を固定する
- T-1-5 IPC チャネル名称の正本統一確認: 現行名と canonical 名の差分を確定する

### T-1-1: 経路棚卸し

以下の 7 ファイルの runtime / 認証経路を整理し、現状マップを作成する。

| 対象ファイル   | パス                                                 | 調査観点                                                                                         |
| -------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| skill-executor | `apps/desktop/src/main/slide/skill-executor.ts`      | phase 分岐ロジック、modifier 呼び出し経路、runtime engine 選択                                   |
| agent-client   | `apps/desktop/src/main/slide/agent-client.ts`        | `@anthropic-ai/sdk` 直 import、`electron-store` 直読み、`process.env.ANTHROPIC_API_KEY` fallback |
| modifier-skill | `apps/desktop/src/main/slide/modifier-skill.ts`      | `createModifierSkill()` の呼び出し元、ipc-handlers.ts との接続有無                               |
| ipc-handlers   | `apps/desktop/src/main/slide/ipc-handlers.ts`        | `SLIDE_IPC_CHANNELS` 定義、`validateIpcSender` 未実装箇所、`onHtmlChange` 未登録                 |
| sync-manager   | `apps/desktop/src/main/slide/sync-manager.ts`        | `reverseSync()` の公開経路、watcher lifecycle                                                    |
| file-watcher   | `apps/desktop/src/main/slide/file-watcher.ts`        | chokidar watch 対象、`onHtmlChange` / `onStructureChange` コールバック                           |
| SlideWorkspace | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | Zustand store 依存、CTA ボタン、degraded / guidance 表示の有無                                   |

**期待成果**: 各ファイルの「現状の認証取得方法」「runtime engine」「fallback パス」を表形式で整理する。

### T-1-2: Direct SDK / Silent Fallback の特定

以下の問題箇所を具体的なファイル:行番号で列挙する。

| 問題カテゴリ          | 確認コマンド                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Direct SDK import     | `grep -rn "from.*@anthropic-ai/sdk" apps/desktop/src/main/slide/`                          |
| electron-store 直読み | `grep -rn "new Store" apps/desktop/src/main/slide/`                                        |
| 環境変数 fallback     | `grep -rn "process.env.ANTHROPIC_API_KEY" apps/desktop/src/main/slide/`                    |
| simulated 実行パス    | `grep -rn "simulate\|シミュレーション" apps/desktop/src/main/slide/`                       |
| コメントと実態の乖離  | `agent-client.ts` L158-164 のコメント「シミュレーション実装」と実際の SDK 呼び出しの不整合 |

### T-1-3: 既存保証抽出

維持すべき IPC 契約を正本仕様（`api-ipc-system.md` の slide core セクション）と現行実装の両方から抽出する。

| IPC チャネル              | 方向          | 現行実装状態 | 正本仕様定義               | 維持判定                 |
| ------------------------- | ------------- | ------------ | -------------------------- | ------------------------ |
| `slide:executePhase`      | Renderer→Main | 実装済       | -                          | 維持（runtime 切替対象） |
| `slide:startWatching`     | Renderer→Main | 実装済       | `slide:watch-start`        | 名称統一要検討           |
| `slide:stopWatching`      | Renderer→Main | 実装済       | `slide:watch-stop`         | 名称統一要検討           |
| `slide:getSyncStatus`     | Renderer→Main | 実装済       | `slide:sync-status`        | 維持                     |
| `slide:manualSync`        | Renderer→Main | 実装済       | `slide:reverse-sync`       | 名称統一要検討           |
| `slide:cancelExecution`   | Renderer→Main | 実装済       | -                          | 維持                     |
| `slide:structureChanged`  | Main→Renderer | 実装済       | -                          | 維持                     |
| `slide:syncStatusChanged` | Main→Renderer | 実装済       | `slide:sync-status` push   | 維持                     |
| `slide:executionProgress` | Main→Renderer | 実装済       | `slide:sync-progress` push | 維持                     |

### T-1-4: Role 対応付け

| Internal Role       | 現行実装                                             | 正本仕様上の位置付け                        | 要件上の扱い                           |
| ------------------- | ---------------------------------------------------- | ------------------------------------------- | -------------------------------------- |
| Watcher             | `file-watcher.ts` (chokidar)                         | `slide:watch-start/stop` で制御             | runtime 切替の影響範囲を分離して棚卸し |
| Modifier            | `modifier-skill.ts` + `skill-executor.ts` (二重実装) | ModifierSkill in interfaces-agent-sdk-skill | 統合対象として drift を記録する        |
| Reverse-Sync        | `sync-manager.ts` (IPC 未公開)                       | `slide:reverse-sync`                        | 公開 IPC 契約との差分を記録する        |
| Legacy Agent Client | `agent-client.ts` (Direct SDK)                       | なし（排除対象）                            | 排除候補として依存箇所を列挙する       |

### T-1-5: IPC チャネル名称の正本統一確認

現行実装のチャネル名と正本仕様のチャネル名の差異を列挙し、Phase 2 で統一方針を決定する入力とする。

| 現行実装チャネル名    | 正本仕様チャネル名   | 差異                       |
| --------------------- | -------------------- | -------------------------- |
| `slide:startWatching` | `slide:watch-start`  | 動詞形式 vs ハイフン区切り |
| `slide:stopWatching`  | `slide:watch-stop`   | 同上                       |
| `slide:manualSync`    | `slide:reverse-sync` | 動作名が異なる             |
| `slide:getSyncStatus` | `slide:sync-status`  | get プレフィックス有無     |

## Acceptance Criteria

| ID   | 内容                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------- |
| AC-1 | runtime と auth-mode の現状経路が slide reverse-sync / modifier / legacy agent / file-watcher まで整理されている |
| AC-2 | 維持すべき reverse-sync / watcher / guidance 契約が IPC チャネル単位で抜き出されている                           |
| AC-3 | Direct SDK import / electron-store 直読み / env fallback の候補箇所が漏れなく列挙されている                      |
| AC-4 | 現行チャネル名と正本チャネル名の差異が 4 系統で列挙されている                                                    |
| AC-5 | 未接続パスとスコープ外項目が requirements として記録されている                                                   |
| AC-6 | user-facing に維持すべき degraded / guidance / sync 状態が後続 Phase へ引き継げる形で記録されている              |

## 参照資料

| 参照資料             | パス                                                 | 内容                                                  |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| slide skill-executor | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する        |
| slide agent-client   | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する        |
| modifier-skill       | `apps/desktop/src/main/slide/modifier-skill.ts`      | reverse-sync modifier の current path を確認する      |
| slide IPC handlers   | `apps/desktop/src/main/slide/ipc-handlers.ts`        | reverse-sync / watch IPC の current path を確認する   |
| sync-manager         | `apps/desktop/src/main/slide/sync-manager.ts`        | watcher と sync status の authority を確認する        |
| file-watcher         | `apps/desktop/src/main/slide/file-watcher.ts`        | chokidar watch と html/structure callback を確認する  |
| SlideWorkspace       | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する |
| slide store          | `apps/desktop/src/renderer/slide/store.ts`           | Zustand store の状態定義を確認する                    |
| shared types         | `packages/shared/src/slide/types.ts`                 | 共有型定義を確認する                                  |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「現状棚卸し」と「foundation 契約確認」に必要なものだけを重点確認する。

| 参照資料                     | パス                                                                                            | 内容                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| api-ipc-system               | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | slide reverse-sync / watch IPC の正本                                     |
| workflow-ai-runtime-authmode | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | step-01 foundation 契約、current canonical set、artifact inventory の正本 |
| interfaces-auth              | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | capability / auth-mode DTO / status transport の正本                      |
| llm-ipc-types                | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                            | auth-mode / health / runtime DTO 命名の正本                               |
| api-ipc-agent-core           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                       | `handoff` / `guidance` / `AUTHENTICATION_ERROR` transport の正本          |
| llm-workspace-chat-edit      | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | RuntimeResolver / handoff / guidance DTO の再利用元                       |
| security-electron-ipc-core   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`               | sender 検証順序、secret 非中継、auth-mode IPC 境界の正本                  |

### パック横断参照

| 参照資料          | パス                                                                                                          | 内容                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| pack parent index | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                  | 実行順序、依存グラフ、共通方針              |
| pack design audit | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                    | 多角的監査の結論、禁止事項                  |
| pack UI/UX 正本   | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                      | Slide/Modifier の状態・CTA・guidance 契約   |
| pack UI/UX 図解   | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                         | 5 図セットの画面構成                        |
| Task01 foundation | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/` | access matrix / resolver / fail-fast の正本 |

## 実行手順

### ステップ1: 参照資料を読み込む

1. 上記「参照資料」テーブルの全ファイルを Read で確認する
2. `packages/shared/src/slide/types.ts` で共有型定義（`SyncStatus`, `SyncDirection`, `SkillPhase`）を確認する
3. Task01 の Phase 1-3 成果物から access matrix / RuntimeResolver の契約を確認する

### ステップ2: T-1-1 経路棚卸しを実施する

1. 各ファイルの runtime / 認証経路を表形式で整理する
2. 現行の認証取得フロー図を作成する:
   ```
   agent-client.ts → electron-store 直読み → safeStorage 復号 → Anthropic SDK 直呼び出し
   (期待) → IAuthKeyService.getKey() → RuntimeResolver → SkillExecutor → Claude Agent SDK
   ```

### ステップ3: T-1-2 Direct SDK / Silent Fallback を特定する

1. 上記 grep コマンドを実行し、問題箇所を列挙する
2. 各問題箇所の「排除方法」と「影響範囲」を記録する

### ステップ4: T-1-3〜T-1-5 を実施する

1. IPC 契約の現行 / 正本比較表を完成させる
2. Role 対応付けテーブルを完成させる
3. チャネル名称の差異リストを完成させる

### ステップ5: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、以下を確認する:

- IPC チャネル定義が api-ipc-system.md と整合するか
- capability / auth-mode transport が interfaces-auth.md / llm-ipc-types.md と整合するか
- execute 契約が interfaces-agent-sdk-executor.md の RuntimeResolver 分岐と整合するか
- セキュリティ要件が security-api-electron.md の validateIpcSender 必須ルールと整合するか
- handoff / guidance の返却形が llm-workspace-chat-edit.md / api-ipc-agent-core.md と整合するか
- follow-up 導線が task-workflow.md / lessons-learned.md / 未タスク正本へ接続できるか

### ステップ6: 成果物と完了条件を確認する

成果物パス、完了条件チェックリスト、Phase 2 への handoff 情報を確認して記録する。

## 統合テスト連携

以下の接続要件を要件として明文化する:

| 接続点                     | 現状                                                  | 要件                                                                  |
| -------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| reverse-sync 自動トリガー  | `onHtmlChange` が ipc-handlers.ts で未登録            | file-watcher → sync-manager → integrated runtime の自動パスを確立する |
| watch-start/stop lifecycle | 実装済だが validateIpcSender なし                     | P42 準拠 3 段バリデーション + sender 検証を追加する                   |
| sync status push           | `slide:syncStatusChanged` で Main→Renderer push       | Zustand slideSlice への受信経路を確立する                             |
| execution progress push    | `slide:executionProgress` で Main→Renderer push       | Zustand slideSlice への受信経路を確立する                             |
| sync error push            | 現行実装に sync-error push なし                       | `slide:sync-error` push を追加し error code 体系と整合させる          |
| legacy agent client 排除   | agent-client.ts が Direct SDK + electron-store 直読み | IAuthKeyService + RuntimeResolver 経由に置換する                      |
| guidance 表示              | SlideWorkspace に degraded/guidance 表示なし          | `degraded` / `guidance` 状態の UI 表示を追加する                      |

## 多角的チェック観点

| 観点               | 適用判断                                        | チェック項目                                                                                                  |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | slide IPC ハンドラに validateIpcSender が未実装 | `ipc-handlers.ts` の全チャネルに sender 検証を追加する設計になっているか                                      |
| セキュリティ       | API key 取得経路が IAuthKeyService 以外を使用   | electron-store 直読みと env fallback を排除する要件が定義されているか                                         |
| アーキテクチャ     | Direct SDK 呼び出しが残存                       | `@anthropic-ai/sdk` 直 import を RuntimeResolver / SkillExecutor 経由に置換する要件が定義されているか         |
| UI/UX              | degraded / guidance 表示が未実装                | ui-ux-realization.md の Slide/Modifier 行（synced/running/degraded/guidance）と整合する要件が定義されているか |
| State Management   | slide 用 Zustand slice が未定義                 | SyncStatus / SyncDirection / syncProgress の Zustand 管理要件が定義されているか                               |
| エラーハンドリング | error code が 4 種類のみ                        | AGENT_ERROR / FILE_ERROR / TIMEOUT / VALIDATION_ERROR の体系が execute 契約の error code と整合しているか     |

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（ソースファイル / 正本仕様 / パック横断参照）
2. T-1-1 経路棚卸し
3. T-1-2 Direct SDK / Silent Fallback 特定
4. T-1-3 既存保証抽出
5. T-1-4 Role 対応付け
6. T-1-5 IPC チャネル名称統一確認
7. 統合テスト連携の明文化
8. 成果物の作成・配置

## 成果物

| 成果物       | パス                                         | 内容                                                                                                   |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | runtime 経路マップ、Direct SDK 箇所一覧、IPC 契約比較表、role 対応付け、acceptance criteria を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲（7 ファイル + shared types）と除外範囲（slideSettings は実装済のため除外）を明記する          |

## 完了条件

- [ ] runtime と auth-mode の現状経路が slide reverse-sync / modifier / legacy agent / file-watcher まで整理されている
- [ ] Direct SDK import / electron-store 直読み / env fallback の全箇所がファイル:行番号で列挙されている
- [ ] 維持すべき reverse-sync / watcher / guidance 契約が IPC チャネル単位で抜き出されている
- [ ] IPC チャネル名称の現行 / 正本差異が列挙されている
- [ ] 未接続パス（onHtmlChange 未登録、reverseSync 未公開）が問題として記録されている
- [ ] slideSettings 系が今回の対象外として明記されている
- [ ] **本 Phase 内の全タスク（T-1-1〜T-1-5）を 100% 実行完了**

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（T-1-1〜T-1-5）を 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次の Phase

- [Phase 2（設計）](./phase-2-design.md) に進む
- Phase 1-3 完了前に Phase 4 へ進まないこと
