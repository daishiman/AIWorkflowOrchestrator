# 実装ガイド: Task03 Skill Creator 統合

## Part 1: なぜこの統合が必要か

なぜ必要かというと、もともとの Skill Creator まわりは「作成する入口」「実行する入口」「改善する入口」が別々に見えていて、ユーザーからすると次にどこへ進めばいいかが分かりにくかったからです。

何をしたかというと、`SkillManagementPanel` の中に `SkillLifecyclePanel` を追加し、依頼文を書いたらそのまま作成、実行、改善までつながる一本の導線へまとめました。たとえば教室で「先生に相談する窓口」「宿題を出す窓口」「見直しを頼む窓口」が別々だと混乱しますが、受付を 1 つにすると迷わず進めます。今回の lifecycle も同じ考え方です。

このとき大事なのは、内部で何人の担当が動いていても、ユーザーには受付を 1 つに見せることです。内部では Planner が方針を決め、Executor が動かし、Improver が見直しますが、その役割分担は裏側の都合です。表にボタンを増やしてしまうと、せっかくの単一導線がまた分裂します。

## Part 2: 実装のしかた

### 型定義

```ts
type SkillCreatorMode =
  | "collaborative"
  | "orchestrate"
  | "create"
  | "update"
  | "improve-prompt";

interface SkillLifecycleState {
  request: string;
  detectedMode: SkillCreatorMode | null;
  createdSkillName: string | null;
  executionPrompt: string;
}

interface ImproveResult {
  suggestions: Array<{
    category: string;
    description: string;
    severity: "low" | "medium" | "high";
    autoFixable: boolean;
  }>;
  applied: boolean;
}
```

### APIシグネチャ

- `window.electronAPI.skillCreator.detectMode(request: string): Promise<IpcResult<SkillCreatorMode>>`
- `window.electronAPI.skillCreator.improveSkill(skillName: string, options?: { autoApply?: boolean }): Promise<IpcResult<ImproveResult>>`
- `window.electronAPI.skill.execute({ skillName: string; prompt: string }): Promise<{ executionId: string }>`
- `useCreateSkill(): (description: string, options: { generateTasks: boolean; addAgents: boolean; addReferences: boolean }) => Promise<string>`
- `useExecuteSkill(): (prompt: string) => Promise<void>`

### 実装手順

1. `SkillManagementPanel` に `lifecycle` view を追加する。
2. primary CTA を `ライフサイクルを開始` に切り替える。
3. `SkillLifecyclePanel` で request / create / execute / improve の 3 ステップ UI を組む。
4. mode 判定と改善提案だけ `window.electronAPI.skillCreator.*` を使う。
5. create / execute / analysis は既存 store action と `SkillAnalysisView` をそのまま再利用する。

### 使用例

```ts
const createSkill = useCreateSkill();
const executeSkill = useExecuteSkill();

const resultPath = await createSkill("レビューを支援するスキル", {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
});

if (resultPath) {
  await window.electronAPI.skillCreator.detectMode("レビューを支援するスキル");
  await executeSkill("サンプル入力を処理して");
}
```

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx \
  src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx
```

### エラーハンドリング

- `createSkill()` が失敗したら `skillError` を UI に出す。
- `executeSkill()` が予期せず reject したら `SkillLifecyclePanel` の local error に落とす。
- `improveSkill()` が未接続なら空提案へ落とし、詳細分析へフォールバックする。

### エッジケース

- mode 判定 API がなくても `create` として継続できる。
- 生成前に execute / improve を押した場合は guard で止める。
- wizard が必要なケースでは secondary CTA から詳細設定へ戻れる。

### 設定項目と定数一覧

| 項目                                 | 値                                | 用途                       |
| ------------------------------------ | --------------------------------- | -------------------------- |
| `defaultExecutionPrompt`             | `このスキルの基本動作を確認し...` | 初期実行文                 |
| `defaultCreateOptions.generateTasks` | `true`                            | create 後の task spec 生成 |
| `defaultCreateOptions.addAgents`     | `false`                           | 既存導線に合わせるため     |
| `defaultCreateOptions.addReferences` | `false`                           | 初回導線を軽く保つため     |
