# TASK-IMP-WORKSPACE-CHAT-EDIT-SPEC-SYNC-IPC-001: chat-edit IPC 契約仕様書同期 - タスク指示書

## メタ情報

```yaml
issue_number: 1223
task_id: TASK-IMP-WORKSPACE-CHAT-EDIT-SPEC-SYNC-IPC-001
task_name: chat-edit IPC 契約仕様書同期（F-M02）
category: 改善
target_feature: chat-edit チャンネル IPC 契約（Main/Preload/仕様書 3 点突合）
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12（2026-03-14）
created_date: 2026-03-14
```

| 項目         | 内容                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------ |
| タスクID     | TASK-IMP-WORKSPACE-CHAT-EDIT-SPEC-SYNC-IPC-001                                                   |
| タスク名     | chat-edit IPC 契約仕様書同期（F-M02）                                                            |
| 分類         | 改善                                                                                             |
| 対象機能     | `chatEditHandlers.ts` / `chatEditApi.ts` / `api-ipc-agent-core.md` / `ipc-contract-checklist.md` |
| 優先度       | 中                                                                                               |
| 見積もり規模 | 小規模                                                                                           |
| ステータス   | 未実施                                                                                           |
| 発見元       | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12（2026-03-14）                               |
| 発見日       | 2026-03-14                                                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001` の実装により、`chat-edit:send-with-context` チャンネルの Request/Response 型が変更された。具体的には以下の変更が発生した:

- `workspacePath` フィールドが Request 型に追加された
- `message` フィールドが必須から optional に変更された
- `handoff` / `guidance` フィールドが Response 型に追加された
- `chatEditApi.ts` の contextBridge 呼び出し方式が window 直接代入から `contextBridge.exposeInMainWorld` に修正された（M-01 対応）
- `chatEditSlice` に `selection` / `setSelection` が追加された
- RuntimeResolver による handoff 分岐の新チャンネル契約が追加された

しかし、これらの実装変更に対して以下の仕様書群が完全には追従していない可能性がある:

- `api-ipc-agent-core.md` の chat-edit:send-with-context 仕様が設計時の記述のままになっている箇所がある
- `ipc-contract-checklist.md` に対して chat-edit チャンネルの Phase 1-6 検証が未実施である
- `security-electron-ipc-core.md` に M-01 修正（contextBridge 対応）の監査コマンドが追加されていない

### 1.2 問題点・課題

1. **IPC 契約ドリフト（P44/P45 パターン）**: `api-ipc-agent-core.md` に記載された Request/Response 型定義が実装と乖離したまま放置されると、将来の実装者が誤った契約に基づいて開発する
2. **ipc-contract-checklist.md 未検証**: chat-edit チャンネルについて Phase 1-6 の検証が実施されておらず、契約整合性が未保証の状態
3. **M-01 修正の監査コマンド未追加**: `contextBridge.exposeInMainWorld` への移行が `security-electron-ipc-core.md` の監査コマンドに反映されていないため、将来のリグレッションを自動検出できない
4. **同名ファイルの参照曖昧性（P58）**: `handlers/chatEditHandlers.ts` と `ipc/chatEditHandlers.ts` の二重存在が仕様書のファイル参照を不明確にしている

### 1.3 放置した場合の影響

- IPC 利用側が設計書記載の旧型（`workspacePath` なし、`message` 必須）で実装し、実行時エラーが発生する
- `chatEditApi.ts` の公開チャンネル一覧が不完全なまま仕様書に残り、Preload API 設計の整合性が損なわれる
- M-01 修正（window 直接代入 → contextBridge）のリグレッションが将来の実装で無意識に再現される
- `ipc-contract-checklist.md` の未検証状態が継続し、chat-edit ドメインの IPC セキュリティ品質が不明確なまま

---

## 2. 何を達成するか（What）

### 2.1 目的

`TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001` で行われた IPC 契約変更を、関連するすべての仕様書・チェックリストに完全に同期し、chat-edit チャンネルの IPC 契約が実装・仕様書・チェックリストの 3 点で一致した状態を確立する。

### 2.2 最終ゴール

1. `api-ipc-agent-core.md` の `chat-edit:send-with-context` 仕様が現在の実装（`workspacePath` 追加、`message` optional、`handoff`/`guidance` 追加）を正確に反映している
2. `ipc-contract-checklist.md` で chat-edit チャンネルの Phase 1-6 検証が完了し、結果が記録されている
3. `security-electron-ipc-core.md` に M-01 修正（contextBridge 対応）の監査コマンドが追加されている
4. `chatEditApi.ts` の公開チャンネル一覧が仕様書に正確に記載されている
5. `handlers/chatEditHandlers.ts` と `ipc/chatEditHandlers.ts` の参照関係が仕様書に明記されている

### 2.3 スコープ

#### 含むもの

- `api-ipc-agent-core.md` の chat-edit:send-with-context Request/Response 型定義の同期
- `ipc-contract-checklist.md` における chat-edit チャンネルの Phase 1-6 実施・記録
- `security-electron-ipc-core.md` への M-01 監査コマンド追加
- `chatEditApi.ts` 公開チャンネル一覧の仕様書への反映
- `handlers/chatEditHandlers.ts` vs `ipc/chatEditHandlers.ts` の参照明確化

#### 含まないもの

- chat-edit 機能そのものの実装変更
- IPC チャンネルの新規追加
- 他ドメイン（skill/auth/llm 等）の IPC 仕様書への横展開
- `chatEditSlice` の仕様変更

### 2.4 成果物

| 成果物                         | パス                                                                                                                                             | 変更内容                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| IPC コア仕様書（更新）         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                                                                        | chat-edit:send-with-context の型定義同期      |
| IPC 契約チェックリスト（更新） | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                                                    | chat-edit チャンネル Phase 1-6 検証結果の記録 |
| IPC セキュリティ仕様書（更新） | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                                                                | M-01 修正の監査コマンド追加                   |
| タスク完了記録                 | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-02-par-task-10-claude-code-terminal-surface/` 関連 Phase 12 成果物 | 本タスクの完了記録                            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001` が完了していること（2026-03-14 完了済み）
- 以下のファイルが実装済みであること:
  - `apps/desktop/src/main/ipc/chatEditHandlers.ts`（または `handlers/chatEditHandlers.ts`）
  - `apps/desktop/src/preload/chatEditApi.ts`
  - `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts`

### 3.2 依存タスク

| タスクID                                    | タスク名                            | ステータス         |
| ------------------------------------------- | ----------------------------------- | ------------------ |
| TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 | Workspace Chat Edit AI Runtime 統合 | 完了（2026-03-14） |

### 3.3 実行手順

#### Step 1: 実装の現状確認（正本の確定）

1. `apps/desktop/src/main/ipc/chatEditHandlers.ts` のハンドラー一覧とシグネチャを抽出する

   ```bash
   grep -n "ipcMain.handle\|ipcMain.on" apps/desktop/src/main/ipc/chatEditHandlers.ts
   ```

2. `apps/desktop/src/preload/chatEditApi.ts` の公開メソッド一覧を確認する

   ```bash
   grep -n "safeInvoke\|safeOn\|exposeInMainWorld\|IPC_CHANNELS" apps/desktop/src/preload/chatEditApi.ts
   ```

3. `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts` の型定義を確認する
4. `handlers/chatEditHandlers.ts` と `ipc/chatEditHandlers.ts` の両ファイルが存在するか確認し、どちらが正本かを特定する

   ```bash
   find apps/desktop/src/main -name "chatEditHandlers.ts" -type f
   ```

#### Step 2: api-ipc-agent-core.md の同期

1. 現在の `api-ipc-agent-core.md` の chat-edit セクションを確認する
2. Step 1 で確定した実装の正本と比較し、以下の項目を更新する:
   - `chat-edit:send-with-context` の Request 型（`workspacePath` 追加、`message` optional 化）
   - `chat-edit:send-with-context` の Response 型（`handoff` / `guidance` フィールド追加）
   - `chatEditApi.ts` 公開チャンネル一覧の完全性を確認し、漏れを追記する
3. M-01 修正（contextBridge.exposeInMainWorld への移行）を仕様書のアーキテクチャ説明に反映する

#### Step 3: ipc-contract-checklist.md での chat-edit Phase 1-6 実施

`ipc-contract-checklist.md` の chat-edit チャンネルについて以下を実施・記録する:

- **Phase 1**: チャンネル名がホワイトリスト（`IPC_CHANNELS`）に登録されているか確認
- **Phase 2**: Main Process ハンドラーで送信元ウィンドウの検証があるか確認
- **Phase 3**: 引数バリデーションが P42 準拠（3段階）で実装されているか確認
- **Phase 4**: エラーがサニタイズされて Renderer に返されているか確認
- **Phase 5**: ハンドラー引数形式と Preload 側呼び出し形式が一致しているか確認（P44/P45 確認）
- **Phase 6**: 型定義が実装と仕様書の両方で一致しているか確認

#### Step 4: security-electron-ipc-core.md への M-01 監査コマンド追加

1. M-01 修正の内容（window 直接代入廃止、contextBridge.exposeInMainWorld 統一）を確認する
2. リグレッション検出のための監査コマンドを追加する:

   ```bash
   # window 直接代入のリグレッション検出
   grep -rn "window\.chatEditAPI\s*=" apps/desktop/src/preload/
   # 正しい形式の確認
   grep -n "exposeInMainWorld" apps/desktop/src/preload/chatEditApi.ts
   ```

3. `security-electron-ipc-core.md` の関連セクション（contextBridge 監査、preload 公開方式）に追記する

#### Step 5: 変更履歴と台帳更新

1. `aiworkflow-requirements/LOGS.md` に本タスクの完了記録を追加する
2. `task-specification-creator/LOGS.md` に本タスクの完了記録を追加する
3. `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
4. `task-specification-creator/SKILL.md` の変更履歴を更新する

### 3.4 苦戦箇所と対策

#### P57: AuthMode 値の設計-実装乖離パターンへの対処

- **問題**: 設計書では "integrated"/"terminal"/"hybrid" と記載されていても、実コードは "subscription" | "api-key" であるように、IPC 仕様書に記録された型値と実装値が乖離していることがある
- **対策**: Step 1 で必ず実装ファイルを正本として読み取り、仕様書の記述を実装に合わせて更新する。設計値を仕様書に残す場合は「設計値（参考）」と明示する

#### P58: 同名ファイルの二重存在による参照曖昧性

- **問題**: `handlers/chatEditHandlers.ts` と `ipc/chatEditHandlers.ts` の両方が存在する可能性があり、どちらが正本か不明
- **対策**: `find` コマンドで全ファイルを列挙し、`git log --follow` でどちらが本来の実装ファイルかを確定してから仕様書を更新する。両方存在する場合は用途の違いを仕様書に明記する

#### P59: Preload API 未公開チャンネルの見落とし

- **問題**: `chatEditAPI` が `preload/index.ts` の `contextBridge.exposeInMainWorld` に含まれていない可能性がある
- **対策**: `apps/desktop/src/preload/index.ts` を確認し、`chatEditAPI` 公開の有無を確認する。仕様書の「公開チャンネル一覧」に `chatEditApi.ts` の全メソッドが網羅されているか確認する

  ```bash
  grep -n "chatEdit\|chat-edit" apps/desktop/src/preload/index.ts
  ```

#### P60: createAuthModeService のスコープ制限

- **問題**: chat-edit ハンドラーから `authModeService` を利用する際のスコープ問題が発生した場合、仕様書のサービス依存図が実態を反映していない
- **対策**: `chatEditHandlers.ts` のサービス依存（`authModeService` の利用有無）を確認し、`api-ipc-agent-core.md` のサービス依存図を更新する

### 3.5 同種課題の簡潔解決手順（5ステップ）

IPC 契約と仕様書の乖離を解消する標準手順:

1. **正本確定**: 実装ファイル（Main Handler + Preload API）のシグネチャを `grep` で抽出し、一次情報として固定する
2. **仕様書突合**: 対象の仕様書（`api-ipc-agent-core.md` 等）の記述と正本を比較し、差分をリストアップする
3. **差分修正**: 仕様書を実装正本に合わせて更新する（逆（実装を仕様に合わせる）は禁止）
4. **チェックリスト実施**: `ipc-contract-checklist.md` の Phase 1-6 を実施し、結果を記録する
5. **台帳同期**: LOGS.md（2 ファイル）と SKILL.md（2 ファイル）を更新して完了とする

---

## 4. 受入基準

### 機能要件

- [ ] `api-ipc-agent-core.md` の `chat-edit:send-with-context` Request 型に `workspacePath` が含まれている
- [ ] `api-ipc-agent-core.md` の `chat-edit:send-with-context` Request 型で `message` が optional として定義されている
- [ ] `api-ipc-agent-core.md` の `chat-edit:send-with-context` Response 型に `handoff` / `guidance` フィールドが含まれている
- [ ] `chatEditApi.ts` が `contextBridge.exposeInMainWorld` 経由で公開されている旨が `api-ipc-agent-core.md` または `security-electron-ipc-core.md` に記録されている
- [ ] `ipc-contract-checklist.md` に chat-edit チャンネルの Phase 1-6 検証結果が記録されている
- [ ] `security-electron-ipc-core.md` に M-01 修正（window 直接代入廃止）のリグレッション検出コマンドが追加されている
- [ ] `handlers/chatEditHandlers.ts` と `ipc/chatEditHandlers.ts` のどちらが正本かが仕様書に明記されている（P58 対応）

### 品質要件

- [ ] 仕様書の更新内容に曖昧語（「適切に」「必要に応じて」）が含まれていない
- [ ] 型定義の記述が実装ファイルの TypeScript 型と一字一句一致している
- [ ] 監査コマンドが実際に実行可能な bash コマンドとして記載されている

### ドキュメント要件

- [ ] `aiworkflow-requirements/LOGS.md` に本タスクの完了記録が追加されている
- [ ] `task-specification-creator/LOGS.md` に本タスクの完了記録が追加されている
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴が更新されている
- [ ] `task-specification-creator/SKILL.md` の変更履歴が更新されている

---

## 5. 参照資料

### 仕様書

| ドキュメント                 | パス                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------- |
| Workspace Chat Edit 機能仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    |
| IPC エージェントコア仕様     | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         |
| IPC セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` |
| IPC 契約チェックリスト       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     |
| 教訓（最新）                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`    |

### ルール

| ルール               | パス                                    | 関連箇所                       |
| -------------------- | --------------------------------------- | ------------------------------ |
| IPC 契約ドリフト防止 | `.claude/rules/04-electron-security.md` | IPC 契約ドリフト防止セクション |

### 実装ファイル

| ファイル                 | パス                                                                    |
| ------------------------ | ----------------------------------------------------------------------- |
| chat-edit IPC ハンドラー | `apps/desktop/src/main/ipc/chatEditHandlers.ts`                         |
| chat-edit Preload API    | `apps/desktop/src/preload/chatEditApi.ts`                               |
| chat-edit 型定義         | `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts` |

### 関連 Pitfall

| Pitfall ID | 内容                                           | 対応箇所       |
| ---------- | ---------------------------------------------- | -------------- |
| P57        | AuthMode 値の設計-実装乖離                     | 3.4 節         |
| P58        | 同名ファイルの二重存在                         | 3.4 節         |
| P59        | Preload API 未公開                             | 3.4 節         |
| P60        | createAuthModeService のスコープ制限           | 3.4 節         |
| P44        | skill:import/remove IPC インターフェース不整合 | Step 3 Phase 5 |
| P45        | IPC 引数命名の契約ドリフト                     | Step 3 Phase 5 |

---

## 備考

### 発見コンテキスト

本タスクは `TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001` の Phase 12（ドキュメント整備フェーズ）において、IPC 契約変更が仕様書へ完全同期されていないことを確認したため、未タスクとして切り出した（Phase 12 MINOR 判定への対応、P4 準拠）。

### 優先度の根拠

- IPC 契約仕様書の乖離は、新規開発者が誤った前提で実装するリスクを生む
- ただし、既存の実装は正しく動作しており、即座の機能ブロッカーではない
- 優先度「中」として次の開発サイクル内での対応を推奨する
