# Phase 2: 解決策設計

Phase 1 の現状分析を踏まえ、各問題の解決アプローチ・タスク分解案・並列実行可否・リスクを記述する。

---

## 問題1 解決策: Streaming進捗をメインプロセスから実際に送信する

### 現状の欠陥

`sendSkillCreatorProgress()` は `apps/desktop/src/main/ipc/skillCreatorHandlers.ts:692-703` にエクスポートされているが、呼び出し元が存在しない。`SKILL_CREATOR_CREATE` ハンドラー（:276）は `skillCreatorService.createSkill()` を呼ぶだけで進捗通知を送らない。

### 解決アプローチ

**A. SkillCreatorService にコールバック注入インターフェースを追加する**

`createSkill()` の引数または `SkillCreatorService` コンストラクタに、進捗コールバック型を追加する。

```typescript
// SkillCreatorService.ts の createSkill シグネチャ変更案
async createSkill(
  options: CreateSkillOptions,
  onProgress?: (progress: { phase: string; percentage: number; message: string }) => void,
): Promise<string>
```

処理の節目でコールバックを呼び出す:

- `runCreateWorkflow` 開始時: `{ phase: "planning", percentage: 10, message: "構造を計画しています" }`
- SKILL.md 生成開始時: `{ phase: "generating-skill", percentage: 40, message: "SKILL.md を生成しています" }`
- エージェント定義生成時: `{ phase: "generating-agents", percentage: 70, message: "エージェント定義を生成しています" }`
- 検証開始時: `{ phase: "validating", percentage: 90, message: "スキルを検証しています" }`
- 完了時: `{ phase: "done", percentage: 100, message: "完了しました" }`

**B. SKILL_CREATOR_CREATE ハンドラーでコールバックを接続する**

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts:276` の呼び出し箇所を変更する:

```typescript
// 変更前
const skillDir = await skillCreatorService.createSkill(validatedArgs);

// 変更後
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

**C. フロント側は変更不要**

`useStreamingProgress.ts` はすでに正しく実装されている。`window.skillCreatorAPI.onProgress` → Preload `safeOn` → IPC `SKILL_CREATOR_PROGRESS` のパスは完成している。メインプロセスからの `send()` が届けば即座に動作する。

### タスク分割案

| タスクID           | 内容                                                                                    | ファイル                                                      |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| TASK-SW-STREAM-001 | `SkillCreatorService.createSkill` にコールバック引数を追加し、処理の各段階で呼び出す    | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` |
| TASK-SW-STREAM-002 | `SKILL_CREATOR_CREATE` ハンドラーでコールバックを `sendSkillCreatorProgress` に接続する | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`           |

TASK-SW-STREAM-001 → TASK-SW-STREAM-002 の順で実施（直列）。

実行時の write surface 注意:

- `TASK-SW-STREAM-001` は `SkillCreatorService.ts` の共有書き込み面を更新するため、同一ファイルを更新する `TASK-SW-STRUCT-001` / `TASK-SW-STRUCT-002` / `TASK-SW-CANCEL-003` とは並列に流さず直列化する
- `TASK-SW-STREAM-002` は `skillCreatorHandlers.ts` の共有書き込み面を更新するため、同一ファイルを更新する `TASK-SW-CANCEL-003` とは並列に流さず直列化する
- 実装ワーカーを分ける場合も、`SkillCreatorService.ts` 系は同一ワーカーに束ねるか、少なくとも `STREAM-001 → STRUCT-001 → STRUCT-002 → CANCEL-003` の順で排他実行する
- `skillCreatorHandlers.ts` 系は `STREAM-002` と `CANCEL-003` を同一ワーカーにまとめると競合を避けやすい

---

## 問題2 解決策: キャンセル処理をIPC経由でメインプロセスに伝達する

### 現状の欠陥

`useCancelGeneration.ts:24-31` の `cancelGeneration()` は renderer 内の `AbortController.abort()` を呼ぶだけ。IPC チャンネルへの通知がなく、メインプロセスの処理は継続する。`SKILL_CREATOR_CANCEL` チャンネルは `channels.ts` に存在しない。

### 解決アプローチ

**A. キャンセル IPC チャンネルを追加する**

`packages/shared/src/ipc/channels.ts:196` 付近の `SKILL_CREATOR_RUNTIME_CHANNELS` に追加する:

```typescript
SKILL_CREATOR_CANCEL: "skill-creator:cancel",
```

`apps/desktop/src/preload/channels.ts` 側は `SKILL_CREATOR_RUNTIME_CHANNELS` をスプレッドしているため自動で有効になる。

**B. Preload の skillCreatorAPI にキャンセルメソッドを追加する**

`apps/desktop/src/preload/skill-creator-api.ts` の `SkillCreatorAPI` インターフェース（:69-391）に追加:

```typescript
cancelGeneration: () => Promise<IpcResult<void>>;
```

実装:

```typescript
cancelGeneration: (): Promise<IpcResult<void>> =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL),
```

`ALLOWED_INVOKE_CHANNELS`（`apps/desktop/src/preload/channels.ts`）への追加も必要。

**C. メインプロセスにキャンセルハンドラーを追加する**

`apps/desktop/src/main/services/skill/SkillCreatorService.ts` にアクティブな処理を中断するフラグまたは `AbortController` を管理するプロパティを追加する:

```typescript
private currentAbortController: AbortController | null = null;
```

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts` にハンドラーを追加:

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_CANCEL, async () => {
  skillCreatorService.cancelCurrentOperation();
  return { success: true };
});
```

**D. useCancelGeneration を更新する**

`apps/desktop/src/renderer/hooks/useCancelGeneration.ts:24-31` の `cancelGeneration` で IPC を呼び出す:

```typescript
const cancelGeneration = useCallback(async () => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStage("cancelled");
  await window.skillCreatorAPI?.cancelGeneration?.();
}, [setStage]);
```

### タスク分割案

| タスクID           | 内容                                                                         | ファイル                                                                                 |
| ------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| TASK-SW-CANCEL-001 | `SKILL_CREATOR_CANCEL` チャンネルを shared IPC channels に追加               | `packages/shared/src/ipc/channels.ts`                                                    |
| TASK-SW-CANCEL-002 | Preload `skillCreatorAPI` に `cancelGeneration` メソッドを追加               | `apps/desktop/src/preload/skill-creator-api.ts`                                          |
| TASK-SW-CANCEL-003 | `SkillCreatorService` にキャンセルフラグを追加、メインプロセスハンドラー実装 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`, `skillCreatorHandlers.ts` |
| TASK-SW-CANCEL-004 | `useCancelGeneration` を更新して IPC 経由でキャンセルを送信                  | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                                 |

TASK-SW-CANCEL-001 → TASK-SW-CANCEL-002 → TASK-SW-CANCEL-003 → TASK-SW-CANCEL-004 の順（直列）。`TASK-SW-CANCEL-001` / `TASK-SW-CANCEL-002` は `SkillCreatorService.ts` / `skillCreatorHandlers.ts` に触れないため問題1・3の共有書き込み面と独立して並列候補にできるが、`TASK-SW-CANCEL-003` は `SkillCreatorService.ts` と `skillCreatorHandlers.ts` の両方を共有するため `TASK-SW-STREAM-001` / `TASK-SW-STREAM-002` / `TASK-SW-STRUCT-001` / `TASK-SW-STRUCT-002` と直列化が必要。

### スコープ補足

- `TASK-SW-CANCEL-003` には `unregisterSkillCreatorHandlers()` の `SKILL_CREATOR_CANCEL` `removeHandler` 追加を含める。
- `TASK-SW-CANCEL-003` 着手前に `useCancelGeneration.startGeneration()` の戻り値 `AbortSignal` がどこで消費されているかを確認し、必要なら `TASK-SW-CANCEL-004` の責務境界を調整する。
- 上記は新しいタスクIDを増やすためではなく、CANCEL-003 の実装前確認として固定する。

---

## 問題3 解決策: structurePlan を generate_skill_md.js に統合する

### 現状の欠陥

`apps/desktop/src/main/services/skill/SkillCreatorService.ts:112-123` の `structurePlan` 分岐で create モードの計画結果を破棄している。SKILL.md生成（:178-183）は `structurePlan` と無関係な固定の `plan` オブジェクトを使用している。

加えて `runCreateWorkflow()`:613-630 の実装に問題がある:

- `structurePlan.purpose` に `extractPurposeAgent`（エージェントプロンプト文字列）を代入しているため、意味的に誤り
- `structurePlan.features` が空配列
- `structurePlan.agents` にプロンプト文字列2本が入る

### 解決アプローチ

**A. runCreateWorkflow の出力仕様を修正する**

`StructurePlanJson` インターフェース（:35-43）の意図に合わせて `runCreateWorkflow` を修正する:

```typescript
// 現状（:613-630）
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: extractPurposeAgent, // エージェントプロンプト文字列（誤り）
  features: [], // 空（機能未抽出）
  agents: [extractPurposeAgent, planStructureAgent], // プロンプト文字列（誤り）
};
```

修正方針:

- `extractPurposeAgent` はプロンプトテンプレートであり、実際の `purpose` 抽出にはLLM呼び出しが必要
- 現時点でLLMを呼び出さない場合は `options.description` を `purpose` に使用し、`agents` はエージェント名文字列リストに変更する
- もしくは `runCreateWorkflow` 内でLLM呼び出しを行う（将来タスク）

**B. `void structurePlan` をSKILL.md生成に接続する**

`apps/desktop/src/main/services/skill/SkillCreatorService.ts:112-123` の `structurePlan` 分岐を削除し、SKILL.md 生成の `plan` オブジェクト（:178-183）を `structurePlan` の内容で置き換える:

```typescript
// :112-123 の structurePlan 分岐を削除
// :178-183 の plan を structurePlan ベースに変更
const plan = structurePlan
  ? {
      skillName: structurePlan.skillName,
      workflow: {
        summary: structurePlan.description,
        anchors: structurePlan.anchors ?? [],
        trigger: {
          description: structurePlan.purpose,
          keywords: [structurePlan.skillName],
        },
        phases: [],
        tasks: [],
      },
      directories: {},
      files: [],
    }
  : {
      // フォールバック（create以外のモード用）
      skillName: options.name,
      workflow: {
        summary: options.description,
        anchors: [],
        trigger: {
          description: `Use when ${options.name} is requested`,
          keywords: [options.name],
        },
        phases: [],
        tasks: [],
      },
      directories: {},
      files: [],
    };
```

### タスク分割案

| タスクID           | 内容                                                                            | ファイル                                                      |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| TASK-SW-STRUCT-001 | `runCreateWorkflow` の出力仕様を修正（purpose/agents フィールドの正しい値設定） | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` |
| TASK-SW-STRUCT-002 | `void structurePlan` を削除し、SKILL.md生成に `structurePlan` の内容を接続する  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` |

TASK-SW-STRUCT-001 → TASK-SW-STRUCT-002 の順（直列）。ただし両タスクは `SkillCreatorService.ts` の共有書き込み面を更新するため、`TASK-SW-STREAM-001` と `TASK-SW-CANCEL-003` とは独立ではなく、同一ワーカーにまとめるか直列化して実施する。`TASK-SW-CANCEL-001` / `TASK-SW-CANCEL-002` / `TASK-SW-CANCEL-004` / `TASK-SW-TODO-001` とは並列候補として維持できる。

---

## 問題4 解決策: ConversationRoundStep TODOを解消する

### 現状の欠陥

`apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx:456-457` の TODO は `resolveExternalIntegration` の主ツール参照ロジック変更後にバッジを削除する意図。現在 `resolveExternalIntegration`（`SkillCreateWizard.tsx:177-218`）は `selectedOptions[0]` を主ツールとして参照しており、バッジロジックと一致している。

### 解決アプローチ

**オプション A: タスクIDが指す変更が「不要と判断された」場合（推奨）**

- `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況を確認
- 変更が不要と判断されたなら TODO コメントを削除し、バッジを恒久的に維持する
- `MAIN_TOOL_BADGE_ENABLED = true`（:116）フラグを削除して直接 `true` を埋め込む

**オプション B: 将来の変更を前提に TODO を整理する**

- TODO コメントを具体的な条件に書き換えてトレーサビリティを確保する
- `shouldShowMainToolBadge` の削除は `resolveExternalIntegration` の変更タスクの一部として追跡する

### タスク分割案

| タスクID         | 内容                                                                          | ファイル                                                                      |
| ---------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| TASK-SW-TODO-001 | `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況確認 + TODO コメント整理 | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` |

他の問題タスクと完全に独立。低優先度のため最後に実施。

---

## タスク分解全体像と並列実施可否

```
独立グループA（並列可）:
  TASK-SW-STREAM-001
  TASK-SW-STREAM-002（STREAM-001完了後）

独立グループB（並列可）:
  TASK-SW-CANCEL-001
  TASK-SW-CANCEL-002（CANCEL-001完了後）
  TASK-SW-CANCEL-003（CANCEL-002完了後）
  TASK-SW-CANCEL-004（CANCEL-003完了後）

独立グループC（並列可）:
  TASK-SW-STRUCT-001
  TASK-SW-STRUCT-002（STRUCT-001完了後）

独立グループD（並列可）:
  TASK-SW-TODO-001

グループ間の依存:
  A・B・C・D は相互に独立（同時並行実施可）
  ただし B は A 完了後が望ましい（IPC設計の理解が必要なため）
```

---

## リスクと制約

### リスク1: SkillCreatorService のインターフェース変更の影響範囲

`createSkill()` シグネチャに引数を追加する場合、テストコードとモックを更新する必要がある。

- 影響ファイル: `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts`、`apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts` など
- 軽減策: コールバック引数をオプショナル（`?:`）にしてデフォルト値を `undefined` とする

### リスク2: runCreateWorkflow のLLM呼び出し要否

`structurePlan.purpose` に実際のLLM推論結果を入れるには、`runCreateWorkflow` 内でLLM呼び出しが必要。現状は `loadAgent` でプロンプトテンプレートを読み込むだけでLLMを呼び出していない。TASK-SW-STRUCT-001 のスコープをどこまでとするか（テンプレートベースで固定値を設定するか、LLM呼び出しまで含めるか）を事前に決定する必要がある。

- 軽減策: TASK-SW-STRUCT-001 は `options.description` を `purpose` に使用する最小実装にとどめ、LLM統合は別タスクとして分離する

### リスク3: キャンセル中の状態整合性

`SkillCreatorService.cancelCurrentOperation()` がキャンセルされた後、`createSkill()` が途中で返した場合にスキルディレクトリが半作成状態になる可能性がある。

- 軽減策: キャンセル時には不完全なスキルディレクトリを削除するクリーンアップ処理を追加する、または `cancelled` 状態を明示的に返してIPCハンドラー側でクリーンアップする

### 制約

- コードの実装は本設計書のスコープ外（Phase 4 以降）
- `generate_skill_md.js` スクリプト（`ScriptExecutor` 経由で呼び出す外部スクリプト）の仕様変更は本設計では前提としない
