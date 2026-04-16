# Phase 1: 現状分析（要件定義）

スキル作成フロー連動調査で発見された4件の未実装・未接続箇所について、実際のコードを読んで現状を記録する。

---

## 問題1: Streaming進捗の送信元不明（useStreamingProgress / skillCreatorAPI）

### 現状コード確認

**フロント側: `useStreamingProgress` フック**

- ファイル: `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
- 行番号: 71-115

フックは `window.skillCreatorAPI?.onProgress` を呼び出してコールバックを登録する。

```
// :71-75
function getSkillCreatorApi(): StreamingProgressApi | null {
  return (
    (window as Window & { skillCreatorAPI?: StreamingProgressApi })
      .skillCreatorAPI ?? null
  );
}
```

受信した `progress.phase` を `PHASE_TO_STAGE` マップ（:29-35）でUIステージに変換し、Zustand ストアへ書き込む（:104-108）。

**Preload側: `skillCreatorAPI.onProgress`**

- ファイル: `apps/desktop/src/preload/skill-creator-api.ts`
- 行番号: 673-676

```
onProgress: (callback) =>
  safeOn<SkillCreatorProgress>(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback),
```

`safeOn` が `ipcRenderer.on(channel, listener)` を呼び出し、IPC チャンネル `SKILL_CREATOR_PROGRESS` を購読してコールバックへ渡す。

**メインプロセス側: `sendSkillCreatorProgress`**

- ファイル: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- 行番号: 692-703

```
export function sendSkillCreatorProgress(mainWindow, progress) {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}
```

この関数は `export` されているが、**同ファイル内では呼び出されていない**。`createSkill` ハンドラー（:172-284）では `skillCreatorService.createSkill()` を呼ぶだけで進捗通知は一切送信されない。

### 根本原因

`sendSkillCreatorProgress` がエクスポートされているが、呼び出し元が存在しない。`SkillCreatorService.createSkill()` は同期的に処理を行い、進捗データをコールバック経由で報告する仕組みを持っていない。フロント・Preload・メインの3層は接続設計として正しく定義されているが、**メインプロセス側からの実際の `send()` 呼び出しが欠落している**。

### 影響範囲

- `GenerateStep.tsx` のプログレスバーとステップリストは常に初期状態（`stage: "idle"`）のまま
- `useStreamingProgress()` は IPC メッセージを受信しないため `updateProgress` が呼ばれない
- `isGenerating` フラグが正しく立たず、キャンセルボタン表示ロジックにも影響する可能性

### 優先度

**High** — スキル生成中にUIが進捗を表示できないため、ユーザーは生成中なのか停止しているのか判断できない。

---

## 問題2: キャンセル処理の連動不明（useCancelGeneration）

### 現状コード確認

**フロント側: `useCancelGeneration` フック**

- ファイル: `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`
- 行番号: 15-33

```
export function useCancelGeneration() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const setStage = useSetStreamingStage();

  const startGeneration = useCallback((): AbortSignal => {
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;  // :23
  }, []);

  const cancelGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStage("cancelled");
    // AbortController.abort() で Main Process 側の処理も中断される  // :30コメント
  }, [setStage]);
```

コメント（:30）に「`AbortController.abort()` でメインプロセス側の処理も中断される」と記載されているが、`AbortSignal` がメインプロセスに伝達されるコードは存在しない。

**Preload側**

- `skillCreatorAPI` に `cancelGeneration` / `cancel` メソッドは存在しない（`apps/desktop/src/preload/skill-creator-api.ts` 全体を確認済み）

**メインプロセス側**

- `skillCreatorHandlers.ts` に `SKILL_CREATOR_CANCEL` チャンネルの登録はない
- `AbortSignal` を受け取るハンドラーも存在しない

### 根本原因

`cancelGeneration()` は renderer プロセス内の `AbortController.abort()` を呼び出すだけで、IPC チャンネルを通じてメインプロセスに通知する仕組みが実装されていない。コメントの「メインプロセス側も中断される」は**将来の意図を記したメモであり、現時点では実装されていない**。UI状態（`stage: "cancelled"`）のみが変化し、バックグラウンドでの実際のスキル生成は継続する。

### 影響範囲

- キャンセルボタンを押してもバックグラウンド処理が継続する
- メモリ・CPU を消費し続ける
- 生成完了後にUIが不整合状態になる可能性がある

### 優先度

**High** — キャンセル操作がユーザーの期待する動作を行わない。ただし問題1が解決されない限り進捗通知がないため、実際の影響範囲はUIレベルの表示問題に留まる。

---

## 問題3: SkillCreatorService.ts:126 structurePlan未統合

### 現状コード確認

**ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**createSkill メソッド（:79-232）の switch 文**

- 行番号: 105-126

```typescript
let structurePlan: StructurePlanJson | null = null;

switch (options.mode) {
  case "collaborative":
    await this.runCollaborativeWorkflow(options);
    break;
  case "orchestrate":
    await this.runOrchestrateWorkflow(options);
    break;
  case "create":
    structurePlan = await this.runCreateWorkflow(options);
    // AC-2: runCreateWorkflow 完了後、後続処理が正常に続く
    break;
  // ...
}

void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）  // :126
```

**`runCreateWorkflow` の実装**

- 行番号: 630-653

`resourceLoader.loadAgent("extract-purpose")` と `resourceLoader.loadAgent("plan-structure")` を呼び出して `StructurePlanJson` を構築して返す。ただし `purpose` フィールドに `extractPurposeAgent`（エージェントプロンプト文字列）を直接代入しており、型としては `string`（プロンプト本文）が入っている。

**SKILL.md 生成部分**

- 行番号: 173-218

`structurePlan` を使用せず、独立した `plan` オブジェクト（:180-194）を生成して `generate_skill_md.js` に渡している。`structurePlan` の内容（`features`、`agents`、`purpose` など）は一切使われない。

### 根本原因

`runCreateWorkflow()` で算出した `structurePlan` と、SKILL.md 生成に使う `plan` オブジェクトが完全に分離している。`:126` の `void structurePlan` コメントは「タスクA完了後に接続する」と明記されており、意図的な未実装プレースホルダーである。

### 追加問題: runCreateWorkflow の structurePlan 内容の問題

`structurePlan.purpose` に `extractPurposeAgent`（エージェントプロンプト本文の文字列）が入り、`structurePlan.features` は空配列、`structurePlan.agents` にエージェントプロンプト2本が入る設計は、`StructurePlanJson` インターフェース（:35-43）の意図と乖離している可能性がある。接続前に `runCreateWorkflow` の出力仕様の見直しも必要。

### 影響範囲

- `create` モードで生成されるスキルは、ユーザーのリクエストから算出した構造計画（用途・機能・エージェント構成）を反映しない
- 生成されるSKILL.mdはデフォルトのテンプレートのみで、ユーザー指定の内容が入らない

### 優先度

**High** — `create` モードの核心機能であるLLM支援構造計画が実質的に機能していない。

---

## 問題4: ConversationRoundStep.tsx:456 のTODO（主ツールバッジ削除）

### 現状コード確認

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

- 行番号: 456-489

```typescript
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
const isMainTool = shouldShowMainToolBadge({
  questionKey: key,
  optionValue: opt,
  selectedOptions,
});
```

**`shouldShowMainToolBadge` の実装**（:124-135）

```typescript
const MAIN_TOOL_BADGE_ENABLED = true;

function shouldShowMainToolBadge({
  questionKey,
  optionValue,
  selectedOptions,
}) {
  return (
    MAIN_TOOL_BADGE_ENABLED &&
    questionKey === "q5" &&
    selectedOptions.length >= 2 &&
    selectedOptions[0] === optionValue
  );
}
```

**`resolveExternalIntegration` の現在の実装**

- ファイル: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- 行番号: 177-218

現在の `resolveExternalIntegration` は `q5Answer.selectedOptions[0]` を主ツールとして参照する（:183）。これはバッジの「先頭要素が主ツール」という論理と一致している。

TODOコメントは「`resolveExternalIntegration` の主ツール参照ロジック変更後に削除」と述べているが、現在の `resolveExternalIntegration` は変更されておらず、`shouldShowMainToolBadge` の存在意義が失われる変更も行われていない。

### 根本原因

TODO のトリガー条件「`resolveExternalIntegration` の主ツール参照ロジック変更」が未実施のため、バッジ削除のタイミングが来ていない。ただしTODOの対象タスク `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況が不明。

### 影響範囲

- q5（外部ツール選択）で複数ツールを選択した際、先頭オプションに「主ツール」バッジが表示される
- UIとして機能しており、バグではない
- `resolveExternalIntegration` 変更後にこのバッジが削除されなかった場合、UXの不整合が生じる

### 優先度

**Low** — 現在UIとして正常に機能しており、即座のバグ影響はない。ただし将来の変更時に忘れると不整合になる。

---

## 優先度まとめ

| No  | 問題                       | 優先度 | 理由                                                 |
| --- | -------------------------- | ------ | ---------------------------------------------------- |
| 1   | Streaming進捗の送信元なし  | High   | スキル生成中にUIが進捗を示せない。基本UXの欠落       |
| 2   | キャンセル処理のIPC未接続  | High   | キャンセル操作が実際にバックグラウンド処理を止めない |
| 3   | structurePlan未統合        | High   | createモードの核心機能が実質無効化されている         |
| 4   | ConversationRoundStep TODO | Low    | 現状は機能しているが、将来変更時に削除漏れリスクあり |

問題1と問題3は独立して実装可能だが、問題2は問題1（IPC設計の理解）が必要な文脈を共有するため、問題1の解決後に実施するのが望ましい。
