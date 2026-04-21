# Code Audit: TASK-SC-IMPROVE-PROMPT-IMPL-001

## P50 チェック

- git log 確認: 前提タスク `UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` は完了済み（#2319 CLOSED）
- HEAD は `1ecbc63d6` (Merge remote-tracking branch 'origin/main')
- スコープ外変更なし: `git diff main...HEAD` はクリーン

## スタブ確認

`SkillCreatorService.ts` L416-420:

```typescript
case "improve-prompt":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  emitProgress("improving");
  break;  // 実処理なし
```

## 参照パターン整理

| パターン                  | 場所       | 目的                         |
| ------------------------- | ---------- | ---------------------------- |
| `runCreateWorkflow()`     | L980-1003  | LLM 経路ワークフロー参照     |
| `improveSkill()`          | L724-748   | スクリプト経由フォールバック |
| `throwIfAborted()`        | L253-257   | AbortSignal 確認             |
| `extractPurposeWithLlm()` | L1051-1073 | LLM 呼び出しパターン         |

## PROGRESS_FLOWS 確認

```
improve-prompt: loading-skill(10%) → analyzing(30%) → improving(65%) → validating(90%) → done(100%)
```

`update` モードとの差異: `generating-skill(60%)` → `improving(65%)`

## `ensureSkillMdExists` 挙動確認

L1436-1472: `fs.access` でチェック後、**ファイルが存在しない場合のみ** 新規作成。
既存 SKILL.md は上書きしない → `runImprovePromptWorkflow` が書き戻し後も安全。
