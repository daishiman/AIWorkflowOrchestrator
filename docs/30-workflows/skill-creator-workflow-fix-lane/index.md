# skill-creator-workflow-fix-lane - ワークフロー概要

## 概要

`SkillCreatorService` の2つの実装漏れを修正するタスク群。

1. `generate_skill_md.js` 呼び出しの引数ミスマッチ修正（常に失敗→フォールバックのみ動作）
2. `runCreateWorkflow` の空実装修正（create モードで LLM によるスキル内容生成が行われない）

## 現在の状態

| タスクID                          | ステータス |
| --------------------------------- | ---------- |
| TASK-SC-FIX-GENERATE-SKILL-MD-001 | pending    |
| TASK-SC-IMP-CREATE-WORKFLOW-001   | pending    |

## 問題の背景

### 問題1: generate_skill_md.js の引数ミスマッチ

`SkillCreatorService.ts:155-158` で `generate_skill_md.js` を `["--path", skillDir]` で呼び出しているが、
スクリプトの仕様は `--plan <json>` と `--output <path>` が必須引数となっている。
これにより `generateResult.success` が常に `false` となり、
`ensureSkillMdExists` フォールバックのみで動作し続けている。

### 問題2: runCreateWorkflow の空実装

`SkillCreatorService.ts:574-577` の `runCreateWorkflow` が `void options` のみで空実装。
`create` モードでスキルを作成する際に LLM による SKILL.md 内容生成が行われない。

## タスク一覧

```
TASK-SC-FIX-GENERATE-SKILL-MD-001/   ← generate_skill_md.js 引数修正（先行・ブロッカー）
  └─ SkillCreatorService.ts の --plan / --output 引数修正 + tmp JSON cleanup

TASK-SC-IMP-CREATE-WORKFLOW-001/      ← runCreateWorkflow 実装（後続・タスクAに依存）
  └─ resourceLoader.loadAgent 活用で構造計画 JSON を組み立て
```

## 依存グラフ

```
TASK-SC-FIX-GENERATE-SKILL-MD-001
  ↓（完了後に着手）
TASK-SC-IMP-CREATE-WORKFLOW-001
```

## 実装順序

1. **TASK-SC-FIX-GENERATE-SKILL-MD-001** を先に実装する（Phase 1-5）
2. タスクA完了後、**TASK-SC-IMP-CREATE-WORKFLOW-001** の Phase 5（実装）に着手する
   - Phase 1-4（要件・設計・レビュー・テスト設計）はタスクA完了前でも先行実施可能

## 参照ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
- `.agents/skills/skill-creator/agents/extract-purpose.md`
- `.agents/skills/skill-creator/scripts/generate_skill_md.js`
