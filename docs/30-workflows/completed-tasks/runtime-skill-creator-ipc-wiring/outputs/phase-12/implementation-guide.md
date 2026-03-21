# Runtime Skill Creator IPC Wiring 実装ガイド

## Part 1: 中学生でも追える説明

### なぜ必要だったか

お店に例えると、「相談する」「実行する」「改善を頼む」の3つの窓口があるのに、前は裏口からしか入れませんでした。  
正面の受付は `skill-creator:*`、裏口は一時的な runtime helper です。裏口だけが増えると、
使う人は入口を間違えやすく、見張りもバラバラになります。

だから今回やったことは、「入口は正面のまま、中の担当者だけを差し替える」整理です。

### 何をしたか

1. `skill-creator:plan` / `skill-creator:execute-plan` / `skill-creator:improve-skill` を正面入口に追加した
2. `channels.ts`、Preload API、Main IPC、shared types の4層を同時にそろえた
3. 担当者が不在でも「現在利用できません」と決まった返事を返すようにした
4. エラー文からパスや秘密情報を消して、安全な言葉だけを返すようにした

### 用語の言い換え

| 用語                 | 日常語         | 意味                                       |
| -------------------- | -------------- | ------------------------------------------ |
| IPC                  | 部署間の連絡   | 画面とアプリ本体が話す仕組み               |
| Preload              | 受付           | 画面が安全に使える窓口                     |
| shared types         | 共通の書式     | 両方が同じ形式で話すための約束             |
| graceful degradation | 丁寧な代替対応 | 担当者がいなくても一定の返答を返すこと     |
| terminal handoff     | 手動引き継ぎ   | 自動で進められない時にターミナルへ渡すこと |

## Part 2: 開発者向け実装詳細

### 主要変更ファイル

| 区分     | ファイル                                                              | 変更内容                                                                         |
| -------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Main IPC | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | runtime public 3 チャンネルの handler 追加、sender validation、degraded response |
| Main IPC | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                   | 既存 `skill-creator:*` entrypoint から runtime helper を登録                     |
| Main IPC | `apps/desktop/src/main/ipc/index.ts`                                  | `RuntimeSkillCreatorFacade` を optional DI                                       |
| Main IPC | `apps/desktop/src/main/ipc/skillHandlers.ts`                          | `getSkillExecutorInstance()` export                                              |
| Preload  | `apps/desktop/src/preload/channels.ts`                                | 3 チャンネル定数と allowlist 追加                                                |
| Preload  | `apps/desktop/src/preload/skill-creator-api.ts`                       | `planSkill` / `executePlan` / `improveSkillWithFeedback` 追加                    |
| Runtime  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | shared contract 型へ寄せ、stored key fallback を追加                             |
| Runtime  | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`     | `TerminalHandoffBundle` を shared contract へ統一                                |
| Runtime  | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`    | shared `TerminalHandoffBundle` を参照                                            |
| Shared   | `packages/shared/src/types/skillCreator.ts`                           | request/response と handoff bundle を公開 contract 化                            |
| Shared   | `packages/shared/src/types/index.ts`                                  | runtime contract export を追加                                                   |

### API シグネチャ

```ts
type IpcResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type SkillCreatorPlanRequest = {
  prompt: string;
  authMode?: AuthMode;
  apiKey?: string | null;
};

type SkillCreatorExecutePlanRequest = {
  planId: string;
  skillSpec: string;
  authMode?: AuthMode;
  apiKey?: string | null;
};

type SkillCreatorImproveSkillRequest = {
  skillName: string;
  feedback: string;
  authMode?: AuthMode;
  apiKey?: string | null;
};
```

### 使用例

```ts
const planResult = await window.electronAPI.skillCreator.planSkill(
  "TypeScript でスキルを作りたい",
  "api-key",
  null,
);

if (!planResult.success) {
  throw new Error(planResult.error);
}

if (planResult.data.type === "terminal_handoff") {
  console.log(planResult.data.bundle.suggestedCommand);
} else {
  const executeResult = await window.electronAPI.skillCreator.executePlan(
    planResult.data.planId,
    planResult.data.skillSpec,
    "api-key",
    null,
  );
  console.log(executeResult);
}
```

### セキュリティとエラーハンドリング

- `validateIpcSender(event, channel, { getAllowedWindows })` を全 3 handler で適用する
- P42 3段バリデーションを `isBlank()` で統一する
- runtime service 不在時は `Runtime Skill Creator は現在利用できません` を返す
- 例外時は `sanitizeErrorMessage()` で path / token / stack を削った文字列だけ返す

```ts
function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value === "" || value.trim() === "";
}

const RUNTIME_SKILL_CREATOR_UNAVAILABLE =
  "Runtime Skill Creator は現在利用できません";
```

### エッジケース

| ケース                                                            | 挙動                                               |
| ----------------------------------------------------------------- | -------------------------------------------------- |
| `prompt` / `planId` / `skillSpec` / `skillName` / `feedback` が空 | `{ success: false, error: string }` を返す         |
| `authMode === "api-key"` かつ `apiKey === null`                   | stored key を `resolveWithService()` で参照する    |
| stored key も無い                                                 | `terminal_handoff` を返す                          |
| `RuntimeSkillCreatorFacade` 未注入                                | degraded response を返し、channel missing にしない |
| `unregisterAllIpcHandlers()` 実行                                 | runtime 3 チャンネルも対称に remove される         |

### 設定と定数

| 項目                | 値 / 既定値                                           | 説明                                           |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| `authMode`          | 既定値 `"api-key"`                                    | 呼び出し側が省略した場合に使用                 |
| `apiKey`            | 既定値 `null`                                         | `null` の時だけ stored key fallback を試す     |
| `estimatedSteps`    | 固定値 `3`                                            | public execute bridge で組み立てる暫定 step 数 |
| unavailable message | 固定値 `"Runtime Skill Creator は現在利用できません"` | graceful degradation の返答                    |
| error envelope      | `IpcResult<T>`                                        | success/data または success=false/error の二択 |

### 定数一覧

| 定数                                | 値                                             | 用途                         |
| ----------------------------------- | ---------------------------------------------- | ---------------------------- |
| `SKILL_CREATOR_PLAN`                | `"skill-creator:plan"`                         | runtime plan 作成 channel    |
| `SKILL_CREATOR_EXECUTE_PLAN`        | `"skill-creator:execute-plan"`                 | runtime execute channel      |
| `SKILL_CREATOR_IMPROVE_SKILL`       | `"skill-creator:improve-skill"`                | runtime improve channel      |
| `RUNTIME_SKILL_CREATOR_UNAVAILABLE` | `"Runtime Skill Creator は現在利用できません"` | degraded response の固定文言 |

### シーケンス

1. Renderer が `skillCreatorAPI.planSkill()` を呼ぶ
2. Preload が `safeInvoke()` で allowlist を通す
3. Main の `creatorHandlers.ts` が sender validation と blank check を行う
4. `RuntimeSkillCreatorFacade` が `resolveDecision()` で integrated API / terminal handoff を決める
5. 成功時は shared contract、失敗時は sanitize 済み error を返す
