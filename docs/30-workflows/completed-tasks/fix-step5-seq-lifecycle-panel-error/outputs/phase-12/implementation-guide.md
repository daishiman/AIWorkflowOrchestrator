# 実装ガイド: SkillLifecyclePanel `currentPhase: 'handoff'` 時のエラー永続化

## Part 1（中学生レベル）

### なぜ必要か

アプリが「エラーが出た」と言っているのに、すぐにその表示が消えてしまうと、ユーザーは原因を見失います。特に、同じ作業の途中で別の通知が届くような状況では、エラーを消してよいタイミングと、消してはいけないタイミングが混ざります。

### 日常生活での例え

たとえば、先生が「提出物にミスがある」と黒板に書いた直後に、別の連絡（次の授業の話）を始めたからといって、ミスの注意書きまで消してしまうと困ります。注意は残しておき、直すべきことが終わった段階で消すべきです。

### 何をするか（この変更でできること）

| やること     | 説明                                     | 例                                  |
| ------------ | ---------------------------------------- | ----------------------------------- |
| エラーを残す | ある段階（handoff）ではエラーを消さない  | 次の通知が来てもエラー表示が残る    |
| エラーを消す | それ以外の段階では従来どおりエラーを消す | execute/verify ではエラークリアする |

## Part 2（技術者レベル）

### 対象ファイル

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

### 背景（Before）

`SKILL_CREATOR_WORKFLOW_STATE_CHANGED` 相当のスナップショットを受け取るたびに `setWorkflowError(null)` を無条件に呼ぶと、`currentPhase: 'handoff'` の直後に別スナップショットが届いた場合に、表示すべきエラーまでクリアされる。

#### Before（概略）

```ts
// 受信のたびに無条件でエラーをクリアしていた
setWorkflowSnapshot(snapshot);
setWorkflowError(null);
if (snapshot.handoffBundle) {
  setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
}
```

### 変更内容（After）

`currentPhase` が `"handoff"` のときだけ、エラークリアを行わない。

#### After（概略）

```ts
setWorkflowSnapshot(snapshot);
if (snapshot.currentPhase !== "handoff") {
  setWorkflowError(null);
}
if (snapshot.handoffBundle) {
  setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
}
```

### TypeScript 型定義（抜粋）

このタスクで新規の public interface は追加していないが、説明用にスナップショットの最小形を抜粋する。

```ts
type SkillCreatorWorkflowUiSnapshot = {
  planId: string;
  currentPhase:
    | "plan"
    | "review"
    | "execute"
    | "verify"
    | "improve"
    | "handoff";
  handoffBundle: TerminalHandoffBundle | null;
  awaitingUserInput: { requestId: string } | null;
};

type TerminalHandoffBundle = {
  suggestedCommand: string;
};
```

### API シグネチャ

本件の主対象は「イベント受信時のコールバック適用」だが、テストでは `window.electronAPI.skillCreator.onWorkflowStateChanged` に渡される callback を捕捉して、擬似的にイベントを流している。

APIシグネチャ（概念）:

```ts
// APIシグネチャ（概念）
window.electronAPI.skillCreator.onWorkflowStateChanged(
  (snapshot: SkillCreatorWorkflowUiSnapshot) => void,
): () => void;
```

### 使用例（テストでの利用）

使用例:

```ts
// 使用例: 登録された callback をキャプチャして任意の snapshot を流す
const { triggerCallback } = setupCallbackCapture();
triggerCallback(buildSnapshot("handoff"));
triggerCallback(buildSnapshot("execute"));
```

### エラーハンドリング

エラーハンドリング方針:

- `"handoff"` では `setWorkflowError(null)` を呼ばない。エラー表示の永続化が目的。
- `"handoff"` 以外では従来どおりエラーをクリアする（過去のエラーが残り続ける副作用を避ける）。

### エッジケース（境界条件）

- `currentPhase: "handoff"` のスナップショット受信後に、別フェーズ（例: `"execute"`）のスナップショットが連続して届く。
  - `"handoff"` の受信でエラーが消えないこと（AC-1/3）。
  - その後 `"execute"` を受け取った時点でエラーがクリアされること（AC-2）。
- `handoffBundle` の有無。
  - `"handoff"` で `handoffBundle` がある場合は `setHandoffGuidance` が呼ばれる（別条件として維持）。

### 設定可能なパラメータと定数一覧

設定可能なパラメータ:

- なし（UI コンポーネント内部の条件分岐のみ）

定数一覧:

- `"handoff"`（`SkillCreatorWorkflowUiSnapshot["currentPhase"]` のリテラル値）

### Consumer Contract & IPC Compatibility

- N/A（IPC の request/response 形状の変更なし。Renderer 内の state 更新条件のみ変更。）
