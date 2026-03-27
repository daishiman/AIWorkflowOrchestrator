# Implementation Guide

## Part 1: 何をそろえたのか

### runtime policy centralization とは何か

必要な理由は、同じ機能なのに入口ごとで違う判断が起きると、利用者も保守側も「どれが正しいのか」を毎回確認し直すことになるからです。

同じ判断をいろいろな場所で別々にしていると、片方だけ古いルールが残ります。  
たとえば、建物の入口が 2 つあって、片方だけ古い入館ルールのままだと、使う入口によって案内が変わってしまいます。

この wave では、Agent と Skill の入口がその状態にならないようにしました。  
「今はそのまま進めるのか」「端末へ引き渡すのか」という判断を、入口ごとではなく 1 つの決め方に寄せました。

### この機能でできること

| できること             | 説明                              | 例                                                             |
| ---------------------- | --------------------------------- | -------------------------------------------------------------- |
| 判断をそろえる         | Agent と Skill が同じ基準で動く   | どちらも handoff 理由に同じ文言を返す                          |
| 入口ごとの差を減らす   | 片方だけ古い処理が残りにくい      | Agent だけ旧 resolver、Skill だけ新 resolver、というずれを防ぐ |
| 後片付けを分けて考える | 本体の収束と cleanup を混同しない | `AI_CHECK_CONNECTION` の削除は別 task に分ける                 |

## Part 2: 技術詳細

### current contract

- authority: `RuntimePolicyResolver`
- consumer: `apps/desktop/src/main/ipc/agentHandlers.ts`, `apps/desktop/src/main/ipc/skillHandlers.ts`
- public transport: existing `AgentStartResult`, `SkillExecutionResponse`, `TerminalHandoffBuilder` が返す guidance
- cleanup carry-over: `AI_CHECK_CONNECTION`, deprecated `RuntimeResolver`, sanitize helper placement

### target delta

- `index.ts` で `AuthKeyService`、`StubSubscriptionAuthProvider`、`createAuthModeService()`、`RuntimePolicyResolver` を 1 回だけ組み立てる
- Agent / Skill consumer は `resolveWithService(authModeService.getMode())` を使う
- `terminal_handoff` 時の理由は `decision.bundle.manualRetryRule` を正本にする
- public IPC / preload / shared transport は no-op とし、existing shape を維持する

### 変更シグネチャ

```ts
registerAgentExecutionHandlers(
  mainWindow: BrowserWindow,
  customRules?: PermissionRules,
  runtimePolicyResolver?: IRuntimePolicyResolver,
  authModeService?: IAuthModeService,
): void

registerSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: SkillService,
  authKeyService?: IAuthKeyService,
  runtimePolicyResolver?: IRuntimePolicyResolver,
  authModeService?: IAuthModeService,
): void
```

### 使用例

```ts
const subscriptionAuthProvider = new StubSubscriptionAuthProvider();
const authModeService = createAuthModeService(
  authKeyService,
  subscriptionAuthProvider,
);
const runtimePolicyResolver = new RuntimePolicyResolver(
  authKeyService,
  subscriptionAuthProvider,
);

registerAgentExecutionHandlers(
  mainWindow,
  undefined,
  runtimePolicyResolver,
  authModeService,
);
```

### handoff 分岐

```ts
const decision = await runtimePolicyResolver.resolveWithService(
  authModeService.getMode(),
);

if (decision.type === "terminal_handoff") {
  const reason = decision.bundle.manualRetryRule;
  return {
    success: false,
    handoff: true,
    error: reason,
  };
}
```

### エラーハンドリング

- `terminal_handoff` の理由は `manualRetryRule` をそのまま返す
- resolver / auth service が未注入なら backward-compatible path を維持する
- public response shape は既存 `TerminalHandoffBuilder` を通じて安定させる

### 設定項目 / 定数一覧

| 要素                                         | 役割                               |
| -------------------------------------------- | ---------------------------------- |
| `StubSubscriptionAuthProvider`               | subscription 判定の provider       |
| `createAuthModeService()`                    | auth mode source                   |
| `RuntimePolicyResolver.resolveWithService()` | authority 呼び出し                 |
| `manualRetryRule`                            | handoff 理由の正本                 |
| `launcher`, `suggestedCommand`, `cwd`        | terminal guidance の既存 transport |

### エッジケース

- resolver 未注入時は既存 path を維持する
- `terminal_handoff` は Agent / Skill の両方で同じ vocabulary を使う
- public IPC / preload に差分がないため、Step 2 は no-op 判定にする

### 検証

- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/agentHandlers.runtime.test.ts src/main/ipc/__tests__/skillHandlers.runtime.test.ts`
- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/agentHandlers.test.ts`
- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.execute.test.ts src/main/ipc/__tests__/skillHandlers.contract.test.ts`
- `pnpm --filter @repo/desktop typecheck`
