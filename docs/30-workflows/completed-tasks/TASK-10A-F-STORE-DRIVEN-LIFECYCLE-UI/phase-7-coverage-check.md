# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 7                                    |
| 機能名 | task-10a-f-store-driven-lifecycle-ui |
| 作成日 | 2026-03-09                           |

## 目的

analysis/create 導線のテストカバレッジが基準を満たしていることを確認する。

## 実行タスク

- 計測対象固定: 対象ファイル別にカバレッジを計測する
- 不足記録: 基準未達の場合は不足箇所を記録する
- 戻り先定義: Phase 6 へ戻す条件を明示する

## 参照資料

| 資料名   | パス                                                                        | 説明           |
| -------- | --------------------------------------------------------------------------- | -------------- |
| Phase 5  | `phase-5-implementation.md`                                                 | 実装確認結果   |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準 |
| Phase 6  | `phase-6-test-expansion.md`                                                 | 追加観点       |

## 実行手順

### ステップ1: 対象を固定する

| 対象ファイル            | 理由           |
| ----------------------- | -------------- |
| `useSkillAnalysis.ts`   | 本タスクの中心 |
| `SkillAnalysisView.tsx` | 表示責務       |
| `SkillCreateWizard.tsx` | create 導線    |

### ステップ2: 計測コマンドを実行する

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx \
  src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx \
  --coverage
```

## 統合テスト連携

- Phase 9 の品質ゲートにカバレッジ結果を渡す

## 多角的チェック観点

| 観点         | 確認内容                                   |
| ------------ | ------------------------------------------ |
| テスト品質   | 基準値を満たしているか                     |
| スコープ整合 | import dialog 系を誤って対象にしていないか |

## 成果物

| 成果物             | パス                                                                                                        | 説明     |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | -------- |
| カバレッジレポート | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-7/coverage-result.md` | 計測結果 |

## 完了条件

- [ ] 対象3ファイルのカバレッジが計測されている
- [ ] 基準未達時の戻り先が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 対象固定
2. 計測
3. 判定
4. 完了条件確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 8: リファクタリング
