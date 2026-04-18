# TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001

## メタ情報

```yaml
issue_number: 1937
```

## メタ情報

| 項目       | 値                                                                                    |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001                                     |
| 機能名     | execute-async-snapshot-error-propagation-001                                          |
| ステータス | completed（2026-04-18 close-out 完了）                                                |
| 作成日     | 2026-04-06                                                                            |
| 親タスク   | TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001（Phase 12 MINOR 指摘） |
| 優先度     | Low                                                                                   |
| タスク種別 | verification / docs close-out                                                         |

## 完了メモ

- 2026-04-18 時点で `docs/30-workflows/task-execute-async-snapshot-error-propagation-001/` に Phase 1-12 成果物を出力済み
- current facts の確認により `errorCode` / `errorMessage` の snapshot 本体拡張は不要と確定
- コード変更は不要（Phase 5 no-op）、Phase 13 は blocked 維持

## 概要

`executeAsync()` が adapter エラー（`llm_adapter_unavailable` 等）を返した際、`onWorkflowStateSnapshot` コールバックへのエラーメッセージ伝搬の通知文言が未定義のまま残っている。

現状では `execute()` / `improve()` 単体ガードおよび `verifyAndImproveLoop()` 内の adapter エラー時通知（`notify("スキル作成失敗", ...)` パターン）が整備されているが、`executeAsync()` 経由のフロー（ワークフロー状態スナップショット更新）では同等の通知文言統一が formalize されていない。

本タスクでは `executeAsync()` における adapter エラー発生時の `onWorkflowStateSnapshot` コールバック呼び出しパターンを設計・実装し、同期実行 (`execute()`) と非同期実行 (`executeAsync()`) の通知体験を統一する。

## スコープ

### 含む

- `executeAsync()` における adapter エラー時の `onWorkflowStateSnapshot` コールバック呼び出し設計
- `WorkflowStateSnapshot` 型に `errorCode` / `errorMessage` フィールドが含まれるかの確認・追加判断
- 通知文言が `execute()` 単体ガードと同等水準になっているかの検証と統一
- `executeAsync()` テスト: adapter エラー時の `onWorkflowStateSnapshot` 呼び出しシナリオの追加
- 既存の `executeAsync()` テストのリグレッションなし確認

### 含まない

- `WorkflowStateSnapshot` の大規模型変更（最小限の追加のみ）
- `executeAsync()` のリファクタリング（スコープ外）
- Renderer 側での `onWorkflowStateSnapshot` 受信後の UI 表示変更
- 他メソッド（`plan()` / `verifyAndImproveLoop()` 等）への適用

## 受入基準

| ID   | 基準                                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `executeAsync()` で adapter エラーが発生した場合、`onWorkflowStateSnapshot` が `errorCode` を含むスナップショットで呼び出される |
| AC-2 | スナップショット内の `errorMessage` 文言が `execute()` 単体ガードの通知文言と同水準である                                       |
| AC-3 | `executeAsync()` の通常フロー（成功ケース）に影響がない                                                                         |
| AC-4 | 既存の `executeAsync()` テストがリグレッションなし                                                                              |
| AC-5 | TypeScript 型チェックがエラーなしで通過する                                                                                     |

## Phase 構成

| Phase | 名称             | ステータス |
| ----- | ---------------- | ---------- |
| 1     | 要件定義         | open       |
| 2     | 設計             | open       |
| 3     | 設計レビュー     | open       |
| 4     | テスト作成       | open       |
| 5     | 実装             | open       |
| 6     | テスト拡充       | open       |
| 7     | カバレッジ確認   | open       |
| 8     | リファクタリング | open       |
| 9     | 品質検証         | open       |
| 10    | 最終レビュー     | open       |
| 11    | 手動テスト       | open       |
| 12    | ドキュメント     | open       |
| 13    | PR作成           | open       |

---

## Phase 1: 要件定義

### 目的

`executeAsync()` の現状実装を調査し、adapter エラー時のスナップショット伝搬フローと不足箇所を特定する。

### Task 1-1: 現行コード調査

**調査対象**:

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `executeAsync()` の実装全体
  - `onWorkflowStateSnapshot` コールバックの呼び出しタイミング・引数
  - adapter エラー時の分岐処理の有無
- `WorkflowStateSnapshot` 型定義（`packages/shared/` または `apps/desktop/src/main/services/runtime/`）
  - `errorCode` / `errorMessage` フィールドの有無

**現状確認ポイント**:

| 確認項目                                                 | 期待値                                            |
| -------------------------------------------------------- | ------------------------------------------------- |
| `executeAsync()` の adapter エラー時の分岐有無           | 現状では通知なしの可能性あり                      |
| `onWorkflowStateSnapshot` の呼び出しパターン             | 成功時のみ or エラー時も呼ばれるかを確認          |
| `WorkflowStateSnapshot` の `errorCode` フィールド有無    | 型定義を確認                                      |
| `execute()` 単体ガードのエラー通知パターン（参照比較用） | `notify("スキル作成失敗", errorMessage)` 実装済み |

### Task 1-2: 機能要件定義

| ID   | 要件                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------- |
| FR-1 | `executeAsync()` が adapter エラーを検出した場合、`onWorkflowStateSnapshot` を `errorCode` 付きで呼ぶ          |
| FR-2 | `WorkflowStateSnapshot` に `errorCode?: string` / `errorMessage?: string` フィールドを追加する（未存在の場合） |
| FR-3 | エラー通知文言を `execute()` 単体ガードと同水準に揃える                                                        |
| FR-4 | 既存の成功ケーススナップショットへの影響がないこと（optional フィールド）                                      |

### Task 1-3: エッジケース洗い出し

| ケース | 説明                                             | 対応                                          |
| ------ | ------------------------------------------------ | --------------------------------------------- |
| E-1    | `onWorkflowStateSnapshot` が未設定の場合         | optional チェックで安全にスキップ             |
| E-2    | `executeAsync()` 内で複数のエラーが発生する場合  | 最初のエラーのみをスナップショットに反映      |
| E-3    | `WorkflowStateSnapshot` の既存フィールドとの衝突 | optional フィールドとして追加し後方互換を維持 |
| E-4    | Renderer 側が `errorCode` を無視した場合         | スコープ外（Renderer の対応は別タスク）       |

---

## Phase 2: 設計

### 目的

`executeAsync()` の adapter エラー時スナップショット伝搬の最小変更設計を確定する。

### Task 2-1: `WorkflowStateSnapshot` 型拡張設計

```typescript
// 既存型への追加（条件付き）
type WorkflowStateSnapshot = {
  // ... 既存フィールド ...
  errorCode?: string; // adapter エラー時の error.code
  errorMessage?: string; // adapter エラー時の error.message（通知文言と同等）
};
```

### Task 2-2: `executeAsync()` エラー処理設計

```typescript
// executeAsync() 内の adapter エラー検出箇所
if ("success" in executeResult && !executeResult.success) {
  const errorCode = executeResult.error?.code;
  const errorMessage = executeResult.error?.message;

  // 追加: onWorkflowStateSnapshot にエラー情報を伝播
  this.onWorkflowStateSnapshot?.({
    ...currentSnapshot,
    status: "error",
    errorCode,
    errorMessage,
  });

  // 既存の return 処理を維持
  return { ... };
}
```

### Task 2-3: 変更ファイル一覧

| 種別       | ファイルパス                                                                                             | 変更内容                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 型拡張     | `WorkflowStateSnapshot` 型定義ファイル（調査で特定）                                                     | `errorCode?` / `errorMessage?` フィールド追加（条件付き） |
| 実装変更   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                    | `executeAsync()` 内のエラー時スナップショット伝搬追加     |
| テスト追加 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.async.test.ts`（または新規） | `executeAsync()` adapter エラーシナリオ追加               |

---

## Phase 3: 設計レビュー

### 設計の評価

| 観点         | 評価                                                                         | 判定    |
| ------------ | ---------------------------------------------------------------------------- | ------- |
| 後方互換性   | optional フィールドのため、既存コードへの影響なし                            | PASS    |
| 最小変更     | 型追加（条件付き）+ スナップショット呼び出し追加のみ                         | PASS    |
| 通知統一     | `execute()` と同等のエラー情報が伝搬される                                   | PASS    |
| Renderer分離 | Renderer 側の処理は今回のスコープ外。optional フィールドを無視しても動作継続 | PASS    |
| 調査待ち     | `WorkflowStateSnapshot` の型定義ファイルの特定が Phase 1 調査の前提          | PENDING |

**Phase 4 へ進む: Phase 1 調査完了後に再確認**

---

## Phase 4: テスト作成

### テストマトリクス

| テストID | シナリオ                                 | 検証項目                                                    | 優先度 |
| -------- | ---------------------------------------- | ----------------------------------------------------------- | ------ |
| T-EA-01  | `executeAsync()` で adapter エラー発生   | `onWorkflowStateSnapshot` が `errorCode` 付きで呼ばれること | HIGH   |
| T-EA-02  | `executeAsync()` で adapter エラー発生   | スナップショットの `errorMessage` が正しい文言であること    | HIGH   |
| T-EA-03  | `onWorkflowStateSnapshot` が未設定の場合 | エラーなく終了すること                                      | MEDIUM |
| T-EA-04  | `executeAsync()` が成功した場合          | `errorCode` が含まれないこと（リグレッション確認）          | HIGH   |
| T-EA-05  | 既存の `executeAsync()` テスト全体       | リグレッションなし                                          | HIGH   |

### 実行コマンド

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="async"
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

---

## Phase 5: 実装

### 実装手順

**Step 1**: Phase 1 調査で特定した `WorkflowStateSnapshot` 型に `errorCode?` / `errorMessage?` を追加する（未存在の場合のみ）

**Step 2**: `executeAsync()` の adapter エラー分岐に `onWorkflowStateSnapshot` 呼び出しを追加する

**Step 3**: テスト T-EA-01〜05 を追加する

### 品質チェック

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --testPathPattern="async"
pnpm --filter @repo/desktop test
```

---

## Phase 6: テスト拡充

### 追加テスト

| テストID | シナリオ                                              | 優先度 |
| -------- | ----------------------------------------------------- | ------ |
| T-EA-06  | `onWorkflowStateSnapshot` が例外を投げた場合          | LOW    |
| T-EA-07  | 複数の adapter エラーが連続した場合（エラー重複防止） | LOW    |

---

## Phase 7: カバレッジ確認

### カバレッジ目標

| 項目                                            | 目標 |
| ----------------------------------------------- | ---- |
| `executeAsync()` のエラー分岐                   | 100% |
| `onWorkflowStateSnapshot` 呼び出し分岐          | 100% |
| `WorkflowStateSnapshot` の `errorCode` 設定パス | 100% |

```bash
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="async"
```

---

## Phase 8: リファクタリング

### 変更内容

| 対象                                        | Before                        | After                                                 | 理由                            |
| ------------------------------------------- | ----------------------------- | ----------------------------------------------------- | ------------------------------- |
| `executeAsync()` のエラー時スナップショット | エラーコード未伝搬            | `errorCode` / `errorMessage` 付きスナップショット伝搬 | 同期/非同期フローの通知体験統一 |
| `WorkflowStateSnapshot` 型                  | `errorCode?` なし（条件付き） | `errorCode?: string; errorMessage?: string;` 追加     | 型安全なエラー情報伝搬          |

---

## Phase 9: 品質検証

### 検証チェックリスト

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] T-EA-01〜07 が全て PASS する
- [ ] 既存テストがリグレッションなし
- [ ] `pnpm lint` がエラーなしで通過する

---

## Phase 10: 最終レビュー

### 受入基準チェック

| ID   | 受入基準                                                           | 判定 | 証跡           |
| ---- | ------------------------------------------------------------------ | ---- | -------------- |
| AC-1 | `executeAsync()` adapter エラー時の `onWorkflowStateSnapshot` 伝搬 | [ ]  | T-EA-01 PASS   |
| AC-2 | エラー文言の統一                                                   | [ ]  | T-EA-02 PASS   |
| AC-3 | 成功ケースへの影響なし                                             | [ ]  | T-EA-04 PASS   |
| AC-4 | 既存テストのリグレッションなし                                     | [ ]  | T-EA-05 PASS   |
| AC-5 | TypeScript 型チェック通過                                          | [ ]  | typecheck PASS |

---

## Phase 11: 手動テスト

### テスト分類

`NON_VISUAL` — Main プロセスのみの変更。UI 変更なし（Renderer の表示変更は本タスクのスコープ外）。

### 自動テスト代替記録

| 証跡         | 内容                                             |
| ------------ | ------------------------------------------------ |
| 自動テスト名 | T-EA-01〜07                                      |
| 理由         | Main プロセスの非同期フロー変更のみ。UI 変更なし |

---

## Phase 12: ドキュメント更新

### Task 12-1: 実装ガイド（2パート）

#### Part 1（中学生レベル）

**なぜこれが必要か？**

AIスキルを作るアプリでは、「今すぐ実行する方法」（同期）と「バックグラウンドで実行する方法」（非同期 = `executeAsync`）の2つの実行方法があります。たとえば、レストランの注文で「カウンターで受け取る注文」と「席で待つデリバリー注文」のようなものです。

問題は、同期の場合は「注文に失敗しました」という通知が届くのに、非同期の場合は「何が起きたかわからないまま終わる」ことがあるという状態です。今回の変更で、どちらの方法で実行しても、AI接続エラーが起きた場合に同じ形式でエラー情報が伝達されるようになります。

- 変更前: 非同期実行でエラーが起きても、エラーの原因が呼び出し元に届かない場合がある
- 変更後: 同期・非同期どちらでも、エラーコードとメッセージが統一されて伝わる

#### Part 2（技術者レベル）

**変更ファイル**:

| ファイル                                                              | 変更内容                                                             |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `WorkflowStateSnapshot` 型定義ファイル                                | `errorCode?` / `errorMessage?` フィールド追加（条件付き）            |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `executeAsync()` 内のエラー時 `onWorkflowStateSnapshot` 呼び出し追加 |

**追加パターン**:

```typescript
// executeAsync() 内 — adapter エラー検出後
this.onWorkflowStateSnapshot?.({
  ...currentSnapshot,
  status: "error",
  errorCode: executeResult.error?.code,
  errorMessage: executeResult.error?.message,
});
```

**`execute()` 単体ガードとの対応関係**:

| フロー           | 通知方式                       | エラー情報の伝達先           |
| ---------------- | ------------------------------ | ---------------------------- |
| `execute()` 同期 | `notificationService.notify()` | システム通知（トースト等）   |
| `executeAsync()` | `onWorkflowStateSnapshot`      | ワークフロー状態コールバック |

### Task 12-2: システム仕様書更新

- `task-workflow-completed.md` に本タスクの完了記録を追加
- `task-workflow-backlog.md` の本タスクのステータスを `open` → `completed` に更新
- `aiworkflow-requirements/LOGS.md` を更新

### Task 12-3: 未タスク検出

| 候補                                         | 判定  | 対応               |
| -------------------------------------------- | ----- | ------------------ |
| Renderer 側での `errorCode` を使った UI 表示 | MINOR | 別タスクとして検討 |
| `plan()` 非同期フローの同等対応              | MINOR | 別タスクとして評価 |

---

## Phase 13: PR作成

PR作成はユーザーの明示承認後のみ実施する。

---

## 苦戦箇所（事前予測）

### 予測される苦戦箇所 1: `WorkflowStateSnapshot` 型の定義場所の特定

**問題**: `WorkflowStateSnapshot` が `packages/shared/` と `apps/desktop/` のどちらで定義されているかが不明。

**対策**: Phase 1 調査で Grep を使って型定義ファイルを特定してから実装に入る。

### 予測される苦戦箇所 2: `executeAsync()` の現在のスナップショット呼び出しタイミング

**問題**: `executeAsync()` が `onWorkflowStateSnapshot` を呼ぶタイミング（どの状態遷移で呼ぶか）が設計によって異なる。

**対策**: 既存の呼び出しパターンを Phase 1 で調査し、エラー時の挿入位置を設計で確定する。

---

## 参照資料

| 資料名                      | パス                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| RuntimeSkillCreatorFacade   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                 |
| 親タスク（loop 通知統一）   | `docs/30-workflows/unassigned-task/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001.md` |
| notify ヘルパー統合タスク   | `docs/30-workflows/unassigned-task/TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001.md`                  |
| execute()単体ガード実装参照 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts`   |
