# Phase 5: 実装

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 5                         |
| 機能名 | approval-request-producer |
| 作成日 | 2026-04-01                |

## 目的

Phase 4 で作成した RED テストを GREEN に変える。`HooksFactory.createPreToolUseHook()` 内の `TODO(human)` 箇所に `pushApprovalRequest` 呼び出しを実装する。producer 本体の変更は小さいが、DI チェーンの引数伝搬と既存テストの追従は別ファイルで同時に行う。

---

## 実装前チェックリスト

| 確認項目                                                              | 確認方法                                                                             | 状態   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------ |
| Phase 4 テストが RED（失敗）であること                                | `pnpm --filter @repo/desktop test -- HooksFactory.producer.test.ts`                  | 要確認 |
| 既存テスト `HooksFactory.test.ts` が PASS していること                | `pnpm --filter @repo/desktop test -- HooksFactory.test.ts`                           | 要確認 |
| `HooksFactory.ts` に `pushApprovalRequest` のインポートが存在すること | `grep -n "pushApprovalRequest" apps/desktop/src/main/services/agent/HooksFactory.ts` | 要確認 |
| `HooksFactory.ts` に `uuidv4` のインポートが存在すること              | `grep -n "uuidv4" apps/desktop/src/main/services/agent/HooksFactory.ts`              | 要確認 |
| `this.sessionId` フィールドがコンストラクタで注入済みであること       | `grep -n "sessionId" apps/desktop/src/main/services/agent/HooksFactory.ts`           | 要確認 |

---

## 実装対象

**ファイル**: `apps/desktop/src/main/services/agent/HooksFactory.ts`
**対象箇所**: `createPreToolUseHook()` 内の `TODO(human)` コメント（行 189-200 付近）

---

## 修正前コード

```typescript
for (const pattern of DANGEROUS_PATTERNS.BASH_COMMANDS) {
  if (command.includes(pattern)) {
    // TODO(human): ここに pushApprovalRequest 呼び出しを実装してください
    // operationId を生成し、pushApprovalRequest(this.mainWindow, {...}) を呼ぶ
    // sessionId: this.sessionId, operationType: "dangerous_bash_command" を使用
    // 例:
    //   const operationId = uuidv4();
    //   pushApprovalRequest(this.mainWindow, {
    //     sessionId: this.sessionId,
    //     operationId,
    //     operationType: "dangerous_bash_command",
    //     description: `Dangerous command blocked: ${pattern}`,
    //   });
    return {
      proceed: false,
      message: `Dangerous command blocked: ${pattern}`,
    };
  }
}
```

## 修正後コード

```typescript
for (const pattern of DANGEROUS_PATTERNS.BASH_COMMANDS) {
  if (command.includes(pattern)) {
    const operationId = uuidv4();
    pushApprovalRequest(this.mainWindow, {
      sessionId: this.sessionId,
      operationId,
      operationType: "dangerous_bash_command",
      description: `Dangerous command blocked: ${pattern}`,
    });
    return {
      proceed: false,
      message: `Dangerous command blocked: ${pattern}`,
    };
  }
}
```

---

## 実装手順

1. `apps/desktop/src/main/services/agent/HooksFactory.ts` を開く
2. `createPreToolUseHook()` 内の `TODO(human)` コメント全体（行 189〜200 付近）を選択する
3. 以下の実装コードで置き換える:

```typescript
const operationId = uuidv4();
pushApprovalRequest(this.mainWindow, {
  sessionId: this.sessionId,
  operationId,
  operationType: "dangerous_bash_command",
  description: `Dangerous command blocked: ${pattern}`,
});
```

4. `return` 文の前に挿入する（`return { proceed: false, ... }` は変更しない）

---

## DI チェーン確認（本ブランチで追従済み）

```
ipc/index.ts
  └── DefaultApprovalGate インスタンス生成
  └── registerAgentExecutionHandlers(mainWindow, approvalGate)
        └── agentHandlers.ts
              └── executionManager.startExecution(request, mainWindow, approvalGate)
                    └── ExecutionManager.ts
                          └── AgentExecutor(request, mainWindow, approvalGate, ...)
                                └── HooksFactory(mainWindow, executionId, permissionResolver, approvalGate, sessionId=executionId)
                                      └── createPreToolUseHook()
                                            └── pushApprovalRequest(this.mainWindow, {...})  ← 今回の実装箇所
```

**変更しないファイル**（producer 接続以外の回帰確認対象）:

- `apps/desktop/src/main/ipc/approvalHandlers.ts`
- `apps/desktop/src/main/services/agent/SkillCreatorHooksFactory.ts`

---

## GREEN 確認手順

```bash
# 1. Phase 4 テストが GREEN になることを確認
pnpm --filter @repo/desktop test -- HooksFactory.producer.test.ts

# 2. 既存テストへのリグレッションがないことを確認
pnpm --filter @repo/desktop test -- HooksFactory.test.ts
pnpm --filter @repo/desktop test -- AgentExecutor.test.ts
pnpm --filter @repo/desktop test -- ExecutionManager.test.ts
pnpm --filter @repo/desktop test -- integration.test.ts
pnpm --filter @repo/desktop test -- agentHandlers.test.ts
pnpm --filter @repo/desktop test -- agentHandlers.runtime.test.ts

# 3. IPC / 統合テストの確認
pnpm --filter @repo/desktop test -- index.integration.test.ts
pnpm --filter @repo/desktop test -- approvalHandlers.push.test.ts

# 4. 型チェック（0 エラー）
pnpm --filter @repo/desktop typecheck
```

---

## 受入基準の達成確認

| AC   | 基準                                                                                          | 確認テスト                                  | 達成状態       |
| ---- | --------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------- |
| AC-1 | `createPreToolUseHook()` が危険コマンド検出後に `pushApprovalRequest` を呼ぶこと              | `HooksFactory.producer.test.ts` テスト 1    | Phase 5 で達成 |
| AC-2 | ペイロードに `sessionId`（コンストラクタ注入値）と `operationId`（非空文字列）が含まれること  | `HooksFactory.producer.test.ts` テスト 2, 4 | Phase 5 で達成 |
| AC-3 | `operationId` が `uuidv4()` で生成された UUID 形式であること                                  | `HooksFactory.producer.test.ts` テスト 3    | Phase 5 で達成 |
| AC-4 | Main → Preload → Renderer の実発火テスト（`approvalHandlers.push.test.ts`）が継続して通ること | `approvalHandlers.push.test.ts` 回帰テスト  | Phase 5 で達成 |
| AC-5 | `approvalGate` / `sessionId` が DI チェーン経由で渡されること                                 | コードレビュー・既存テスト PASS             | 既に達成済み   |

---

## 実装後の注意事項

| 項目                                       | 内容                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `operationType` の文字列                   | `"dangerous_bash_command"` を使用する（Phase 3 残課題より確定）                                                                 |
| `description` フォーマット                 | `Dangerous command blocked: ${pattern}` を使用する（設計書・TODO コメントと一致）                                               |
| 既存テスト `HooksFactory.test.ts` への影響 | コンストラクタに `approvalGate` と `sessionId` が追加されているため、既存テストのコンストラクタ呼び出しにスタブが必要か確認する |

---

## 参照資料

| 資料名                   | パス                                                   | 説明                             |
| ------------------------ | ------------------------------------------------------ | -------------------------------- |
| phase-4-test-creation.md | `./phase-4-test-creation.md`                           | RED テスト仕様                   |
| phase-2-design.md        | `./phase-2-design.md`                                  | 接続ポイント・型設計             |
| HooksFactory.ts          | `apps/desktop/src/main/services/agent/HooksFactory.ts` | 実装対象（TODO(human) 設置済み） |
| approvalHandlers.ts      | `apps/desktop/src/main/ipc/approvalHandlers.ts`        | `pushApprovalRequest()` 実装済み |

---

## 成果物

| 成果物   | パス                                                                   | 説明                     |
| -------- | ---------------------------------------------------------------------- | ------------------------ |
| 実装仕様 | `phase-5-implementation.md`                                            | 本ファイル               |
| 実装箇所 | `apps/desktop/src/main/services/agent/HooksFactory.ts` 行 189-200 付近 | TODO(human) 箇所への実装 |

---

## 完了条件

- [ ] `HooksFactory.ts` の `TODO(human)` コメントが実装コードに置き換えられている
- [ ] `HooksFactory.producer.test.ts` の全 7 件が GREEN（PASS）である
- [ ] `HooksFactory.test.ts` の既存テストが全て引き続き PASS する
- [ ] `approvalHandlers.push.test.ts` の回帰テストが PASS する
- [ ] `tsc --noEmit` が 0 エラーで通過する
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

Phase 6: テスト拡充 → [phase-6-test-expansion.md](phase-6-test-expansion.md)

## 実行タスク

- `HooksFactory.ts` と DI チェーンの current contract を実装する
- `pushApprovalRequest()` の送信経路を `createPreToolUseHook()` に接続する
- regression-only テストが壊れないことを確認する

## 統合テスト連携

- Phase 4 の producer テストを実装後に再実行する
- Phase 6/7 の追加テストで回帰を監視する
