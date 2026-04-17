# Implementation Guide: スキル生成フロー接続品質改善

## Part 1: 概念説明（中学生レベル）

スキル作成の仕組みは、工場のベルトコンベアに例えられます。

画面（renderer）でボタンを押すと、「作ってほしい」という命令が橋（preload）を渡り、工場（main プロセス）に届き、職人（service）が実際に作業します。

今回の改善前は、3つの問題がありました：

1. **進捗が届かない問題**: 職人が作業中に「今どこまで進んでいるか」を橋を通じて画面に伝える仕組みがなかった。画面のプログレスバーが動かなかった。
2. **キャンセルが届かない問題**: 画面で「やめて！」と言っても、橋がなかったので職人には届かず、バックグラウンドで作業が続いてしまっていた。
3. **計画メモの書き方の問題**: create モードで作成する「スキルの設計図」のメモに、間違った情報（職人の指示書そのもの）が入っていた。

たとえば、「配達を頼んだのに、『荷物を届ける手順書』が荷物の中に入ってくる」ようなもの。今回は、手順書ではなく、正しい荷物（スキルの説明）が入るよう修正しました。

今はさらに、画面の「やめて！」が `skill:create` の作業中の職人まで届くようになり、途中で止めたら本当に止まるようになっています。

---

## Part 2: 技術詳細

### 変更サマリー

| タスクID           | 対象ファイル                                                                                                     | 変更内容                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| TASK-SW-STRUCT-001 | `SkillCreatorService.ts`                                                                                         | `runCreateWorkflow` の `purpose`/`agents` フィールドを意味的に正しい値に修正                                  |
| TASK-SW-STREAM-001 | `SkillCreatorService.ts`                                                                                         | `createSkill` にオプショナル進捗コールバック引数を追加                                                        |
| TASK-SW-STREAM-002 | `skillCreatorHandlers.ts`                                                                                        | `SKILL_CREATOR_CREATE` ハンドラーでコールバックを `sendSkillCreatorProgress` に接続                           |
| TASK-SW-CANCEL-001 | `packages/shared/src/ipc/channels.ts`                                                                            | `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` チャンネルを追加                                               |
| TASK-SW-CANCEL-002 | `skill-creator-api.ts`, `preload/channels.ts`                                                                    | Preload API に `cancelGeneration` メソッドと `ALLOWED_INVOKE_CHANNELS` 追加                                   |
| TASK-SW-CANCEL-003 | `SkillCreatorService.ts`, `SkillService.ts`, `skillCreatorHandlers.ts`, `ScriptExecutor.ts`, `ResourceLoader.ts` | `currentAbortController` + `cancelCurrentSkillCreation()` + signal 伝播 + 半作成 cleanup + IPC ハンドラー追加 |
| TASK-SW-CANCEL-004 | `useCancelGeneration.ts`, `SkillCreateWizard.tsx`                                                                | `cancelGeneration` を async 化し IPC 経由でキャンセルを送信                                                   |
| TASK-SW-TODO-001   | `ConversationRoundStep.tsx`                                                                                      | TODO コメントを具体的な削除条件の NOTE に書き換え                                                             |

---

### TASK-SW-STRUCT-001: `runCreateWorkflow` 出力仕様修正

**変更ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

変更前:

```typescript
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: extractPurposeAgent, // エージェントプロンプト文字列（誤り）
  features: [],
  agents: [extractPurposeAgent, planStructureAgent], // プロンプト文字列（誤り）
};
```

変更後:

```typescript
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: options.description, // LLM推論は将来タスク。現状はdescriptionをpurposeとして使用
  features: [],
  agents: ["extract-purpose", "plan-structure"], // エージェント名リスト
};
void extractPurposeAgent;
void planStructureAgent;
```

---

### TASK-SW-STREAM-001: `createSkill` オプショナル進捗コールバック追加

**変更ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

```typescript
// 変更前
async createSkill(options: CreateSkillOptions): Promise<string>

// 変更後
async createSkill(
  options: CreateSkillOptions,
  onProgress?: (progress: { phase: string; percentage: number; message: string }) => void,
): Promise<string>
```

各フェーズでの通知:

- `planning / 10%` — スキル構造を計画しています
- `generating-skill / 40%` — スキルを初期化しています
- `generating-skill-md / 70%` — SKILL.md を生成しています
- `validating / 90%` — スキルを検証しています
- `done / 100%` — 完了しました

---

### TASK-SW-STREAM-002: ハンドラーでコールバックを接続

**変更ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

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

---

### TASK-SW-CANCEL-001〜004: IPC キャンセル接続

**接続フロー**:

```
renderer: cancelGeneration() → async → window.skillCreatorAPI.cancelGeneration()
  ↓ Preload (skill-creator-api.ts)
  safeInvoke("skill-creator:cancel")
  ↓ Main (skillCreatorHandlers.ts)
  ipcMain.handle("skill-creator:cancel", ...)
  ↓ SkillService
  cancelCurrentSkillCreation() → active createSkill を停止
  ↓ SkillCreatorService
  cancelCurrentOperation() → currentAbortController.abort()
  ↓ ScriptExecutor / ResourceLoader
  AbortSignal を受けて child process / file read を中断
  └─ 新規作成した半作成 skillDir を削除（既存ディレクトリは保持）
```

**追加した定数**:

```typescript
// packages/shared/src/ipc/channels.ts
SKILL_CREATOR_CANCEL: "skill-creator:cancel";
```

**登録・解除の対**:

```typescript
// 登録: registerSkillCreatorHandlers()
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_CANCEL, ...)

// 解除: unregisterSkillCreatorHandlers()
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CANCEL)
```

**視覚証跡の再利用**:

この修正は UI 描画の変更ではないため、新規スクリーンショットは不要でした。既存の Phase 11 証跡を参照します。

- `outputs/phase-11/screenshots/step-0-no-radio.png`
- `outputs/phase-11/screenshots/step-1-conversation.png`
- `outputs/phase-11/screenshots/step-1-questions.png`
- `outputs/phase-11/screenshots/step-2-generating.png`
- `outputs/phase-11/screenshots/step-3-complete.png`
- `outputs/phase-11/screenshot-coverage.md`
- `outputs/phase-11/phase11-capture-metadata.json`

---

### TASK-SW-TODO-001: ConversationRoundStep NOTE 更新

**変更ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

```typescript
// 変更前
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除

// 変更後
// NOTE: 主ツールバッジは resolveExternalIntegration が selectedOptions[0] 以外の選択方式を採用するまで維持する。
// 削除条件: resolveExternalIntegration の主ツール参照ロジックが変更された時点で
//   shouldShowMainToolBadge / MAIN_TOOL_BADGE_ENABLED を削除し、バッジ表示を直接実装に変更する。
```

---

### テスト結果

| テストファイル                            | テスト数 | 結果       |
| ----------------------------------------- | -------- | ---------- |
| `ScriptExecutor.test.ts`                  | 10       | 全通過     |
| `SkillCreatorService.test.ts`             | 84       | 全通過     |
| `SkillService.test.ts`                    | 39       | 全通過     |
| `skillCreatorHandlers.validation.test.ts` | 47       | 全通過     |
| `useCancelGeneration.test.ts`             | 4        | 全通過     |
| `SkillCreateWizard.test.tsx`              | 41       | 全通過     |
| **合計**                                  | **225**  | **全通過** |

---

### 影響範囲

- **変更あり**: `SkillCreatorService.createSkill` シグネチャ（後方互換: コールバックはオプショナル）
- **変更あり**: `SkillCreatorService.createSkill` のキャンセル時に半作成ディレクトリを削除するクリーンアップ
- **変更なし**: `useStreamingProgress.ts`（既に正しく実装済み）
- **変更なし**: `GenerateStep.tsx`（既に `streaming` 変数と接続済み）
- **型安全**: `SkillCreatorAPI` インターフェースに `cancelGeneration` を追加したため型定義ファイルへ自動伝播

---

### 未タスク（スコープ外・将来対応）

| 項目                                            | 理由                                                     |
| ----------------------------------------------- | -------------------------------------------------------- |
| ~~キャンセル後の半作成ディレクトリ削除~~        | ~~実装済み（abort 時のみ新規 skillDir を削除）~~         |
| LLM 呼び出しによる実際の `purpose` 抽出         | リスク2（Phase 2設計書）として識別済み                   |
| ~~`AbortSignal` の `createSkill` 内部への伝播~~ | ~~実装済み（ScriptExecutor / ResourceLoader まで伝播）~~ |
