# Implementation Guide

## Part 1: 初学者向け

なぜ必要かというと、失敗した瞬間の状態が消えると、次に直す人が「どこで止まったのか」をたどれなくなるからである。たとえば、教室で配る名簿に「欠席」「再確認待ち」「提出済み」が書かれていないと、先生も生徒も次に何をすればよいか分からなくなる。今回の修正は、その名簿をいつ見ても同じ意味で読めるようにするための整理である。

何をするかというと、`execute` で失敗したら失敗の記録を残し、`verify` で人の確認が必要なら理由付きで確認待ちにし、飛び越し移動を禁止する。これで後から見ても流れが追え、別の人が続きを引き継いでも迷わない。

## Part 2: 技術者向け

### 主要契約

```ts
type SkillCreatorWorkflowFailureReason =
  | "execution_error"
  | "execution_failed"
  | "verification_review";

interface SkillCreatorVerifyResult {
  status: "pending" | "pass" | "fail";
  reason?: SkillCreatorWorkflowFailureReason;
  message?: string;
  nextAction?: "review" | "improve";
  updatedAt: string;
}
```

### API シグネチャ方針

```ts
recordExecuteStart(
  planResult: RuntimeSkillCreatorPlanResult,
  decision: RuntimeDecision,
): SkillCreatorWorkflowStateSnapshot;

recordExecuteResult(
  planId: string,
  result: RuntimeSkillCreatorExecuteResult,
): SkillCreatorWorkflowStateSnapshot;

recordExecutionFailure(
  planId: string,
  input: {
    executeId: string;
    skillName: string;
    reason: "execution_error" | "execution_failed";
    message: string;
  },
): SkillCreatorWorkflowStateSnapshot;

recordVerifyFailure(
  planId: string,
  message: string,
  nextAction?: "review" | "improve",
): SkillCreatorWorkflowStateSnapshot;
```

### 使用例

```ts
const snapshot = engine.recordExecutionFailure("plan-001", {
  executeId: "exec-error-1",
  skillName: "test-skill",
  reason: "execution_error",
  message: "executor rejected",
});

if (snapshot.awaitingUserInput?.reason === "verification_review") {
  // Renderer と resume flow は reason を唯一の分岐条件として扱う。
}

engine.recordVerifyFailure(
  "plan-001",
  "verification requires review",
  "review",
);
```

### エッジケース

- reject と `success:false` は別ケースとして扱う
- invalid transition は例外化し、state と artifact を変更しない
- artifact は append を正本とし、consumer は末尾要素を latest として読む
- verify review は `currentPhase = "review"` と `awaitingUserInput.reason = "verification_review"` を同時に保存する

### エラーハンドリング

- executor reject は facade が捕捉し、engine へ失敗 snapshot 作成だけを委譲する
- `success:false` は正常レスポンス形だが failure lifecycle として保存する
- `verification_review` は `awaitingUserInput.reason` を必ず保存し、prompt 不在を許可しない
- invalid transition は例外または guard result として返し、state と artifact を汚さない

### 設定項目と定数一覧

| 区分          | 名前                         | 役割                                        |
| ------------- | ---------------------------- | ------------------------------------------- |
| reason 定数   | `execution_error`            | executor reject を表す                      |
| reason 定数   | `execution_failed`           | `success:false` を表す                      |
| reason 定数   | `verification_review`        | verify 要再確認を表す                       |
| consumer rule | latest accessor              | append history の末尾を latest として読む   |
| guard rule    | invalid transition rejection | `plan -> verify` のような飛び越しを禁止する |
