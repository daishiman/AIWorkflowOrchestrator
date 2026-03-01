# IPC ドキュメント: `skill:fork`（TASK-9E）

## 概要

| 項目        | 値                                            |
| ----------- | --------------------------------------------- |
| チャンネル  | `skill:fork`                                  |
| 定数        | `IPC_CHANNELS.SKILL_FORK`                     |
| 通信        | Renderer → Main（invoke/handle）              |
| Preload API | `window.electronAPI.skill.forkSkill(options)` |
| Main登録    | `registerSkillHandlers()`                     |
| Main解除    | `unregisterSkillHandlers()`                   |

## リクエスト型

`packages/shared/src/types/skill-fork.ts`

```ts
export interface SkillForkOptions {
  sourceSkill: string;
  newName: string;
  description?: string;
  copyAgents: boolean;
  copyReferences: boolean;
  copyScripts: boolean;
  copyAssets: boolean;
  modifyAllowedTools?: string[];
}
```

## レスポンス型

Mainハンドラの返却形式:

```ts
{ success: true, data: SkillForkResult }
{ success: false, error: string }
```

`SkillForkResult`:

```ts
export interface SkillForkResult {
  success: boolean;
  newSkillPath: string;
  copiedFiles: string[];
  warnings?: string[];
}
```

## バリデーション仕様

### IPCハンドラ側

- `args` は non-null object
- `sourceSkill`, `newName`: 非空文字列
- `description`: 指定時のみ非空文字列
- `copyAgents`, `copyReferences`, `copyScripts`, `copyAssets`: boolean
- `modifyAllowedTools`: 指定時は非空文字列配列

### サービス側（二重防御）

- `validatePath(name)` で `path.resolve(skillsDir, name)` の境界チェック
- source存在チェック
- destination重複チェック

## セキュリティ

- `validateIpcSender(event, IPC_CHANNELS.SKILL_FORK, ...)`
- `sanitizeErrorMessage(error)` で内部情報漏洩を抑制
- チャンネル文字列は直書きせず `IPC_CHANNELS.SKILL_FORK` を使用

## Preload 実装

`apps/desktop/src/preload/skill-api.ts`

```ts
forkSkill: (options: SkillForkOptions): Promise<SkillForkResult> =>
  safeInvokeUnwrap<SkillForkResult>(IPC_CHANNELS.SKILL_FORK, options);
```

## 使用例

```ts
const result = await window.electronAPI.skill.forkSkill({
  sourceSkill: "aiworkflow-requirements",
  newName: "aiworkflow-requirements-custom",
  description: "customized variant",
  copyAgents: true,
  copyReferences: true,
  copyScripts: false,
  copyAssets: false,
  modifyAllowedTools: ["Read", "Grep", "Bash"],
});

console.log(result.newSkillPath);
```
