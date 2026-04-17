# Phase 12 成果物: 実装ガイド

## タスクID: TASK-SW-STREAM-001

## 1. 変更概要

`SkillCreatorService.createSkill(options, onProgress?)` に progress callback を追加し、main process 内の生成処理を 5 段階で通知できるようにした。`onProgress` は optional のため、既存の呼び出しは壊れない。

## 2. 使い方

```ts
import { SkillCreatorService } from "./SkillCreatorService";
import type { CreateSkillOptions } from "@repo/shared/types";

const service = new SkillCreatorService();

const options: CreateSkillOptions = {
  name: "my-skill",
  description: "Skill description",
  mode: "create",
};

const skillDir = await service.createSkill(options, (progress) => {
  console.log(
    `[${progress.phase}] ${progress.percentage}% ${progress.message}`,
  );
});
```

- `onProgress` を省略しても `createSkill(options)` は動作する。
- コールバック例外は握りつぶさず、そのまま呼び出し元へ伝播する。
- `SkillCreatorProgressData` は現状 `SkillCreatorService.ts` 内に local 定義している。

## 3. 型定義

```ts
type SkillCreatorProgressData = {
  phase: string;
  percentage: number;
  message: string;
};

type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;
```

- `phase`: 進捗段階名
- `percentage`: 0-100 の進捗率
- `message`: UI/ログ向けの短い説明文

## 4. 5段階の progress

| 順序 | phase               | percentage | message                            | 呼び出しタイミング           |
| ---- | ------------------- | ---------- | ---------------------------------- | ---------------------------- |
| 1    | `planning`          | 10         | `構造を計画しています`             | モード別ワークフローへ入る前 |
| 2    | `generating-skill`  | 40         | `SKILL.md を生成しています`        | SKILL.md 生成開始直前        |
| 3    | `generating-agents` | 70         | `エージェント定義を生成しています` | タスク仕様書生成前           |
| 4    | `validating`        | 90         | `スキルを検証しています`           | validateSkill 実行直前       |
| 5    | `done`              | 100        | `完了しました`                     | 成功終了直前                 |

## 5. TASK-SW-STREAM-002 への接続準備

- 次タスクでは `skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラーから `createSkill(validatedArgs, onProgress)` を呼ぶ。
- `onProgress` の中で `sendSkillCreatorProgress(mainWindow, progress)` を実行する。
- `SkillCreatorProgressData` を shared 側へ移す場合は、main/renderer の両方で使う型として別タスクに切り出す。
- progress 文言の分岐や mode 別の詳細化は、IPC 配線後に段階的に拡張するのが安全。

## 6. 検証メモ

- build: PASS
- typecheck: PASS
- vitest: PASS
- callback 例外伝播: PASS
- `onProgress` 未指定: PASS
