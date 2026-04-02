# TASK-FIX-LIFECYCLE-PANEL-ERROR-001: 実装ガイド

## Part 1

### なぜ必要か

この修正が必要だった理由は、失敗を伝えるはずのメッセージが、状態更新のたびに勝手に消えてしまっていたからです。失敗したことが見えなくなると、使う人は「何が起きたのか」を判断できません。

たとえば:

- 宅配の不在票をポストに入れた直後に、別の人が「もう用事は終わった」と思って捨ててしまうと、本当は再配達の案内が必要なのに読めません。
- 今回のエラー表示も同じで、まだ読む必要があるのに別の状態更新が先に片付けてしまっていました。

### 何をするか

`SkillLifecyclePanel` が workflow の snapshot を受け取るたびに、今の phase を見て error を消すかどうかを決めます。

1. `handoff` 以外なら、次の作業へ進んだと判断して error を消す
2. `handoff` なら、まだ失敗内容を見せる必要があるので error を残す
3. `handoffBundle` があれば、error の有無とは別に handoff guidance を更新する

### 日常の例え

たとえば:
学校の連絡板に「提出物を出し直してください」と貼り紙があるとします。先生が次の連絡を貼るたびに、その貼り紙を自動で外してしまうと、出し直しが必要な人は困ります。今回の修正は、「出し直しの案内が必要な状態では貼り紙を残し、別の通常連絡のときだけ片付ける」ようにしたイメージです。

### 今回作ったもの

| 日本語                 | 英語                    | 役割                                             |
| ---------------------- | ----------------------- | ------------------------------------------------ |
| 共通 snapshot 適用処理 | `applyWorkflowSnapshot` | どの経路でも同じ phase 判定で state を更新する   |
| 手渡しフェーズ         | `handoff`               | error を残しつつ guidance を更新する終端フェーズ |
| 手渡し情報             | `handoffBundle`         | ターミナルへ引き継ぐための案内情報               |

## Part 2

### 型定義

```typescript
type SkillCreatorWorkflowPhase =
  | "plan"
  | "review"
  | "execute"
  | "verify"
  | "improve"
  | "handoff";

type SkillCreatorWorkflowUiSnapshot = {
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  awaitingUserInput: SkillCreatorUserInputRequest | null;
  verifyResult?: unknown;
  resumeTokenEnvelope: {
    version: string;
    planId: string;
    currentPhase: SkillCreatorWorkflowPhase;
    artifactCount: number;
    updatedAt: string;
  };
  handoffBundle: TerminalHandoffBundle | null;
};
```

```typescript
const applyWorkflowSnapshot = (snapshot: SkillCreatorWorkflowUiSnapshot) => {
  setWorkflowSnapshot(snapshot);
  if (snapshot.currentPhase !== "handoff") {
    setWorkflowError(null);
  }
  if (snapshot.handoffBundle) {
    setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
  }
};
```

### 使用例

API シグネチャと、今回実際に修正対象にした使用箇所です。

```typescript
type SkillCreatorRuntimeApi = {
  onWorkflowStateChanged?: (
    callback: (snapshot: SkillCreatorWorkflowUiSnapshot) => void,
  ) => () => void;
  getWorkflowState?: (
    planId: string,
  ) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;
  submitUserInput?: (
    submission: SkillCreatorUserInputSubmission,
  ) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;
};
```

```typescript
return skillCreatorApi.onWorkflowStateChanged((snapshot) => {
  applyWorkflowSnapshot(snapshot);
});

const result = await skillCreatorApi.getWorkflowState(planId);
if (result.success && result.data) {
  applyWorkflowSnapshot(result.data);
}

const submitResult = await skillCreatorApi.submitUserInput(submission);
if (submitResult.success && submitResult.data) {
  applyWorkflowSnapshot(submitResult.data);
}
```

### エラーハンドリング

- `getWorkflowState` / `submitUserInput` が `success: false` を返した場合は、既存どおり `setWorkflowError(message)` で失敗内容を保持する
- 例外が throw された場合は、人が読める fallback message を入れる
- `handoff` のときだけ error clear を止めるので、失敗時の message と terminal guidance を同時に持てる
- `vitest` 再実行は環境ブロッカーのため未完了であり、Phase 10/11 では BLOCKED と明記する

### エッジケース

1. `handoffBundle` があるが `currentPhase !== "handoff"` の snapshot
   - guidance は更新する
   - error clear は phase 判定に従う
2. `handoff` snapshot を `onWorkflowStateChanged` 以外の経路で受け取る場合
   - `getWorkflowState`
   - `submitUserInput`
   - execute 後の `getWorkflowState`
     いずれも `applyWorkflowSnapshot()` を通す
3. 旧語彙 `phase: 'failed'`
   - shared type に存在しないため不採用
   - current vocabulary は `currentPhase: "handoff"`

### 設定項目と定数一覧

| 項目                                    | 値                              | 用途                                    |
| --------------------------------------- | ------------------------------- | --------------------------------------- | --------- | -------- | --------- | ---------- | ---------------------- |
| `snapshot.currentPhase`                 | `"plan"                         | "review"                                | "execute" | "verify" | "improve" | "handoff"` | error clear 条件の分岐 |
| `snapshot.handoffBundle`                | `TerminalHandoffBundle \| null` | terminal handoff guidance の更新        |
| `planId`                                | `string`                        | snapshot 再取得と submit 送信先の識別子 |
| `TC-EP-01` 〜 `TC-EP-08`                | `test case IDs`                 | 4 経路 + 既存挙動維持の回帰観点         |
| `outputs/phase-11/screenshot-plan.json` | `nonVisual: true`               | 今回は screenshot を撮らない分類証跡    |

### テスト構成

```text
TC-EP-01: onWorkflowStateChanged + handoff
TC-EP-02: onWorkflowStateChanged + execute
TC-EP-03: onWorkflowStateChanged + verify
TC-EP-04: onWorkflowStateChanged + handoffBundle
TC-EP-05: onWorkflowStateChanged + handoffBundle なし
TC-EP-06: getWorkflowState + handoff
TC-EP-07: submitUserInput + handoff
TC-EP-08: execute 後の getWorkflowState + handoff
```

補足:

- `vitest` の再実行は esbuild host/binary mismatch で BLOCKED
- そのため current wave では、コード・仕様書・台帳・lesson を先に current facts へ戻して false green を避ける
