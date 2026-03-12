# 実装ガイド

## Part 1: 初学者向け

### なぜ必要か

今までの Skill Creator は「作る画面」「実行する画面」「改善する画面」が少し離れて見えやすく、初めて使う人ほど次に何を押せばよいか迷いやすかったからです。たとえば、駅の券売機と乗り換え案内が別の場所にあるより、同じ場所で切符を買って、そのまま次の案内が見えた方が迷いにくいのと同じです。

### 何をするか

この機能でできることは、その「次にやること」を 1 枚のカードにまとめることです。上で作りたい内容を書き、すぐ下で作成し、結果を見ながらそのまま実行や改善へ進めるようにしました。細かい設定が必要な人のための wizard は残しつつ、ふだんは前に出しすぎないようにしています。

## Part 2: 開発者向け

### 追加した契約

- `SkillManagementPanel` list view の先頭に `SkillLifecycleSessionCard` を追加
- create 後に skill path から name を抽出し、`selectSkillByName()` へ handoff
- `window.electronAPI.skillCreator.detectMode()` を mode hint、`validateSkill()` を non-blocking validation に利用
- lifecycle 系の success / error は session card 内で閉じ、panel global error は import / list 管理系に限定

### TypeScript 型定義

```ts
type ModeStatus = "idle" | "loading" | "ready" | "error";

interface SkillLifecycleSessionCardProps {
  onOpenCreateWizard: () => void;
}

interface SkillCreatorAPI {
  detectMode: (request: string) => Promise<{ success: boolean; data?: string }>;
  validateSkill: (
    skillDir: string,
  ) => Promise<{ success: boolean; data?: boolean }>;
}

const DEFAULT_CREATE_OPTIONS = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
} as const;
```

### APIシグネチャ / Hookシグネチャ

- `useCreateSkill(): (description: string, options: { generateTasks: boolean; addAgents: boolean; addReferences: boolean }) => Promise<string | null>`
- `useExecuteSkill(): (prompt: string) => Promise<void>`
- `useAnalyzeSkill(): (skillName: SkillName) => Promise<void>`
- `useAutoImproveSkill(): (skillName: SkillName) => Promise<void>`
- `window.electronAPI.skillCreator.detectMode(request: string): Promise<{ success: boolean; data?: string }>`
- `window.electronAPI.skillCreator.validateSkill(skillDir: string): Promise<{ success: boolean; data?: boolean }>`

### 使用例

```ts
const skillPath = await createSkill(trimmedPrompt, DEFAULT_CREATE_OPTIONS);
if (!skillPath) return;

const nextSkillName = extractSkillNameFromPath(skillPath);
if (nextSkillName) {
  selectSkillByName(nextSkillName as SkillName);
}

await executeSkill(trimmedPrompt);
await autoImproveSkill(nextSkillName as SkillName);
```

### 適用箇所

- `apps/desktop/src/renderer/components/skill/SkillLifecycleSessionCard.tsx`
- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`
- `apps/desktop/src/renderer/components/skill/skillButtonStyles.ts`
- `apps/desktop/src/renderer/phase11-skill-management-panel.tsx`
- `apps/desktop/scripts/capture-task-skill-creator-lifecycle-phase11.mjs`

### エラーハンドリング

- prompt が空なら create を無効化し、noop で終える
- `detectMode()` が失敗しても create 自体は止めず、mode hint だけ `判定できませんでした` に落とす
- `validateSkill()` は non-blocking で、失敗時も `検証を完了できませんでした` を表示して session を継続させる
- lifecycle 由来の失敗は session card 側に残し、`shouldShowGlobalSkillError()` で panel global alert への重複表示を防ぐ

### エッジケース

- create 結果 path の末尾から skill name を抽出できない場合は、汎用 success message へフォールバック
- create success banner が execute / analyze / auto improve で stale にならないよう、各 action 開始時に `setSessionMessage(null)` を実行する
- `createdSkillName` が無い場合は `selectedSkillName` を active skill として再利用する
- wizard は削除せず supporting route として維持し、一次導線の代替にはしない

### 設定項目と定数一覧

| 項目                                   | 値                         | 役割                              |
| -------------------------------------- | -------------------------- | --------------------------------- |
| `DEFAULT_CREATE_OPTIONS.generateTasks` | `true`                     | task 仕様書生成を既定で有効化     |
| `DEFAULT_CREATE_OPTIONS.addAgents`     | `false`                    | session card では詳細設定を簡素化 |
| `DEFAULT_CREATE_OPTIONS.addReferences` | `false`                    | session card では詳細設定を簡素化 |
| `ModeStatus`                           | `idle/loading/ready/error` | mode hint の UI 状態              |
| `buttonStyles.primary`                 | primary filled button      | 一次アクションの見え方を統一      |
| `buttonStyles.secondary`               | bordered secondary button  | 補助アクションの見え方を統一      |
