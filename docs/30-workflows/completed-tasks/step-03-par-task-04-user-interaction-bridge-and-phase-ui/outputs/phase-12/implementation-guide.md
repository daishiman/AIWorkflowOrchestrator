# user-interaction-bridge-and-phase-ui - 実装ガイド

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| 機能名   | user-interaction-bridge-and-phase-ui |
| 作成日   | 2026-03-26                           |
| 対象読者 | 開発者・技術者・学習者               |

## Part 1

### 2026-03-27 実装同期

今回の wave では docs だけでなく code path も Task04 に同期した。

| 層             | 実装内容                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| shared         | `SkillCreatorWorkflowUiSnapshot` / `SkillCreatorUserInputSubmission` など Task04 contract を追加                       |
| Main           | `SkillCreatorWorkflowEngine.submitUserInput()` と `handoffBundle` snapshot を追加                                      |
| IPC / Preload  | `skill-creator:get-workflow-state` / `skill-creator:submit-user-input` / `skill-creator:workflow-state-changed` を追加 |
| Renderer Store | `workflowSnapshot` / `workflowError` cache を追加                                                                      |
| Renderer UI    | `SkillLifecyclePanel` に phase summary / question host / provenance summary / handoff card を追加                      |

### なぜ必要か

この task が必要なのは、AI が今どの段階にいて、次に何をユーザーへ聞くかを、画面が勝手に作り直さず正しく伝える必要があるからです。画面側が推測で phase や warning を再計算すると、Main 側の workflow engine が持っている正しい状態とずれ、ユーザーは違う前提で答えてしまいます。

Task04 は「質問を考える場所」と「質問を見せる場所」を分け、Main を owner、Renderer を表示担当に固定することで、このずれを防ぎます。

### 何をするか

Task04 では次の4点を決めます。

| 項目               | 内容                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| workflow snapshot  | `currentPhase`、質問待ち状態、verify 結果、resume 情報を安全に受け取る         |
| question kind      | `single_select` / `free_text` / `secret` / `confirm` の4種で入力方法を固定する |
| phase UI           | phase badge、質問ブロック、source summary、handoff card を別 block で表示する  |
| handoff visible 化 | execute handoff を console だけで終わらせず UI surface に見せる                |

### 日常の例え

たとえば: 先生が出した質問を教室の黒板へそのまま書き写し、生徒は黒板を見て答える場面を想像してください。先生が質問を考える役、黒板が見せる役です。黒板が勝手に質問文を変えたり、次の授業内容を推測して書き足したりすると混乱します。

Task04 では Main の workflow engine が先生、Renderer が黒板です。黒板は見せ方を整えるだけで、質問の意味や進行段階の owner にはなりません。

### 今回作ったもの

| 日本語              | 英語                        | 役割                                                                    |
| ------------------- | --------------------------- | ----------------------------------------------------------------------- |
| workflow 状態橋渡し | workflow interaction bridge | Main の canonical state を Preload / Renderer に安全に届ける            |
| 質問要求            | user input request          | UI が表示する質問の種類、文言、入力形式を固定する                       |
| phase UI            | phase UI blocks             | phase badge、question host、source summary、handoff card を分離表示する |
| handoff 表示        | handoff surface             | `terminal_handoff` を visible UI として表示する                         |

## Part 2

### 型定義

現在の canonical snapshot と、Task04 が renderer 向けに拡張する target shape は次のとおりです。

```ts
export type SkillCreatorWorkflowPhase =
  | "plan"
  | "review"
  | "execute"
  | "verify"
  | "improve"
  | "handoff";

export interface SkillCreatorWorkflowStateSnapshot {
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  awaitingUserInput?: SkillCreatorAwaitingUserInput;
  verifyResult?: SkillCreatorVerifyResult;
  phaseArtifacts: SkillCreatorWorkflowPhaseArtifacts;
  resumeTokenEnvelope?: SkillCreatorResumeTokenEnvelope;
  routeSnapshot?: RuntimeSkillCreatorRouteSnapshot;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
}

export type SkillCreatorUserInputKind =
  | "single_select"
  | "free_text"
  | "secret"
  | "confirm";

export interface SkillCreatorUserInputRequest {
  requestId: string;
  reason: SkillCreatorAwaitingUserInputReason;
  title: string;
  prompt: string;
  kind: SkillCreatorUserInputKind;
  options?: Array<{ id: string; label: string; description?: string }>;
  placeholder?: string;
  allowSkip?: boolean;
  requestedAt: string;
}

export interface SkillCreatorUserInputSubmission {
  planId: string;
  requestId: string;
  selectedOptionId?: string;
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}

export interface SkillCreatorWorkflowUiSnapshot extends SkillCreatorWorkflowStateSnapshot {
  awaitingUserInput?: SkillCreatorUserInputRequest | null;
  handoffBundle?: TerminalHandoffBundle | null;
}
```

補足:

- `currentPhase` / `awaitingUserInput` / `verifyResult` / `resumeTokenEnvelope` は engine snapshot の核である。
- Task04 は owner を移さず、renderer が読める transport shape を追加する。
- `handoffBundle` は console-only gap を閉じる visible slot である。

### 使用例

API シグネチャは次の3経路に集約する。

```ts
invoke("skill-creator:get-workflow-state", { planId }): Promise<SkillCreatorWorkflowUiSnapshot>
invoke("skill-creator:submit-user-input", submission): Promise<SkillCreatorWorkflowUiSnapshot>
on("skill-creator:workflow-state-changed", listener): Unsubscribe
```

Renderer 側の使用例:

```ts
const snapshot = await window.skillCreator.getWorkflowState(planId);

if (snapshot.awaitingUserInput?.kind === "single_select") {
  await window.skillCreator.submitUserInput({
    planId,
    requestId: snapshot.awaitingUserInput.requestId,
    selectedOptionId: "use-existing-template",
  });
}
```

Main 側の実装順は次の通りです。

1. shared types を定義する
2. `SkillCreatorWorkflowEngine` / facade に requestId と snapshot read/update を追加する
3. `creatorHandlers.ts` と `preload/channels.ts` / `skill-creator-api.ts` に bridge を追加する
4. store slice に snapshot cache を追加する
5. `SkillLifecyclePanel` で phase badge、question host、provenance summary、handoff card を描画する

実装済みファイル:

- `packages/shared/src/types/skillCreator.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/store/index.ts`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

### エラーハンドリング

主な失敗モードは次の通りです。

| ケース                | 振る舞い                                                                        |
| --------------------- | ------------------------------------------------------------------------------- |
| stale `requestId`     | `submit-user-input` は reject し、最新 snapshot の再取得を促す                  |
| 不正な `kind` payload | Main 側で validation し、renderer は入力 UI を組み立てない                      |
| handler 未登録        | graceful degradation として action を disabled にし、state event 不達を説明する |
| secret の再表示       | snapshot / log / visible handoff に平文を残さない                               |

`secret` 入力は canonical snapshot に平文を保持しないこと、`confirm` は boolean のみ送ること、`single_select` は option id だけ送ることを前提とする。

### エッジケース

| ケース                                 | 対応方針                                                              |
| -------------------------------------- | --------------------------------------------------------------------- |
| `awaitingUserInput` が `null`          | question host を隠し、phase summary だけを表示する                    |
| `verifyResult` だけ存在する            | Task04 では summary 表示に留め、detail surface は Task06 に委譲する   |
| `resumeTokenEnvelope` だけ先行して届く | resume 導線の存在を示すが、persistence semantics は Task08 に委譲する |
| `terminal_handoff` が到着した          | console 出力だけで完了扱いにせず、UI の handoff card へ接続する       |
| provenance warning がある              | approval / disclosure 文言と混ぜず、source summary block に閉じ込める |

### 設定項目と定数一覧

Task04 で前提にする設定可能項目と定数は次の通りです。

| 項目                 | 値 / 候補                                         | 用途                                                        |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| channel prefix       | `skill-creator:*`                                 | public interaction bridge の命名統一                        |
| question kind        | `single_select`, `free_text`, `secret`, `confirm` | UI 入力種別の固定                                           |
| route scope          | `skillCreate`                                     | 新しい global route を増やさないための表示境界              |
| owner                | `SkillCreatorWorkflowEngine`                      | phase / awaitingUserInput / verifyResult の source of truth |
| visible handoff slot | `TerminalHandoffCard` 優先                        | `terminal_handoff` の UI 表示                               |

### テスト構成

Task04 の回帰観点は次の5群に分ける。

| 観点                | 内容                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| owner coverage      | engine owner / store cache / local draft の責務分離                  |
| bridge coverage     | getter / submit / event の3経路                                      |
| question coverage   | `single_select` / `free_text` / `secret` / `confirm`                 |
| UI block coverage   | phase badge / question host / provenance summary / handoff card      |
| regression coverage | 既存 `planSkill` / `executePlan` / `improveSkillWithFeedback` 互換性 |

### Phase 11 画面証跡

2026-03-27 時点では walkthrough 文書は揃っているが、current code wave で追加された phase summary / question host / provenance summary / handoff card の representative screenshot は未取得である。したがって Task04 の Phase 11 は「文書ベースでは PASS、画面証跡は follow-up」で扱う。

| 項目                      | 状態   | 補足                                                        |
| ------------------------- | ------ | ----------------------------------------------------------- |
| walkthrough 証跡          | あり   | `manual-test-result.md` と `phase-11-manual-test.md` で確認 |
| representative screenshot | 未取得 | `TASK-SDK-04-U3` で formalize                               |
| placeholder PNG           | あり   | validator compatibility 用の補助証跡                        |

### Known Follow-up

| ID               | 内容                                                               | 影響                                                    |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| `TASK-SDK-04-U1` | `submitUserInput()` が回答を phase semantics へ反映しない          | plan review / verification review の UI が no-op になる |
| `TASK-SDK-04-U2` | execute が canonical plan ではなく current textarea 値へ再依存する | plan review 後の実行対象が drift する                   |
| `TASK-SDK-04-U3` | Phase 11/12/13 evidence と canonical path が stale                 | close-out の再利用性と監査精度が落ちる                  |
