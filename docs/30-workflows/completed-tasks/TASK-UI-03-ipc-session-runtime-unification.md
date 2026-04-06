# IPC 二重経路統合（Session IPC vs Runtime IPC）- タスク指示書

## メタ情報（依存: TASK-UI-01完了後に着手）

```yaml
task_id: TASK-UI-03
task_name: ipc-session-runtime-unification
category: IPC アーキテクチャ統合
target_feature: Skill Creator IPC 通信層
priority: high（P0）
scale: 中規模
status: phase12_completed
source: skill-creator-agent-sdk-lane UI 統合監査
created_date: 2026-04-06
step: 12-par（TASK-UI-01完了後、TASK-UI-02と並行実施可能）
dependencies:
  - TASK-UI-01（ライフサイクルパネル主系ルート昇格）
parallel_tasks:
  - TASK-UI-02（会話パネル孤立解消）
```

| 項目           | 値                                                   |
| -------------- | ---------------------------------------------------- |
| タスクID       | TASK-UI-03                                           |
| タスク名       | IPC 二重経路統合（Session IPC vs Runtime IPC）       |
| 分類           | IPC アーキテクチャ統合                               |
| 対象機能       | Skill Creator IPC 通信層                             |
| 優先度         | high（P0）                                           |
| 見積もり規模   | 中規模                                               |
| ステータス     | phase12_completed（Phase 1-12 完了 / 2026-04-06）    |
| 発見元         | skill-creator-agent-sdk-lane UI 統合監査             |
| 発見日         | 2026-04-06                                           |
| Step           | 12-par（TASK-UI-01完了後、TASK-UI-02と並行実施可能） |
| 依存タスク     | TASK-UI-01（ライフサイクルパネル主系ルート昇格）     |
| 並行可能タスク | TASK-UI-02（会話パネル孤立解消）                     |
| 後続タスク     | なし（IPC アーキテクチャ統合の最終ピース）           |

---

## 1. Why

### 1.1 背景

現在の Skill Creator には 2 つの独立した IPC 通信パスが並立している。

**Session IPC**（`window.skillCreatorAPI`、旧称 `window.skillCreatorSessionAPI`）:

- 使用元: `SkillCreatorConversationPanel.tsx`
- 提供元: `apps/desktop/src/preload/skill-creator-api.ts` の `skillCreatorAPI`
- チャネル群: `startSession`、`sendAnswer`、`onQuestion`、`listSessions`、`getSessionDetail`、`resumeSession`、`deleteSession` などの会話型フロー
- パターン: 質問/回答型のインタラクション

**Runtime IPC**（`window.electronAPI.skillCreator`）:

- 使用元: `SkillLifecyclePanel`、`ConversationalInterview.tsx`
- 提供元: 同じく `apps/desktop/src/preload/skill-creator-api.ts` の `skillCreatorAPI`（が `window.electronAPI.skillCreator` としてマウントされる経路）
- チャネル群: `planSkill`、`executePlan`、`submitUserInput`、`getWorkflowState`、`onWorkflowStateChanged` などのワークフロー状態スナップショット型
- パターン: ワークフロー状態管理

さらに `apps/desktop/src/main/ipc/` には `creatorHandlers.ts`（Runtime 向け: `RuntimeSkillCreatorFacade` に接続）と `skillCreatorHandlers.ts`（Service 向け: `SkillCreatorService` に接続）の 2 ファイルが並立しており、どちらがどの IPC チャネルを担当するかの全体像が不明瞭になっている。

### 1.2 問題点・課題

- **二重 API surface**: `window.skillCreatorAPI` と `window.electronAPI.skillCreator` が事実上同一の preload ファイルから公開されているにも関わらず、呼び出し元コンポーネントがそれぞれ異なるオブジェクト経路を参照しているため、どちらを正として扱うべきか不明確
- **エラーハンドリングの分断**: session 系チャネルと runtime 系チャネルでエラーラップの粒度・形式が異なり、レンダラー側での統一的なエラー処理が困難
- **状態モデルの不整合**: session 系は「質問/回答の会話フロー」、runtime 系は「ワークフロー状態スナップショット」という異なるモデルを使用しており、同一の Skill Creator 機能に 2 つの状態管理パスが存在する
- **セキュリティ要件の不均一**: `validateIpcSender` によるセキュリティ検証が runtime 系（`creatorHandlers.ts`）には実装されているが、session 系（`skillCreatorHandlers.ts`）側の適用範囲の整合性が確認されていない
- **新機能開発コストの増大**: 新規 Skill Creator 機能を追加する際、どちらの IPC 経路に実装すべきかの判断基準が存在しないため、開発者の意思決定コストが高い
- **ハンドラー重複の懸念**: `creatorHandlers.ts` では `SKILL_CREATOR_GET_ADAPTER_STATUS` が 2 回 `ipcMain.handle()` 登録されており（241行目と242行目）、Electron の二重登録警告が発生しうる不具合が混入している

### 1.3 放置した場合の影響

- 新機能（session resume、governance 等）が TASK-P0-08、TASK-P0-09 で追加されるたびに、どちらの経路に実装すべきか迷い、担当者ごとに方針がばらつく
- `ConversationalInterview.tsx` が runtime IPC を使用し、`SkillCreatorConversationPanel.tsx` が session IPC を使用するという分断が固定化し、将来的な統合コストが増大する
- `creatorHandlers.ts` の `SKILL_CREATOR_GET_ADAPTER_STATUS` 二重登録問題が本番環境で Electron 警告またはハンドラー競合を引き起こすリスクが温存される
- IPC 契約チェックリスト（Main/Preload/型定義の同時更新）に準拠した変更管理が困難になる

---

## 2. What

### 2.1 達成目標

- IPC 経路に統一された設計方針を持つ（段階的な「明確な分離契約」アプローチを採用）
- 新機能開発者が適切な IPC 経路を迷わず選択できる判断ガイドラインを整備する
- `creatorHandlers.ts` の `SKILL_CREATOR_GET_ADAPTER_STATUS` 二重登録バグを修正する
- `skillCreatorHandlers.ts` と `creatorHandlers.ts` のハンドラー責務境界を明文化する
- セキュリティ要件（`validateIpcSender` によるパストラバーサル防止等）が両経路で均一に適用されることを確認する

### 2.2 最終ゴール

1. **分離契約の明文化**: session 系チャネル（会話フロー）と runtime 系チャネル（ワークフロー状態管理）の責務境界を設計ドキュメントとして文書化する
2. **二重登録バグ修正**: `creatorHandlers.ts` の `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラーの重複を除去する
3. **セキュリティ均一化**: 両ハンドラーファイルで `validateIpcSender` の適用が漏れていないことを確認し、未適用箇所があれば追加する
4. **チャネル命名規則の統一**: `IPC_CHANNELS` 定数の session 系と runtime 系の命名プレフィックスを整理し、新規追加時のガイドを整備する
5. **既存テスト全 PASS の維持**: リファクタリング後も既存のすべてのテストが PASS する

### 2.3 スコープ

#### 含むもの

- `creatorHandlers.ts` の `SKILL_CREATOR_GET_ADAPTER_STATUS` 二重登録バグの修正
- `skillCreatorHandlers.ts` と `creatorHandlers.ts` の責務境界設計ドキュメント作成
- `validateIpcSender` の適用漏れ調査と補完
- channel 命名規則の統一・整理（命名変更は既存動作に影響するため慎重に判断）
- IPC 契約チェックリスト（Main/Preload/型定義同時更新）への準拠確認

#### 含まないもの

- `window.skillCreatorAPI` と `window.electronAPI.skillCreator` の完全統合（レンダラー側への影響が大きく、スコープ外）
- UI コンポーネント（`ConversationalInterview.tsx`、`SkillCreatorConversationPanel.tsx`）のリライト
- `WorkflowEngine` の状態遷移変更（TASK-P0-02 の責務）
- 新規 IPC チャネルの追加（統合/整理のみ）
- Electron バージョンアップ

---

## 3. How

### 3.1 前提条件

- **TASK-UI-01 完了**: ライフサイクルパネルが主系ルートとして昇格済みであること（ルーティング構造が確定してから IPC 整理を行う）
- `apps/desktop/src/preload/skill-creator-api.ts` の全 API surface が把握されていること
- `apps/desktop/src/main/ipc/creatorHandlers.ts` と `skillCreatorHandlers.ts` の全ハンドラーが把握されていること

### 3.2 現状アーキテクチャの理解

#### preload 側の状況

`apps/desktop/src/preload/skill-creator-api.ts` は単一の `skillCreatorAPI` オブジェクトを export しており、session 系・runtime 系の両チャネルを網羅している。このオブジェクトが `contextBridge.exposeInMainWorld` で `window.skillCreatorAPI` または `window.electronAPI.skillCreator` としてマウントされるかは preload エントリポイント側の実装による。

#### main プロセス側の状況

- `skillCreatorHandlers.ts`: `SkillCreatorService`（`createSkill`、`executeTasks`、`validateSkill` 等の基礎操作）を担当。内部で `registerRuntimeSkillCreatorHandlers` / `unregisterRuntimeSkillCreatorHandlers` を呼び出し、`creatorHandlers.ts` への委譲も行う
- `creatorHandlers.ts`: `RuntimeSkillCreatorFacade`（`plan`、`execute`、`submitUserInput`、`getWorkflowState`、session resume 系等のランタイム操作）を担当

#### 既知のバグ

`creatorHandlers.ts` の 241-274 行目に `SKILL_CREATOR_GET_ADAPTER_STATUS` の `ipcMain.handle()` が 2 回呼ばれている。Electron では同一チャネルへの二重 `handle` 登録時に警告が発生し、後から登録されたハンドラーが優先されるが、テスト環境では問題が表面化しにくい。

### 3.3 推奨アプローチ

完全統合（1 つの API object に全チャネルを統合）は後方互換性の担保コストが高い。代わりに「明確な分離契約」アプローチを採用する:

1. **Phase 1**: 全 IPC チャネルの棚卸し（session 系 vs runtime 系の分類）
2. **Phase 2**: 分離契約の設計文書化（どのコンポーネントがどの経路を使うかの方針決定）
3. **Phase 3**: 設計レビュー（GATE）
4. **Phase 4**: `creatorHandlers.ts` の二重登録バグ修正とテスト追加
5. **Phase 5**: `validateIpcSender` 適用漏れの補完と均一化
6. **Phase 6**: チャネル命名規則の整理・ドキュメント化
7. **Phase 7**: 品質保証（typecheck / lint / test）
8. **Phase 8**: リファクタリング（Phase 4-6 の結果を踏まえた追加整理）
9. **Phase 9**: 品質保証（最終）
10. **Phase 10**: 最終レビュー（GATE）
11. **Phase 11**: 手動テスト
12. **Phase 12**: ドキュメント更新
13. **Phase 13**: PR 作成

---

## 4. 実行手順

### Phase 1: 全 IPC チャネル棚卸し

#### 目的

session 系と runtime 系の全チャネルを一覧化し、担当ハンドラー・利用コンポーネント・セキュリティ適用状況を把握する。

#### 手順

1. `apps/desktop/src/preload/channels.ts` から `IPC_CHANNELS` の全定数を一覧化する
2. 各チャネルを以下の観点で分類する:
   - 担当ハンドラー（`skillCreatorHandlers.ts` / `creatorHandlers.ts` / その他）
   - 利用レンダラーコンポーネント
   - セキュリティ検証（`validateIpcSender`）の有無
   - 通信パターン（invoke / on イベント）
3. `creatorHandlers.ts` の二重登録箇所（`SKILL_CREATOR_GET_ADAPTER_STATUS`）を特定し記録する
4. `window.skillCreatorAPI` と `window.electronAPI.skillCreator` がどのように preload エントリポイントでマウントされているかを確認する

#### 成果物

- `outputs/phase-1/ipc-channel-inventory.md`（全チャネル一覧・分類表）

#### 完了条件

- [ ] 全 IPC チャネルが session 系 / runtime 系 / その他に分類されている
- [ ] 各チャネルの担当ハンドラーと利用コンポーネントが特定されている
- [ ] `validateIpcSender` の適用状況が把握されている
- [ ] 二重登録バグの場所と影響範囲が確認されている

---

### Phase 2: 分離契約設計

#### 目的

二重 IPC 経路の設計方針を「完全統合」ではなく「明確な分離契約」として策定し、今後の判断基準を文書化する。

#### 手順

1. Phase 1 の棚卸し結果を元に、以下の設計方針を決定する:
   - session 系チャネル（会話フロー: `listSessions`、`resumeSession` 等）は `RuntimeSkillCreatorFacade` の session persistence 機能として集約する
   - runtime 系チャネル（ワークフロー状態: `planSkill`、`executePlan`、`getWorkflowState` 等）は引き続き `RuntimeSkillCreatorFacade` のランタイム操作として扱う
   - 新規チャネル追加時の判断基準（「会話フロー → session 系」「ワークフロー状態管理 → runtime 系」）を明文化する
2. `window.skillCreatorAPI` を主系として `ConversationalInterview.tsx` の呼び出し元を統一する方針（または分離維持の方針）を決定する
3. セキュリティ要件（パストラバーサル防止、コマンドインジェクション防止）の均一適用方針を設計する

#### 成果物

- `outputs/phase-2/design-document.md`（分離契約設計書）
- `outputs/phase-2/ipc-unification-strategy.md`（統合戦略・判断基準）

#### 完了条件

- [ ] session 系 / runtime 系の責務境界が明文化されている
- [ ] 新規チャネル追加時の判断基準が記載されている
- [ ] `validateIpcSender` 均一化の実装方針が決定されている
- [ ] 変更対象ファイルと変更内容の概要が確定している

---

### Phase 3: 設計レビュー（GATE）

#### 目的

Phase 2 の設計を査読し、実装進行の可否を判断する。

#### 判断基準

| 判定     | 条件                                                                    |
| -------- | ----------------------------------------------------------------------- |
| PASS     | 設計方針が明確で、後方互換性への影響が最小限である                      |
| MINOR    | 軽微な設計変更が必要だが実装は進められる                                |
| MAJOR    | 設計の根本的な見直しが必要（Phase 2 に差し戻し）                        |
| CRITICAL | TASK-UI-01 未完了など前提条件が満たされておらず、着手自体が不可能な状態 |

#### 成果物

- `outputs/phase-3/design-review-gate.md`（レビュー結果）

---

### Phase 4: 二重登録バグ修正・テスト追加

#### 目的

`creatorHandlers.ts` の `SKILL_CREATOR_GET_ADAPTER_STATUS` 二重登録バグを修正し、テストで検証する。

#### 手順

1. `apps/desktop/src/main/ipc/creatorHandlers.ts` の 241-274 行目にある重複した `ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS, ...)` の一方を削除する
2. 同時に `unregisterRuntimeSkillCreatorHandlers()` 内の `ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS)` が 1 回のみ呼ばれることを確認する（重複削除の必要があれば修正する）
3. 修正後、以下のテストを追加または確認する:
   - `T-UI03-01`: `registerRuntimeSkillCreatorHandlers` 実行後に `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラーが 1 つのみ存在すること
   - `T-UI03-02`: `unregisterRuntimeSkillCreatorHandlers` 実行後にハンドラーが削除されていること
4. テストを実行する:
   ```bash
   pnpm --filter @repo/desktop test creatorHandlers
   ```

#### 成果物

- 修正済み `creatorHandlers.ts`
- テストケース `T-UI03-01` / `T-UI03-02`

#### 完了条件

- [ ] `SKILL_CREATOR_GET_ADAPTER_STATUS` の二重登録が解消されている
- [ ] `T-UI03-01` / `T-UI03-02` が PASS する
- [ ] 既存テストのリグレッションがない

---

### Phase 5: validateIpcSender 均一化

#### 目的

`validateIpcSender` によるセキュリティ検証が両ハンドラーファイルの全チャネルに適用されていることを確認し、未適用箇所を補完する。

#### 手順

1. `skillCreatorHandlers.ts` の全 `ipcMain.handle()` コールバックに `validateIpcSender` が適用されているかを確認する
2. `creatorHandlers.ts` の全 `ipcMain.handle()` コールバックに `validateIpcSender` が適用されているかを確認する（Phase 1 の棚卸し結果を参照）
3. 未適用のハンドラーが存在する場合は、既存の `validateSender()` ヘルパー関数パターンを使用して追加する:
   ```typescript
   validateSender(event, IPC_CHANNELS.<CHANNEL_NAME>, mainWindow);
   ```
4. セキュリティ仕様の参照先を確認する:
   - `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`
   - `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`

#### 成果物

- 修正済みハンドラーファイル（未適用箇所があれば）
- `outputs/phase-5/security-audit-result.md`（適用状況一覧）

#### 完了条件

- [ ] 全 IPC ハンドラーに `validateIpcSender` が適用されていることが確認または実装済み
- [ ] セキュリティ監査結果が文書化されている
- [ ] typecheck / lint がエラーなし

---

### Phase 6: チャネル命名規則整理

#### 目的

`IPC_CHANNELS` の session 系と runtime 系の命名プレフィックスを整理し、新規追加時のガイドラインを整備する。

#### 手順

1. 現在の `IPC_CHANNELS` 定数の命名パターンを分析する（`skill-creator:*` プレフィックスの一貫性確認）
2. session 系チャネル（`LIST_SESSIONS`、`RESUME_SESSION` 等）と runtime 系チャネル（`PLAN`、`EXECUTE_PLAN` 等）の命名が一貫しているかを確認する
3. 命名規則ガイドライン（新規チャネル追加時の命名方針）を `outputs/phase-6/channel-naming-guide.md` に作成する
4. 命名変更が必要な場合は、影響範囲（preload / main / renderer）の全ファイルを同時更新し、IPC 契約チェックリストに準拠する

#### 成果物

- `outputs/phase-6/channel-naming-guide.md`（命名規則ガイドライン）

#### 完了条件

- [ ] 既存チャネル命名の一貫性が確認されている
- [ ] 新規追加ガイドラインが作成されている
- [ ] 命名変更を行った場合は全関連ファイルが同時更新されている

---

### Phase 7: カバレッジ確認

#### 目的

Phase 4-6 の変更後、テストカバレッジが基準を満たしていることを確認する。

#### 手順

1. `creatorHandlers.ts` のテストカバレッジを確認する:
   ```bash
   pnpm --filter @repo/desktop test --coverage creatorHandlers
   ```
2. `skillCreatorHandlers.ts` のテストカバレッジを確認する:
   ```bash
   pnpm --filter @repo/desktop test --coverage skillCreatorHandlers
   ```
3. カバレッジが基準（Line 80%、Branch 60%、Function 80%）を下回る場合はテストを追加する

#### 成果物

- `outputs/phase-7/coverage-report.md`（カバレッジ計測結果）

#### 完了条件

- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] Function Coverage 80% 以上

---

### Phase 8: リファクタリング

#### 目的

Phase 4-6 の変更を踏まえ、コードの品質改善（不要な重複の除去、型定義の整理等）を行う。

#### 手順

1. `creatorHandlers.ts` と `skillCreatorHandlers.ts` で共通化できる型定義・ユーティリティがあれば抽出する（例: `IpcResult<T>` が両ファイルに定義されている場合は共通化）
2. `isBlank()` 等のバリデーション関数が両ファイルに重複している場合は共通モジュールへ移動する
3. TypeScript の型安全性を向上させる余地があれば改善する（`any` 型の除去等）
4. 変更後にテスト全 PASS を確認する

#### 成果物

- `outputs/phase-8/refactoring-log.md`（リファクタリング内容の記録）

#### 完了条件

- [ ] 重複コードが除去されている
- [ ] 全テストが PASS している

---

### Phase 9: 品質保証

#### 目的

型チェック / lint / 全テスト通過を確認し、PR 作成の準備を整える。

#### 手順

1. TypeScript 型チェックを実行する:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
2. ESLint を実行する:
   ```bash
   pnpm --filter @repo/desktop lint
   ```
3. 全テストを実行する:
   ```bash
   pnpm --filter @repo/desktop test
   ```

#### 成果物

- `outputs/phase-9/qa-report.md`（品質確認結果）

#### 完了条件

- [ ] typecheck エラーなし
- [ ] lint エラーなし
- [ ] 全テスト PASS

---

### Phase 10: 最終レビュー（GATE）

#### 目的

実装全体を査読し、PR 作成の可否を判断する。

#### 判断基準

| 判定  | 条件                                                             |
| ----- | ---------------------------------------------------------------- |
| PASS  | 全受入条件を満たし、品質基準（typecheck / lint / test）が全 PASS |
| MINOR | 軽微な修正があるが PR 作成は可能                                 |
| MAJOR | 重大な問題があり Phase 8 に差し戻し                              |

#### 成果物

- `outputs/phase-10/final-review-result.md`

---

### Phase 11: 手動テスト

#### 目的

実際の Electron アプリ上で IPC 通信が正常に動作することを確認する。

#### 手順

1. アプリを起動して Skill Creator の以下のフローを手動確認する:
   - スキル作成フロー（`planSkill` → `executePlan` → `getWorkflowState`）
   - ユーザー入力フロー（`submitUserInput` → `onWorkflowStateChanged`）
   - セッション一覧・再開フロー（`listSessions` → `resumeSession`）
   - アダプター状態取得（`getAdapterStatus`）
2. 二重登録バグ修正後に Electron 警告ログが消えていることを確認する
3. スクリーンショットを `outputs/phase-11/screenshots/` に保存する

#### 成果物

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/screenshots/`

#### 完了条件

- [ ] 全フローが正常に動作する
- [ ] Electron 二重登録警告が発生していない

---

### Phase 12: ドキュメント更新

#### 目的

IPC 分離契約・命名規則・新機能開発ガイドラインをドキュメントとして整備する。

#### 手順

1. `outputs/phase-12/implementation-guide.md` に以下を記載する:
   - session 系 IPC と runtime 系 IPC の責務境界と判断基準
   - 新規 IPC チャネル追加時の手順（Main / Preload / 型定義の同時更新チェックリスト）
   - `validateIpcSender` 適用パターンのサンプルコード
2. `TASK-UI-03` の完了ステータスをタスク一覧に反映する

#### 成果物

- `outputs/phase-12/implementation-guide.md`

---

### Phase 13: PR 作成

#### 目的

変更内容を PR としてまとめ、レビュー依頼を行う。

#### 手順

1. 変更ファイルを確認し、コミットを作成する:
   ```bash
   git add apps/desktop/src/main/ipc/creatorHandlers.ts
   git add apps/desktop/src/main/ipc/skillCreatorHandlers.ts
   # 追加変更ファイルを必要に応じて追加
   ```
2. PR を作成する（ユーザー承認後）。タイトル:
   `fix(ipc): TASK-UI-03 IPC 二重経路統合 — creatorHandlers 二重登録修正・分離契約文書化`

#### 成果物

- `outputs/phase-13/pr-creation-record.md`
- GitHub PR

---

## 4. 苦戦箇所と知見（重要）

### 苦戦箇所 1: 二重 IPC 経路のどちらを主系とするかの設計判断

**課題**: `window.skillCreatorAPI.sessionXxx()` 形式（session 系）と `window.electronAPI.skillCreator.planSkill()` 形式（runtime 系）が並立しているが、いずれも同じ `apps/desktop/src/preload/skill-creator-api.ts` から来ている可能性がある。preload エントリポイントでの `contextBridge.exposeInMainWorld` のマウント先の違いが混乱の根本原因。

**推奨判断**: Session API（Skill Creator 専用）を主系として `window.skillCreatorAPI` に集約し、`window.electronAPI.skillCreator` への参照は互換性エイリアスとして維持する方針が保守性が高い。ただし `ConversationalInterview.tsx` が runtime IPC を直接参照している場合の切り替えコストを Phase 2 で見積もること。

### 苦戦箇所 2: 一方を廃止した場合の後方互換性の担保

**課題**: `ConversationalInterview.tsx` が `window.electronAPI.skillCreator.submitUserInput` を使用しているとすると、この経路を廃止または変更した場合、コンポーネントの修正が必要になる。UI コンポーネントへの変更はこのタスクのスコープ外であるため、いきなりの廃止はできない。

**推奨対策**: Phase 2 の設計段階で「廃止タイムライン」と「移行ガイド」を含む分離契約を策定し、コンポーネント移行は後続タスクとして分離する。本タスクでは「どちらを使うべきかを明文化する」ことを目標とし、実際の統合（コンポーネント修正）は別タスクに委ねる。

### 苦戦箇所 3: Electron preload スクリプト変更のトリプルポイント

**課題**: Electron の IPC 変更は Main プロセス（ハンドラー）、Preload スクリプト（ブリッジ）、Renderer（呼び出し元コンポーネント・型定義）の 3 箇所を同時に変更する必要がある。片方だけ変更すると起動時エラーや型不整合が発生する。

**対策**: IPC 契約チェックリスト（`.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`）を参照し、全変更を同一 PR に含めること。変更の影響範囲を Phase 1 の棚卸しで事前に特定しておくことが重要。

### 苦戦箇所 4: creatorHandlers.ts の SKILL_CREATOR_GET_ADAPTER_STATUS 二重登録

**課題**: `creatorHandlers.ts` の 241-274 行目に同一チャネルの `ipcMain.handle()` が 2 回登録されており、Electron では後から登録されたハンドラーが警告なしに上書きされる場合と警告が出る場合がある（Electron バージョンによって挙動が異なる）。テストが通っていても本番で問題が発生するリスクがある。

**対策**: Phase 4 で確実に重複を削除し、テストで 1 回のみ登録されることを検証すること。`unregisterRuntimeSkillCreatorHandlers()` 内の `removeHandler` 呼び出しも重複がないか同時確認すること。

---

## 5. 依存関係

| 種別       | 参照先                                                                         | 役割                                                |
| ---------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| upstream   | TASK-UI-01（ライフサイクルパネル主系ルート昇格）                               | ルーティング構造が確定してから IPC 整理を行う       |
| peer       | TASK-UI-02（会話パネル孤立解消）                                               | UI 統合と IPC 統合を並行で進められる                |
| reference  | `.agents/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`      | IPC チャネル定義の正本                              |
| reference  | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC 修正時の Main/Preload/型定義 同時更新チェック   |
| reference  | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | パストラバーサル防止・コマンドインジェクション防止  |
| downstream | なし                                                                           | 本タスクは IPC アーキテクチャ統合の最終ピースとなる |

### 現行コードアンカー

| ファイル                                                                               | 現状の役割                                                 | TASK-UI-03 での扱い                      |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                                        | Session IPC + Runtime IPC 両方の API 定義（統合済み）      | 主系 API として位置づけを明確化          |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                         | Runtime IPC ハンドラー（`RuntimeSkillCreatorFacade` 接続） | 二重登録バグ修正、セキュリティ均一化     |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                    | 基礎操作ハンドラー（`SkillCreatorService` 接続）           | 責務境界の明文化、セキュリティ均一化確認 |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`               | Runtime IPC 使用コンポーネント                             | 使用経路の確認（移行は後続タスク）       |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | Session IPC 使用コンポーネント                             | 使用経路の確認（移行は後続タスク）       |
| `apps/desktop/src/preload/channels.ts`                                                 | チャネル定数定義（session + runtime 両方）                 | 命名規則の確認・整理ガイドライン作成     |
| `packages/shared/src/types/skillCreator.ts`                                            | 共有型定義                                                 | 型の一貫性確認                           |

### 受入条件（AC）

| AC   | 条件                                                                              | 検証方法                     |
| ---- | --------------------------------------------------------------------------------- | ---------------------------- |
| AC-1 | IPC 経路が統一された設計方針を持つ（明確な分離契約として文書化）                  | 設計ドキュメントレビュー     |
| AC-2 | 新機能開発者がどの IPC 経路を使うべきか明確に判断できるガイドラインが存在する     | ドキュメント確認             |
| AC-3 | `creatorHandlers.ts` の `SKILL_CREATOR_GET_ADAPTER_STATUS` 二重登録バグが修正済み | テスト PASS / コードレビュー |
| AC-4 | `validateIpcSender` が両ハンドラーの全チャネルに均一に適用されている              | セキュリティ監査             |
| AC-5 | IPC 契約チェックリスト（Main/Preload/型定義の同時更新）に準拠している             | チェックリスト確認           |
| AC-6 | 既存テストが全て PASS する（リグレッションなし）                                  | CI / ユニットテスト          |
| AC-7 | `pnpm --filter @repo/desktop typecheck` がエラーなし                              | typecheck コマンド           |
| AC-8 | `pnpm --filter @repo/desktop lint` がエラーなし                                   | lint コマンド                |

### テストコマンド

```bash
# creatorHandlers テスト
pnpm --filter @repo/desktop test creatorHandlers

# skillCreatorHandlers テスト
pnpm --filter @repo/desktop test skillCreatorHandlers

# デスクトップ全テスト（リグレッション確認）
pnpm --filter @repo/desktop test

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

### テストケース一覧

| テストID  | 内容                                                                            | 期待結果                                                      |
| --------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| T-UI03-01 | `registerRuntimeSkillCreatorHandlers` 後に `GET_ADAPTER_STATUS` が 1 回のみ登録 | 二重登録警告なし・ハンドラー 1 件のみ                         |
| T-UI03-02 | `unregisterRuntimeSkillCreatorHandlers` 後にハンドラーが削除される              | `ipcMain.removeHandler` が 1 回のみ呼ばれ、ハンドラーなし状態 |
| T-UI03-03 | `validateIpcSender` が各ハンドラーに適用されており、不正 sender は拒否される    | 不正 sender からの invoke が拒否されエラーが返る              |

### リスクと対策

| リスク                                                                        | 影響度 | 発生確率 | 対策                                                                                                           |
| ----------------------------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------- |
| `ConversationalInterview.tsx` が runtime IPC を直接参照しており切り替えが困難 | 高     | 高       | 本タスクでは分離契約の文書化のみ行い、コンポーネント移行は後続タスクへ委ねる                                   |
| preload の `contextBridge` マウント先が複数あり調査に時間がかかる             | 中     | 中       | Phase 1 で preload エントリポイントを確認し、マウント先を確定してから設計に進む                                |
| チャネル命名変更が renderer 側の型定義に波及する                              | 高     | 低       | IPC 契約チェックリストに従い Main / Preload / 型定義を同時更新する。命名変更は慎重に判断し、不要な場合は見送る |
| `validateIpcSender` の追加が既存の統合テストに影響する                        | 中     | 低       | テスト側でのモック対応が必要になる場合は、既存テストの修正を同タスク内で行う                                   |
