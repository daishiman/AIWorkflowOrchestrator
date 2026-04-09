# Phase 7 タスク1: カバレッジ計測結果（生ログ）

## 計測日時: 2026-04-09

## 計測コマンド

```bash
pnpm vitest run --coverage src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
```

## 計測結果（LLM生成テストのみ）

```
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered
-------------------|---------| ---------|---------|---------|----------
SkillCreateWizard  |   78.76 |    61.61 |   64.00 |   78.76 | 542-543,547-549
DescribeStep.tsx   |    0.00 |     0.00 |    0.00 |    0.00 | 1-133 (deprecated)
GenerateStep.tsx   |   85.27 |    55.55 |  100.00 |   85.27 | 245-247,252-254
```

## 注記

- **DescribeStep.tsx**: deprecated コンポーネントのためカバレッジ対象外
- **SkillCreateWizard.tsx Function 64%**: LLM 生成テストのみの計測値。handleRetry, handleExecuteNow, handleOpenInEditor, handleCreateAnother, handleQualityFeedback は CompleteStep 到達が必要な既存テスト（W-7/W-8 以降）でカバーされる
- **GenerateStep.tsx Branch 55.55%**: LLM 生成テストのみ。テンプレートフローのブランチが不足
- 全体プロジェクトのカバレッジ計測は OOM を避けるため実施せず。SkillCreateWizard.tsx の新規追加コード（LLM ハンドラ 3 関数）は 100% カバー済みであることを確認
