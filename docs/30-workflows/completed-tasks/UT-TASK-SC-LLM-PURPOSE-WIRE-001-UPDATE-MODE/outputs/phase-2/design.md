# Phase 2: 設計書

## タスクID: UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE

## 設計方針

init_skill.js 非実行制御として **方式 B (early return)** を採用。

各専用メソッド完了後に `return skillDir` し、switch 文以降の `init_skill.js` 呼び出しブロックに到達させない。

## switch 文修正設計

### Before（バグあり）

```typescript
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  break; // ← break後にinit_skill.jsが実行される
case "improve-prompt":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  emitProgress("improving");
  break; // ← 同上
```

### After（修正後）

```typescript
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  await this.runUpdateWorkflow(options, operationSignal);
  emitProgress("done");
  return skillDir; // ← early return でinit_skill.jsをスキップ
case "improve-prompt":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  emitProgress("improving");
  await this.runImprovePromptWorkflow(options, operationSignal);
  emitProgress("done");
  return skillDir; // ← 同上
```

## progress emit フェーズ構成

| モード           | progress フェーズ順序                                |
| ---------------- | ---------------------------------------------------- |
| `update`         | `loading-skill` → `analyzing` → `done`               |
| `improve-prompt` | `loading-skill` → `analyzing` → `improving` → `done` |

※ PROGRESS_FLOWS 定義に `updating` フェーズが存在しないため、`runUpdateWorkflow` 内での追加 emit は不要。

## early return の安全性

- `createSkill` の try/catch の catch ブロック: AbortError/その他例外をハンドル
- early return は `try` ブロック内なので、`finally` ブロック（`currentAbortController` リセット）は正常実行される
- catch ブロックの `cleanupCancelledSkillDir` は呼ばれないが、update/improve-prompt では新規ディレクトリ作成を行わないため問題なし
