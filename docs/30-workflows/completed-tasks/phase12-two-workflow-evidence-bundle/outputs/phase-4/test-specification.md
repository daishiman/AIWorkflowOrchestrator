# Phase 4: テスト仕様書

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| Phase      | 4 — テスト作成 (TDD: Red)                       |
| 機能名     | phase12-two-workflow-evidence-bundle            |
| タスクID   | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 |
| 作成日     | 2026-03-03                                      |
| テスト数   | 14                                              |
| カテゴリ数 | 4                                               |

## テスト戦略

- TDD Red-Green-Refactor サイクルに基づくテスト先行開発
- 4カテゴリ × 14テストケースの構造
- Vitest + v8 カバレッジプロバイダ使用
- テスト対象: `evidence-bundle-validator.ts` (4関数)

## テストカテゴリ

| #   | カテゴリ名                   | テストファイル                     | ケース数 | ケースID     |
| --- | ---------------------------- | ---------------------------------- | -------- | ------------ |
| 1   | フォーマット統一テスト       | evidence-bundle-template.test.ts   | 3        | T4-01〜T4-03 |
| 2   | チェックリスト完全性テスト   | evidence-bundle-checklist.test.ts  | 5        | T4-04〜T4-08 |
| 3   | current/baseline分離テスト   | evidence-bundle-violations.test.ts | 3        | T4-09〜T4-11 |
| 4   | スクリーンショット実在テスト | evidence-bundle-screenshot.test.ts | 3        | T4-12〜T4-14 |

## カバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## テストファイル配置

```
.claude/skills/task-specification-creator/scripts/__tests__/
├── evidence-bundle-template.test.ts      # T4-01〜T4-03
├── evidence-bundle-checklist.test.ts     # T4-04〜T4-08
├── evidence-bundle-violations.test.ts    # T4-09〜T4-11
└── evidence-bundle-screenshot.test.ts    # T4-12〜T4-14
```

## テスト対象関数

| #   | 関数名              | 責務                                 | テストカテゴリ |
| --- | ------------------- | ------------------------------------ | -------------- |
| 1   | parseWorkflowResult | workflow出力を共通スキーマにパース   | カテゴリ1      |
| 2   | validateChecklist   | チェックリスト全項目の記入状態を検証 | カテゴリ2      |
| 3   | evaluateViolations  | currentViolations===0で合格判定      | カテゴリ3      |
| 4   | verifyScreenshot    | 画像ファイルの実在確認と更新日時取得 | カテゴリ4      |

## テスト実行コマンド

```bash
cd .claude/skills/task-specification-creator
pnpm vitest run scripts/__tests__/evidence-bundle-*.test.ts --coverage
```
