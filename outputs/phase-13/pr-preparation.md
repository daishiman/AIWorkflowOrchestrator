# Phase 13: PR 準備メモ — UT-SKILL-WIZARD-W2-seq-03b

## PR タイトル案

```
feat(skill-wizard): wizard/index.ts エクスポート更新（W2-seq-03b）
```

## PR 本文テンプレート

```markdown
## 概要

`wizard/index.ts` から廃止コンポーネントのエクスポートを削除し、新コンポーネントの型エクスポートを追加。

## 変更内容

**削除（3件）：**

- DescribeStep / DescribeStepProps
- GenerationMode（インライン型定義 → GenerateStep.tsx から再転送）

**追加（2件）：**

- SkillInfoStepProps（型）
- GenerationMode（GenerateStep.tsx からの再転送）

**関連変更：**

- SkillInfoStep.tsx: SkillInfoStepProps を export interface に変更
- DescribeStep.tsx: @deprecated JSDoc 追加
- wizard-exports.test.ts: エクスポート確認テスト新規追加（11件）

## 依存タスク

- W1-par-02a（SkillInfoStep）: 完了済み
- W1-par-02b（ConversationRoundStep）: 完了済み
- W1-par-02c（CompleteStep）: 完了済み

## テスト

- `pnpm --filter @repo/desktop typecheck` エラー 0 件
- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/wizard-exports.test.ts --maxWorkers 1` 13/13 Green
```

## 承認状況

ユーザーの明示承認待ち。承認があった場合のみ PR 作成へ進む。
