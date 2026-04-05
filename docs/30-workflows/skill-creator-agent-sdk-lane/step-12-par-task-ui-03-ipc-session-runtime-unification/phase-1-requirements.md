# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| Phase名    | 要件定義                        |
| 機能名     | ipc-session-runtime-unification |
| 対象機能   | TASK-UI-03 IPC 二重経路統合     |
| 前提Phase  | -                               |
| 次Phase    | Phase 2: 設計                   |
| ステータス | pending                         |
| 作成日     | 2026-04-06                      |

## 目的

Session IPC と Runtime IPC の全チャネルを網羅的に列挙し、重複・差分・セキュリティ適用状況を分析して統合方針の基礎資料を作成する。

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の IPC 実装状態を確認する。

```bash
# Session IPC チャネル一覧
grep -n "handle\|on\|invoke" apps/desktop/src/preload/skill-creator-api.ts

# Runtime IPC チャネル一覧
grep -n "skillCreator" apps/desktop/src/preload/channels.ts

# creatorHandlers の全ハンドラー
grep -n "ipcMain.handle\|ipcMain.on" apps/desktop/src/main/ipc/creatorHandlers.ts

# preload 層の API surface
grep -n "contextBridge.exposeInMainWorld" apps/desktop/src/preload/skill-creator-api.ts

# 共有型定義の session/runtime 分類
grep -n "export\s*type\|export\s*interface" packages/shared/src/types/skillCreator.ts
```

| 判定         | 条件                                        | 対応                           |
| ------------ | ------------------------------------------- | ------------------------------ |
| 二重経路確認 | session + runtime の両 API が公開されている | 統合/分離契約の設計に進行      |
| 片方のみ     | いずれか一方が既に統合済み                  | スコープ見直しをユーザーに確認 |
| 統合済み     | 既に統一された IPC 経路が存在する           | 本タスクの必要性を再評価       |

## 実行タスク

### Task 1: Session IPC チャネル完全列挙

`window.skillCreatorSessionAPI` が公開する全チャネルを列挙する:

- `startSession` — 新規セッション開始
- `sendAnswer` — ユーザー回答の送信
- `onQuestion` — 質問受信リスナー
- `listSessions` — セッション一覧取得
- `getSessionDetail` — セッション詳細取得
- `resumeSession` — セッション再開
- `deleteSession` — セッション削除

各チャネルについて以下を記録する:

- チャネル名
- 方向（renderer→main / main→renderer / 双方向）
- 引数の型
- 戻り値の型
- エラーハンドリングパターン
- セキュリティ適用状況（パストラバーサル防止、sender 検証等）

### Task 2: Runtime IPC チャネル完全列挙

`window.electronAPI.skillCreator` が公開する全チャネルを列挙する:

- `planSkill` — スキル計画作成
- `executePlan` — 計画実行
- `submitUserInput` — ユーザー入力送信
- `getWorkflowState` — ワークフロー状態取得
- `onWorkflowStateChanged` — ワークフロー状態変更リスナー

各チャネルについて Task 1 と同じ項目を記録する。

### Task 3: 重複・差分分析

Session IPC と Runtime IPC の間で:

- **機能的重複**: 同等の機能を異なるチャネル名で提供しているケースの特定
- **状態モデルの差分**: 質問/回答パターン vs ワークフロー状態スナップショットの相違点
- **エラーハンドリングの差分**: 各経路のエラー処理パターンの比較
- **通信パターンの差分**: invoke/handle vs send/on の使い分け

### Task 4: セキュリティ要件確認

両経路のセキュリティ適用状況を `security-skill-ipc-core.md` に基づいて確認する:

- パストラバーサル防止の適用状況
- コマンドインジェクション防止の適用状況
- sender 検証（`event.senderFrame` / `webContents.id`）の適用状況
- チャネルホワイトリストの整合性
- 経路間でセキュリティ適用にギャップがないか

### Task 5: 受入条件の確定

| AC   | 条件                                                                 | 検証方法          |
| ---- | -------------------------------------------------------------------- | ----------------- |
| AC-1 | IPC 経路が統一された設計方針を持つ（統合 or 明確な分離契約）         | 設計レビュー      |
| AC-2 | 新機能開発者がどの IPC 経路を使うべきか明確に判断できる              | ドキュメント確認  |
| AC-3 | preload 層の API surface が整理されている                            | コードレビュー    |
| AC-4 | creatorHandlers.ts のハンドラーが整合的に構成されている              | コードレビュー    |
| AC-5 | IPC 契約チェックリスト（Main/Preload/型定義の同時更新）に準拠        | チェックリスト    |
| AC-6 | セキュリティ要件（パストラバーサル防止等）が両経路で均一に適用される | セキュリティ監査  |
| AC-7 | 既存テストが pass する                                               | CI/ユニットテスト |

### Task 6: スコープ境界

- **含む**: IPC 経路の設計方針策定、preload API surface 整理、creatorHandlers 構成統合、channel 命名規則統一、セキュリティ要件均一化
- **含まない**: UI コンポーネントの全面リライト、WorkflowEngine の状態遷移変更、新規 IPC チャネル追加、Electron バージョンアップ

## 参照資料

| 資料名                   | パス                                                                  | 説明                         |
| ------------------------ | --------------------------------------------------------------------- | ---------------------------- |
| skill-creator-api.ts     | `apps/desktop/src/preload/skill-creator-api.ts`                       | Session IPC API 定義         |
| channels.ts              | `apps/desktop/src/preload/channels.ts`                                | チャネルホワイトリスト       |
| creatorHandlers.ts       | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | Session + Runtime ハンドラー |
| IPC handler registration | `apps/desktop/src/main/ipc/index.ts`                                  | ハンドラー登録               |
| RuntimeFacade            | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | Runtime バックエンド         |
| skillCreator types       | `packages/shared/src/types/skillCreator.ts`                           | 共有型定義                   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                           | 内容                                               |
| ------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- |
| Agent IPC チャネル仕様    | `.agents/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`      | IPC チャネル定義の正本                             |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC修正時の Main/Preload/型定義 同時更新チェック   |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | パストラバーサル防止、コマンドインジェクション防止 |

## 多角的チェック観点

| 観点           | 適用判断                                   | 確認内容                                         |
| -------------- | ------------------------------------------ | ------------------------------------------------ |
| アーキテクチャ | IPC 二重経路の統合設計のため適用           | 経路間の責務境界が明確であること                 |
| IPC通信        | 全チャネルの棚卸しのため適用               | IPC契約チェックリスト準拠                        |
| セキュリティ   | 両経路のセキュリティ適用状況確認のため適用 | パストラバーサル防止、sender検証が均一であること |

## 成果物

| 成果物            | パス                                       | 説明                                             |
| ----------------- | ------------------------------------------ | ------------------------------------------------ |
| 仕様抽出マップ    | `outputs/phase-1/spec-extraction-map.md`   | 二重経路の現状分析、重複・差分・セキュリティ状況 |
| IPCチャネル棚卸し | `outputs/phase-1/ipc-channel-inventory.md` | 全チャネルの完全な一覧と属性                     |

## 完了条件

- [ ] P50チェックで対象ファイルの現在状態を確認した
- [ ] Session IPC の全チャネルが列挙されている
- [ ] Runtime IPC の全チャネルが列挙されている
- [ ] 重複・差分分析が完了している
- [ ] セキュリティ要件の適用状況が両経路で確認されている
- [ ] AC-1〜AC-7 が検証可能な形で定義されている
- [ ] 含む / 含まないが明確である
- [ ] aiworkflow-requirements の関連仕様（ipc-contract-checklist.md, security-skill-ipc-core.md）を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
