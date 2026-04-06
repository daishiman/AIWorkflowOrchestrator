# Implementation Guide

## Part 1: 中学生レベル

### なぜこれが必要か

スキルを自動で良くしていく「繰り返し処理（ループ）」があるとします。
このループの途中で失敗しても、ユーザーに何も伝わらないと「何が起きたか」が分からず、同じ失敗を何度も踏みやすくなります。

日常生活での例えとして、たとえば「授業で配られるプリントの回収」を想像してください。
回収箱が空なのに先生が黙って次に進むと、生徒は「出したのか出してないのか」「どこで止まったのか」が分かりません。
回収に失敗したときは、その場で知らせる方が次の行動を決めやすくなります。

今回の変更は、`verifyAndImproveLoop()` の中で improve が失敗した場合も、単体実行と同じように OS 通知を出して失敗を目に見える形にそろえるものです。

### この機能でできること

| できること       | 説明                                               | 例                                                                    |
| ---------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| 失敗を通知する   | ループ内の improve 失敗を通知で伝える              | 「スキル作成失敗: LLMAdapter の初期化中です。しばらくお待ちください」 |
| 状態を正しく残す | 失敗時に workflow snapshot を `improve` のまま残す | `currentPhase: "improve"` を維持し、次アクションを誤らせない          |

## Part 2: 技術者レベル

### current contract / target delta

| 観点               | current contract（変更後）                                                                                                                           | target delta（このタスクで確定させる差分）                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| improve 失敗の扱い | `verifyAndImproveLoop()` は improve の失敗を `finalStatus: "error"` で返し、`recordImproveFailureSnapshot()` で `currentPhase: "improve"` を維持する | improve が `success:false` を返したときに、ユーザー通知も同一 wave で発火させる |
| 公開面の変更       | public IPC / preload / shared type は変更しない                                                                                                      | Step 2（domain spec 更新）は N/A を明示し、no-op 根拠を残す                     |

変更ファイル（実装）:

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

### TypeScript 型（抜粋）

```ts
export interface INotificationService {
  notify(title: string, body: string): void;
}

export interface RuntimeSkillCreatorImproveErrorResponse {
  success: false;
  error: { code: string; message: string };
}

export type RuntimeSkillCreatorImproveResponse =
  | {
      improveId: string;
      suggestions: Array<{
        section: string;
        before: string;
        after: string;
        reason: string;
      }>;
      revisedSpec?: string;
    }
  | { type: "terminal_handoff"; guidance: unknown }
  | RuntimeSkillCreatorImproveErrorResponse;

export interface RuntimeSkillCreatorVerifyAndImproveResult {
  finalStatus: "pass" | "fail" | "error";
  totalAttempts: number;
  finalChecks: Array<{
    id: string;
    layer: "layer1" | "layer2" | "layer3" | "layer4";
    severity: "info" | "warning" | "error";
    summary: string;
  }>;
  loopExhausted: boolean;
  errorCode?: string;
  errorMessage?: string;
  workflowSnapshot: {
    planId: string;
    currentPhase:
      | "improve"
      | "verify"
      | "review"
      | "execute"
      | "reverify"
      | "handoff"
      | "plan";
    verifyResult?: unknown;
  };
}
```

### APIシグネチャ

`RuntimeSkillCreatorFacade` 内部メソッド（抜粋）:

```ts
async verifyAndImproveLoop(
  planId: string,
  skillDir: string,
  skillName: string,
  authMode: string,
  apiKey?: string,
): Promise<RuntimeSkillCreatorVerifyAndImproveResult>;

async improve(
  skillName: string,
  feedback: string,
  authMode: "api-key" | "subscription",
  apiKey: string | null,
): Promise<RuntimeSkillCreatorImproveResponse>;

private recordImproveFailureSnapshot(planId: string, message: string): unknown;
```

### 使用例

`verifyAndImproveLoop()` の呼び出し例（内部利用のイメージ）:

```ts
const result = await runtimeSkillCreatorFacade.verifyAndImproveLoop(
  planId,
  skillDir,
  skillName,
  authMode,
  apiKey,
);

if (result.finalStatus === "error") {
  // notify は best-effort なので、戻り値も必ず確認する
  console.error(result.errorCode, result.errorMessage);
}
```

### エラーハンドリング

`verifyAndImproveLoop()` の improve 失敗は、次の 2 系統に分岐します。

| 失敗系                                               | 判定                                                   | ループの返り値                                      | 追加処理                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| improve が `success:false` を返す                    | `"success" in improveResult && !improveResult.success` | `finalStatus: "error"` + `errorCode`/`errorMessage` | `notificationService?.notify("スキル作成失敗", errorMessage)` を実行し、snapshot を `improve` として固定 |
| improve が例外を投げる（notify 実装の throw を含む） | `try { ... } catch (err)`                              | `finalStatus: "error"` + `errorMessage`             | `recordImproveFailureSnapshot(planId, "...")` で `improve` を維持                                        |

### エッジケース

- `verificationEngine` が未注入の場合、verify は空配列となり得る（この場合、ループは PASS 判定へ寄りやすいので呼び出し側で前提を固定する）。
- `suggestions.length === 0` や `applyResult.applied === 0` は `finalStatus: "fail"` で返す（「改善提案なし」「改善適用失敗」）。
- `attemptCount >= maxImproveRetry` 到達時は `loopExhausted: true` を返し、次アクションを `"review"` として failure を記録する。

### 設定と定数

| 項目              | 値                                                       | 備考                                                 |
| ----------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| `maxImproveRetry` | デフォルト `3`（`1..10` に clamp）                       | `RuntimeSkillCreatorFacadeDeps.maxImproveRetry`      |
| 通知タイトル      | `"スキル作成失敗"`                                       | `notificationService.notify(title, body)`            |
| degraded reason   | `llm_adapter_unavailable`, `resource_loader_unavailable` | `improve()` は adapter 未準備時に error union を返す |
