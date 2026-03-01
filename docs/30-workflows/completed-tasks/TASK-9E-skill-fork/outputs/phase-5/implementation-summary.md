# Phase 5 実装サマリー - TASK-9E-skill-fork

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| タスク   | TASK-9E skill:fork                                         |
| Phase    | 5（実装）                                                  |
| 作成日   | 2026-02-28                                                 |
| 実装方針 | 既存 `skill:` IPC パターン踏襲（Main内でサービス直接生成） |

## 変更ファイル

### 新規作成

- `packages/shared/src/types/skill-fork.ts`
- `apps/desktop/src/main/services/skill/SkillForker.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts`
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.fork.test.ts`

### 変更

- `packages/shared/src/types/index.ts`
- `packages/shared/index.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/skill-api.ts`

## 実装内容

### 1. Shared型

`SkillForkOptions` / `SkillForkResult` / `SkillForkMetadata` を追加。

```ts
interface SkillForkOptions {
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

- `SkillForkResult`: `success`, `newSkillPath`, `copiedFiles`, `warnings?`
- `SkillForkMetadata`: `forkedFrom`, `forkedAt`(ISO8601), `originalDescription?`

### 2. Main Service (`SkillForker`)

- `fork()`
  - path検証（`validatePath`）
  - source存在/重複チェック
  - `SKILL.md` のFrontmatter更新
  - サブディレクトリ選択コピー（agents/references/scripts/assets）
  - `fork-metadata.json` 書き込み
  - 失敗時ロールバック（`rm -rf`）
- 依存は `fs/promises` と `path` のみ（IPC/UI非依存）

### 3. IPC Handler (`skill:fork`)

`registerSkillHandlers()` に `IPC_CHANNELS.SKILL_FORK` を追加。

- `validateIpcSender` を必須適用
- 引数バリデーション
  - `sourceSkill`, `newName`: 非空文字列
  - `description`: 指定時のみ非空文字列
  - `copy*`: boolean
  - `modifyAllowedTools`: 非空文字列配列
- 応答は `{ success: true, data }` / `{ success: false, error }`

### 4. Preload API

`skill-api.ts` に追加:

```ts
forkSkill: (options: SkillForkOptions) =>
  safeInvokeUnwrap<SkillForkResult>(IPC_CHANNELS.SKILL_FORK, options);
```

`channels.ts` の `IPC_CHANNELS` / `ALLOWED_INVOKE_CHANNELS` に `SKILL_FORK` を登録。

### 5. 公開エクスポート

- `packages/shared/src/types/index.ts`: `export * from "./skill-fork"`
- `packages/shared/index.ts`: `SkillFork*` 型を re-export

## 品質結果

- テスト: **59件 PASS**（SkillForker 34 + IPC 25）
- セキュリティ観点:
  - sender検証
  - パストラバーサル防止
  - エラーメッセージサニタイズ

## 設計差分（記録）

- Phase 2案の「専用Errorクラス中心設計」から、実装では `Error` + サニタイズ応答へ簡素化。
- 依存注入で `SkillService` に組み込む案ではなく、既存ハンドラ群と同様に `registerSkillHandlers` 内で `SkillForker` を直接生成。
