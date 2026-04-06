# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 6                                                      |
| Phase 名   | テスト拡充                                             |
| 前提 Phase | Phase 5（実装）完了                                    |
| 後続 Phase | Phase 7（カバレッジ確認）                              |
| ステータス | 未実施                                                 |
| 作成日     | 2026-04-06                                             |
| 機能名     | task-ut-rt-01-execute-async-snapshot-error-message-001 |

---

## 目的

Phase 5 で実装した `executeAsync()` のエラー伝搬修正に対して、Phase 4 の 4 テストを土台に残る branch coverage の穴を最小限で埋める。余計なエッジケースを増やさず、`onWorkflowStateSnapshot` の optional chain と `snapshot ?? null` / `String(error)` ルートだけを追加で固定する。

---

## 実行タスク

- タスク1: Phase 4 で定義済みの T-01〜T-04 が Green であることを確認する
- タスク2: T-05 で structured error パスの snapshot null/undefined 伝搬を確認する
- タスク3: T-06 で catch パスの `snapshot ?? null` と `String(error)` ルートを確認する
- タスク4: Phase 6 追加後の `RuntimeSkillCreatorFacade` 全体テストを再実行する

---

## 実行手順

### ステップ1: Phase 4 テストの baseline 確認

Phase 5 実装後、T-01〜T-04 が全て PASS していることを確認する。

```bash
pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade"
```

期待結果: T-01〜T-04 が全て PASS（Phase 5 実装直後の baseline）

---

### ステップ2: 追加テスト T-05 - structured error パスの snapshot null/undefined 伝搬

**テスト ID**: T-05  
**目的**: structured error パスで `getWorkflowState` が `undefined` / `null` を返した場合でも、`snapshot ?? null` で安全に伝搬されることを確認する。

**シナリオ**:

- `RuntimeSkillCreatorFacade` インスタンスを `onWorkflowStateSnapshot` を設定した状態で生成する
- `execute()` が `{ success: false, error: { code: "llm_adapter_unavailable", message: "API キーを設定してください" } }` を返すようにモックする
- `workflowEngine.getWorkflowState` を `vi.spyOn` でモック化し `undefined` を返す
- `executeAsync(planId, ...)` を呼び出す

**期待結果**:

- 例外が発生しない
- `workflowEngine.triggerPhaseTransition` が `"error"` で呼び出される
- `onWorkflowStateSnapshot` の第2引数が `null` になる
- `onWorkflowStateSnapshot` の第3引数に `error.message` が渡される

---

### ステップ3: 追加テスト T-06 - catch パスの `snapshot ?? null` と `String(error)` ルート確認

**テスト ID**: T-06  
**目的**: `execute()` が `Error` 以外の値を投げた場合でも、catch パスで `String(error)` が使われ、`snapshot ?? null` の null 分岐が通ることを確認する。

**シナリオ**:

- `executeMock.mockRejectedValue("execution failed unexpectedly")` を設定する
- `onWorkflowStateSnapshot` は設定する
- `workflowEngine.getWorkflowState` を `vi.spyOn` でモック化し `undefined` を返す
- `executeAsync(planId, ...)` を呼び出す

**期待結果**:

- `phaseSpy` が `"error"` フェーズで呼ばれる
- `onWorkflowStateSnapshot` の第2引数が `null` になる
- `onWorkflowStateSnapshot` の第3引数に `"execution failed unexpectedly"` が渡される
- `String(error)` ルートと `snapshot ?? null` の null 分岐がカバーされる

---

### ステップ4: 回帰ガード - `executeAsync` 以外のメソッドのテスト確認

Phase 5 の変更が `execute()` / `plan()` / `improve()` に影響していないことを確認する。

**確認対象テストファイル**（存在する場合）:

- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.execute.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`
- または既存の統合テストファイル

**確認コマンド**:

```bash
# 全 RuntimeSkillCreatorFacade テストを実行
pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade"
```

**期待結果**: Phase 5 実装前後でテスト結果が変わらない（全て PASS のまま）

---

### ステップ5: `onWorkflowStateSnapshot` の使用箇所確認

`onWorkflowStateSnapshot` コールバックの呼び出しが `executeAsync` の修正箇所に限定されていることを確認する。

```bash
grep -n "onWorkflowStateSnapshot" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

**期待結果**: `executeAsync` の修正箇所のみ変更されており、他のメソッドでの呼び出しは変更されていないことを確認する。

---

### ステップ6: 全追加テストの実行確認

T-05〜T-06 を含む全テストを実行し、PASS を確認する。

```bash
pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade"
```

期待結果: T-01〜T-06 が全て PASS

---

## 統合テスト連携

- `onWorkflowStateSnapshot` コールバックは IPC チャンネル `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` へワイヤリングされている
- Phase 6 で追加するテストはユニットテストレベルのみ（IPC レイヤーはスコープ外）
- Renderer 側統合テストは本タスクのスコープ外

---

## 成果物

| 成果物                       | パス                                                                                                                                  | 内容                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 6 テスト拡充仕様書     | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-6-test-expansion.md`                                  | 本ドキュメント                         |
| 追加テスト T-05〜T-06        | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`（または既存テストファイルへの追記） | branch coverage 補完テスト             |
| Phase 6 outputs ディレクトリ | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-6/`                                           | Phase 6 出力格納ディレクトリ（空でOK） |

---

## 完了条件

- [ ] Phase 4 で作成した T-01〜T-04 が全て PASS している（baseline 確認）
- [ ] T-05: structured error パスで snapshot が存在しない場合も `snapshot ?? null` で伝搬されることを確認した
- [ ] T-06: catch パスで `String(error)` ルートと `snapshot ?? null` の null 分岐が使われることを確認した
- [ ] 回帰ガード: `execute()` / `plan()` / `improve()` の既存テストが全て PASS している
- [ ] 回帰ガード: `onWorkflowStateSnapshot` の使用箇所が変更されていないことを確認した
- [ ] T-01〜T-06 が全て PASS している

---

## Phase 末端アクション【必須】

- [ ] Phase 6 内の全タスクを 100% 実行完了
- [ ] T-05〜T-06 のテスト追加と全テスト PASS を明記
- [ ] 回帰ガード確認完了を明記
- [ ] 成果物（本ドキュメント・追加テスト）が生成されていることを確認

---

## 次 Phase

Phase 6 完了後、次は **Phase 7（カバレッジ確認）** へ進む。
