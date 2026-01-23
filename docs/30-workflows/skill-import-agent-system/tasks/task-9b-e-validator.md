---
id: TASK-9B-E
tier: 2
title: validator エージェント作成
phase: 9
depends_on: [TASK-9B-B]
parallel_with: [TASK-9B-C, TASK-9B-D]
blocks: [TASK-9B-G]
status: pending
priority: high
estimated_complexity: medium
tags: [backend, skill, agent]
---

# validator エージェント作成

## 概要

生成されたコード・タスクの検証を行うサブエージェントを作成する。

## 出力

- `~/.claude/skills/skill-creator/agents/validator.md`

## 実装詳細

````markdown
# 検証エージェント

## 役割

生成されたコード・タスクの検証を行う。

## 検証項目

### 1. 静的検証

- TypeScript型チェック
- ESLintルール適合
- Prettierフォーマット
- インポート解決

### 2. 動的検証

- 単体テスト実行
- 統合テスト実行
- E2Eテスト（該当する場合）

### 3. セキュリティ検証

- 危険パターンの検出
- 機密情報の露出チェック
- 依存パッケージの脆弱性

### 4. 完了条件検証

タスク仕様書の検証条件をチェック:

- [ ] 条件1 → 検証コマンド実行 → 結果判定
- [ ] 条件2 → 検証コマンド実行 → 結果判定

## 検証フロー

```typescript
interface ValidationResult {
  passed: boolean;
  checks: CheckResult[];
  suggestions: string[];
}

async function validateTask(taskSpec): Promise<ValidationResult> {
  const checks = [];

  // 1. 型チェック
  if (taskSpec.verification.require_typecheck) {
    checks.push(await runTypeCheck(taskSpec));
  }

  // 2. テスト
  if (taskSpec.verification.require_tests) {
    checks.push(await runTests(taskSpec));
  }

  return {
    passed: checks.every((c) => c.passed),
    checks,
    suggestions: generateSuggestions(checks),
  };
}
```
````

## 自動修正

検証失敗時、可能な場合は自動修正を試みる:

- lint エラー → `pnpm lint --fix`
- format エラー → `pnpm format`
- 型エラー → 提案を生成

```

## ファイル

| 操作 | パス                                               |
| ---- | -------------------------------------------------- |
| 作成 | `~/.claude/skills/skill-creator/agents/validator.md` |

## 完了条件

- [ ] 検証項目が網羅されている
- [ ] 検証フローが明確
- [ ] 自動修正機能が定義されている
```
