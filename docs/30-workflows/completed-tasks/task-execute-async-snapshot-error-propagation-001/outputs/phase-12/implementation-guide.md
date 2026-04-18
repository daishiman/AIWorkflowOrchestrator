# Phase 12: 実装ガイド

> 作成日: 2026-04-18
> タスクID: TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001

## Part 1: 中学生レベルの説明

### なぜ必要か

スキル作成の途中でエラーが起きたとき、画面側にその失敗をちゃんと伝えないと、
利用者は「まだ動いているのか」「止まったのか」を判断できません。

たとえば、荷物を届ける配達員が途中で引き返したのに、受付だけがその事実を知らないと、
受け取る側はずっと待ち続けてしまいます。今回の確認は、それと同じで、
Main Process で起きた失敗が IPC を通って Renderer に届くかを見直す作業です。

### 何をしたか

- `executeAsync()` の error / catch / success / terminal_handoff の各経路を確認しました
- `snapshot ?? null` による null 正規化が current facts として成立していることを確認しました
- `errorCode` / `errorMessage` を snapshot 本体へ足さなくても、第3引数の `errorMessage` で要件を満たすと確定しました
- Phase 1-12 の close-out 文書、台帳、parity を current facts に合わせて修正しました

### 今回作ったもの

- verification / close-out 文書一式
- `manual-test-result.md` を主証跡とする NON_VISUAL 証跡
- root / outputs で整合した `artifacts.json`
- completed ledger / recent bundle / stale unassigned-task の同期更新

### 確認の流れ

```text
executeAsync() でエラー発生
  ↓
onWorkflowStateSnapshot(planId, snapshot ?? null, errorMessage)
  ↓
creatorHandlers.ts が IPC イベントへ中継
  ↓
preload の onWorkflowStateChanged(snapshot, errorMessage)
  ↓
Renderer が errorMessage と snapshot を反映
```

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。

## Part 2: 技術者レベルの説明

### TypeScript 型定義

```ts
type WorkflowStateCallback = (
  planId: string,
  snapshot: SkillCreatorWorkflowUiSnapshot | null,
  error?: string,
) => void;
```

```ts
export interface SkillCreatorWorkflowStateSnapshot extends SkillCreatorWorkflowUiSnapshot {
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  awaitingUserInput: SkillCreatorAwaitingUserInput | null;
  verifyResult: SkillCreatorVerifyResult | null;
}
```

### APIシグネチャ

```ts
async executeAsync(
  planId: string,
  args: {
    planId: string;
    skillSpec: string;
    authMode?: AuthMode;
    apiKey?: string | null;
  },
): Promise<void>
```

```ts
onWorkflowStateChanged(
  callback: (
    snapshot: SkillCreatorWorkflowUiSnapshot | null,
    errorMessage?: string,
  ) => void,
): () => void
```

### 使用例

```ts
window.electronAPI.skill.onWorkflowStateChanged((snapshot, errorMessage) => {
  if (errorMessage) {
    console.error("workflow error:", errorMessage);
  }

  if (snapshot) {
    console.log(snapshot.currentPhase, snapshot.verifyResult?.message);
  }
});
```

### executeAsync() のパス区別

| パス             | コールバック / 通知                                                                     | 内容                                      |
| ---------------- | --------------------------------------------------------------------------------------- | ----------------------------------------- |
| structured error | `onWorkflowStateSnapshot(planId, snapshot ?? null, extractExecuteErrorMessage(result))` | structured error を文字列へ正規化して中継 |
| catch            | `onWorkflowStateSnapshot(planId, snapshot ?? null, errorMessage)`                       | throw された例外を補足して中継            |
| success          | `triggerPhaseTransition(..., "complete", 100)` 経由の snapshot 通知                     | errorMessage なしで verify へ遷移         |
| terminal_handoff | `triggerPhaseTransition(..., "complete", 100)` 経由の snapshot 通知                     | errorMessage なしで handoff 完了          |

### SkillCreatorWorkflowStateSnapshot の変更要否

**変更不要**

`errorCode` / `errorMessage` を snapshot 本体へ追加する必要はありません。
現在の正本は callback / IPC の第3引数 `errorMessage?: string` であり、
workflow state には `verifyResult.message` が補助的に残る構造です。

### creatorHandlers.ts relay の影響範囲

```ts
function emitWorkflowStateChanged(
  mainWindow: BrowserWindow,
  snapshot: SkillCreatorWorkflowUiSnapshot | null,
  errorMessage?: string,
): void;
```

- `errorMessage !== undefined` の場合は `snapshot` が `null` でも送信する
- `snapshot` のみ存在する場合は従来どおり snapshot だけを送信する
- `mainWindow.isDestroyed()` の場合は送信を打ち切る

### エラーハンドリング

- structured error は `extractExecuteErrorMessage(result)` で `string` へ正規化する
- catch パスは `error instanceof Error ? error.message : String(error)` を使う
- `console.error` は catch パスで観測点を残す
- `errorCode` は execute response 側の情報としてはありうるが、workflow state 契約には昇格させない

### エッジケース

- snapshot 未生成時でも `snapshot ?? null` で null を明示送出する
- `onWorkflowStateSnapshot` 未設定時は optional chaining で安全に無視する
- `terminal_handoff` / `success` は errorMessage なしで complete フェーズへ進む
- `throw` された値が `Error` でなくても `String(error)` で可視化する

### 設定項目と定数一覧

| 項目                            | 値 / 役割                          |
| ------------------------------- | ---------------------------------- |
| `planId`                        | 対象 workflow の識別子             |
| `args.planId`                   | IPC payload 側の planId            |
| `args.skillSpec`                | 実行対象 skill spec                |
| `args.authMode`                 | `api-key` などの認証モード         |
| `args.apiKey`                   | adapter 実行用 API key             |
| `SkillCreatorExecuteAsyncPhase` | `executing` / `complete` / `error` |

### テスト構成

| レイヤー | ファイル / コマンド                                                                  | 役割                                    |
| -------- | ------------------------------------------------------------------------------------ | --------------------------------------- |
| runtime  | `src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | T-01〜T-06 の callback 契約確認         |
| IPC      | `src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts`                     | snapshot なし + errorMessage relay 確認 |
| 型検査   | `pnpm --filter @repo/desktop typecheck`                                              | public contract の破綻検知              |
| 静的検査 | `pnpm --filter @repo/desktop lint`                                                   | 実装整合確認                            |

### 既存完了タスクとの carry-over

| タスクID                                                 | 完了日     | 内容                                        |
| -------------------------------------------------------- | ---------- | ------------------------------------------- |
| `TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001` | 2026-04-06 | `errorMessage` 第3引数伝搬の実装修正        |
| `TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001`      | 2026-04-18 | verification / docs close-out / parity 修正 |

本タスクは新規実装ではなく、current facts の確認と close-out 品質改善を目的にしています。
