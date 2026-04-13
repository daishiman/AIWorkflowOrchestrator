# システム仕様書更新サマリー

## 更新対象仕様

### IPC契約更新

**チャンネル**: `skill:create`

| 引数 | Before                | After                                    |
| ---- | --------------------- | ---------------------------------------- |
| arg1 | `description: string` | `description: string`（変更なし）        |
| arg2 | `options: object`     | `options: object`（変更なし）            |
| arg3 | なし                  | `context?: SkillCreationContext`（追加） |

### 型定義更新

**SkillAPI インターフェース** (`preload/skill-api.ts`):

- `create()` params に `context?: SkillCreationContext` を追加

**AgentSlice インターフェース** (`agentSlice.ts`):

- `createSkill()` に第3引数 `context?: SkillCreationContext` を追加

### 新規型定義

`packages/shared/src/types/skillCreator.ts` に追加:

- `SkillCreationContext` interface
- `buildSkillContext()` exported function
- `buildSkillGenerationPrompt()` exported function

## 後方互換性

すべての変更が optional 追加のため、既存の呼び出しは変更不要。

## ワークフロー同期

- `docs/30-workflows/WA-seq-01-fix-dataflow/artifacts.json`
- `docs/30-workflows/WA-seq-01-fix-dataflow/outputs/artifacts.json`

上記 2 ファイルを `phase12_completed` / `blocked` の現在地に同期し、Phase 11 は `NON_VISUAL` として扱う。
