# implementation-guide

## Part 1: 中学生でもわかる説明

### 1. skill-creatorって何？

`skill-creator` は「作業を手伝うロボットを作るロボット」です。
やりたいこと（例: Slack通知を自動化したい）を伝えると、必要な設定や手順をまとめたスキルを作ってくれます。

### 2. なぜ必要？

毎回ゼロから手順を書くと時間がかかり、ミスも増えます。
`skill-creator` を使うと、同じ作業を早く・安全に・同じ品質で繰り返せます。

### 3. どう動く？

- 画面側（Renderer）が「この作業をして」と依頼する
- 裏側（Main Process）が実際の処理をする
- 結果を画面に返す

これは「注文票」を渡して厨房で料理してもらう流れに近いです。

### 4. 安全対策

- 空文字やスペースだけの入力は拒否する
- 危ない文字列（不正なパスなど）を拒否する
- 内部エラーの詳細をそのまま画面へ出さない

## Part 2: 開発者向け技術詳細

## 1. 主要コンポーネント

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/HearingFacilitator.ts`
- `apps/desktop/src/main/services/skill/TaskGenerator.ts`
- `apps/desktop/src/main/services/skill/CodeGenerator.ts`
- `apps/desktop/src/main/services/skill/ApiIntegrator.ts`
- `apps/desktop/src/main/services/skill/SkillValidator.ts`
- `apps/desktop/src/main/services/skill/constants.ts`

## 2. 型定義（TypeScript）

```ts
export interface CreateSkillOptions {
  name: string;
  description: string;
  mode: SkillCreatorMode;
  executionEngine?: ExecutionEngine;
}

export interface ExecuteTasksOptions {
  tasksDir: string;
  parallel?: boolean;
  dryRun?: boolean;
  maxTurns?: number;
}
```

型定義本体:

- `packages/shared/src/types/skillCreator.ts`
- `packages/shared/src/types/index.ts`

## 3. IPC APIシグネチャ（抜粋）

```ts
// Preload
improveSkill(skillName: string, options?: object)
forkSkill(sourceName: string, newName: string)
shareSkill(skillName: string, format: string)
scheduleSkill(skillName: string, schedule: object)
debugSkill(skillName: string, options?: object)
generateDocs(skillName: string)
getStats(skillName?: string)
```

実装先:

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/preload/channels.ts`

## 4. エラーハンドリングとエッジケース

- P42 3段バリデーション: `typeof` → `=== ""` → `.trim() === ""`
- `validateIpcSender` で送信元検証
- `sanitizeErrorMessage` で内部情報をマスク
- 空入力 / 空白入力 / 不正パス / 実行時例外をテスト

関連テスト:

- `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/ApiIntegrator.test.ts`

## 5. 設定可能パラメータと定数

- `MAX_SKILL_NAME_LENGTH = 256` (`constants.ts`)
- `TASK_DURATION_MINUTES = 5` (`constants.ts`)
- `DEFAULT_SKILL_CREATOR_PATH` / `DEFAULT_SKILLS_DIR` / `DEFAULT_WORKFLOWS_DIR`
