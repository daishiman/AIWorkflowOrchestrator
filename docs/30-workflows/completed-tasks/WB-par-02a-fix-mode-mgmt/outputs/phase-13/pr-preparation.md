# Phase 13 成果物: PR 準備メモ

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## PR タイトル

```
fix(skill-wizard): generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正（TASK-SW-FIX-MODE-MGMT-001）
```

## 変更ファイル

| ファイル                                                                          | 変更種別 | 概要                                                        |
| --------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                | 変更     | generationMode/hasActivatedLlmMode削除・handleStep0Next修正 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | 変更     | TC-01〜TC-05（LLM専用フロー検証）追加                       |
| `docs/30-workflows/WB-par-02a-fix-mode-mgmt/`                                     | 新規追加 | Phase 1〜13 全成果物（37ファイル）                          |

## 変更概要

1. `generationMode`（`"template" | "llm"`）state と `hasActivatedLlmMode` state を削除
2. 全 `template` 条件分岐を除去（LLM専用に統一）
3. `SkillInfoStep.tsx` からラジオボタンUI削除・`generationMode` 関連 props 除去
4. `handleLlmGenerate` / `handleExecutePlan` / `handleCancelPlan` を削除
5. `handleStep0Next` が常に `goToStep(1)` を呼ぶよう修正（Step 1スキップ解消）
6. Step 0→Step 1→Step 2→Step 3 の正規フローを確立

## 品質確認

- テスト: 34/34 PASS
- TypeScript: 型エラー 0件
- generationMode残骸: 0件

## 承認状態

**未承認**（ユーザーの明示承認待ち）
