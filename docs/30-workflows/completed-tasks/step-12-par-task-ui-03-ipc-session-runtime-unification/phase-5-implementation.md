# Phase 5: 実装

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| Phase名    | 実装                            |
| 機能名     | ipc-session-runtime-unification |
| 対象機能   | TASK-UI-03 IPC 二重経路統合     |
| 前提Phase  | Phase 4: テスト作成             |
| 次Phase    | Phase 6: テスト拡充             |
| ステータス | pending                         |
| 作成日     | 2026-04-06                      |

## 目的

Phase 2 の設計に基づき、preload 層の変更、creatorHandlers の整合化、channels.ts の更新、型定義の変更を実装する。

## 実行手順

### 0. 実装前チェック（必須）

```bash
# 現行テストが全て pass することを確認
pnpm --filter @repo/desktop test -- --run

# TASK-UI-01 の完了状態を確認（依存タスク）
git log --oneline --all | grep -i "TASK-UI-01\|ui-01\|route-promotion"
```

## 実行タスク

### Task 1: preload 層の変更

- `apps/desktop/src/preload/skill-creator-api.ts` を設計に基づいて変更する
- Session IPC と Runtime IPC の API surface を整理する
- `contextBridge.exposeInMainWorld` の呼び出し構造を統一する
- 型安全性を維持しつつ API を再構成する

**変更対象ファイル**:

- `apps/desktop/src/preload/skill-creator-api.ts`

### Task 2: creatorHandlers の整合化

- `apps/desktop/src/main/ipc/creatorHandlers.ts` のハンドラー構成を整合化する
- Session ハンドラーと Runtime ハンドラーの明確なグルーピングを実装する
- 共通のエラーハンドリングミドルウェアを適用する
- セキュリティチェック（sender 検証、パストラバーサル防止）を全ハンドラーに均一適用する

**変更対象ファイル**:

- `apps/desktop/src/main/ipc/creatorHandlers.ts`

### Task 3: channels.ts のチャネル定義更新

- `apps/desktop/src/preload/channels.ts` のチャネルホワイトリストを設計の命名規則に合わせて更新する
- 新しい namespace prefix を適用する
- 不要なチャネル定義を除去する
- ホワイトリストの構造化を実装する

**変更対象ファイル**:

- `apps/desktop/src/preload/channels.ts`

### Task 4: 型定義の変更

- `packages/shared/src/types/skillCreator.ts` の型構造を設計に合わせて変更する
- Session 系の型と Runtime 系の型を整理する
- 共通型（エラー型、結果型）を抽出する
- 型の export 構造を整理する

**変更対象ファイル**:

- `packages/shared/src/types/skillCreator.ts`

### Task 5: IPC ハンドラー登録の更新

- `apps/desktop/src/main/ipc/index.ts` のハンドラー登録パターンを統一する
- 変更されたチャネル名に合わせてインポートと登録を更新する

**変更対象ファイル**:

- `apps/desktop/src/main/ipc/index.ts`

### Task 6: IPC 契約チェックリスト準拠確認

実装完了後に以下を確認する:

- [ ] Main Process ハンドラー（creatorHandlers.ts）の変更が型定義と同期している
- [ ] Preload API（skill-creator-api.ts）の変更が Main ハンドラーと整合している
- [ ] 型定義（skillCreator.ts）の変更が Main/Preload 両方に反映されている
- [ ] チャネルホワイトリスト（channels.ts）が全チャネルを網羅している

## 参照資料

| 資料名             | パス                                                                  | 説明            |
| ------------------ | --------------------------------------------------------------------- | --------------- |
| テストマトリクス   | `outputs/phase-4/test-matrix.md`                                      | fail-first 観点 |
| 設計成果物         | `outputs/phase-2/design-document.md`                                  | 実装の根拠      |
| 統合戦略書         | `outputs/phase-2/ipc-unification-strategy.md`                         | 方針選択の根拠  |
| skill-creator-api  | `apps/desktop/src/preload/skill-creator-api.ts`                       | 修正本体        |
| channels.ts        | `apps/desktop/src/preload/channels.ts`                                | 修正本体        |
| creatorHandlers    | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | 修正本体        |
| IPC registration   | `apps/desktop/src/main/ipc/index.ts`                                  | 修正本体        |
| RuntimeFacade      | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 接続点確認      |
| skillCreator types | `packages/shared/src/types/skillCreator.ts`                           | 型定義修正対象  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                           | 内容                                  |
| ------------------------- | ------------------------------------------------------------------------------ | ------------------------------------- |
| Agent IPC チャネル仕様    | `.agents/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`      | IPC チャネル定義の正本                |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | Main/Preload/型定義の同時更新チェック |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | セキュリティパターン                  |

## 多角的チェック観点

| 観点               | 適用判断                               | 確認内容                                    |
| ------------------ | -------------------------------------- | ------------------------------------------- |
| アーキテクチャ     | IPC 構造変更のため適用                 | 変更が既存パターンと一致すること            |
| IPC通信            | チャネル定義・ハンドラー変更のため適用 | IPC契約チェックリスト準拠                   |
| セキュリティ       | セキュリティ共通化実装のため適用       | パストラバーサル防止、sender 検証の均一適用 |
| エラーハンドリング | 共通エラー処理の実装のため適用         | graceful degradation の維持                 |

## 統合テスト連携

- Phase 4 で定義した fail-first テストケースを pass に反転する
- IPC 契約チェックリストの全項目が実装で満たされていることを確認する

## 成果物

| 成果物   | パス                                       | 説明                                                      |
| -------- | ------------------------------------------ | --------------------------------------------------------- |
| 実装記録 | `outputs/phase-5/implementation-record.md` | 変更ファイル一覧、チャネル変更マップ、IPC契約チェック結果 |

## 完了条件

- [ ] preload 層の API surface が設計通りに整理されている
- [ ] creatorHandlers のハンドラーが整合的に構成されている
- [ ] channels.ts のチャネル定義が命名規則に準拠している
- [ ] 型定義が整理されている
- [ ] IPC ハンドラー登録が更新されている
- [ ] IPC 契約チェックリスト（Main/Preload/型定義の同時更新）に準拠している
- [ ] セキュリティ要件が両経路で均一に適用されている
- [ ] Phase 4 のテストが全て pass する
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
