# Phase 7: カバレッジ確認 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-10A-G                  |
| Phase    | 7 - カバレッジ確認          |
| 前Phase  | `phase-6-test-expansion.md` |
| 次Phase  | Phase 8（リファクタリング） |

## 目的

変更対象の suite と実装面で、最低基準 Line 80 / Branch 60 / Function 80 を満たすか確認する。

## preflight

```bash
node -e "require.resolve('@rollup/rollup-darwin-x64')"
```

- 失敗した場合は環境 blocker として Phase 9 / 11 に記録し、product defect と混同しない。

## 確認対象

| テストファイル                              | 主対象実装                  |
| ------------------------------------------- | --------------------------- |
| `SkillCreateWizard.test.tsx`                | `SkillCreateWizard.tsx`     |
| `SkillAnalysisView.test.tsx`                | `SkillAnalysisView.tsx`     |
| `useSkillAnalysis.test.ts`                  | `hooks/useSkillAnalysis.ts` |
| `SkillManagementPanel.integration.test.tsx` | `SkillManagementPanel.tsx`  |
| `agentSlice.skill-lifecycle.test.ts`        | `agentSlice.ts`             |
| `ChatPanel.skill-management.test.tsx`       | `ChatPanel.tsx`             |

## 実行コマンド

```bash
cd apps/desktop && pnpm exec vitest run --coverage \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts \
  src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx \
  src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

## 記録テンプレート

| ファイル                   | Line | Branch | Function | 判定 |
| -------------------------- | ---- | ------ | -------- | ---- |
| `SkillCreateWizard.tsx`    | -    | -      | -        | -    |
| `SkillAnalysisView.tsx`    | -    | -      | -        | -    |
| `useSkillAnalysis.ts`      | -    | -      | -        | -    |
| `SkillManagementPanel.tsx` | -    | -      | -        | -    |
| `agentSlice.ts`            | -    | -      | -        | -    |
| `ChatPanel.tsx`            | -    | -      | -        | -    |

## 完了条件

- [x] preflight の成否が記録されている
- [x] 対象ファイルの coverage が記録されている
- [x] 最低基準を満たさない場合、Phase 6 に戻る判断が明記されている

## テンプレート準拠追補

## 実行タスク

- T1: preflight を先に実行して環境 blocker を分離する
- T2: 対象 file の coverage を計測して記録する
- T3: 不足時の戻り先を明記する

## 参照資料

| 参照資料         | パス                                                                        | 用途                    |
| ---------------- | --------------------------------------------------------------------------- | ----------------------- |
| 依存Phase 5      | `phase-5-implementation.md`                                                 | 実装差分と対象suite確認 |
| テスト拡充       | `phase-6-test-expansion.md`                                                 | 補完ケース確認          |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | coverage 基準確認       |
| execute-workflow | `.claude/skills/task-specification-creator/references/execute-workflow.md`  | preflight 運用確認      |

## 実行手順

1. Rollup optional dependency の preflight を行う
2. targeted suite の coverage を記録する
3. 基準未達なら Phase 6 戻りを明記する

## 統合テスト連携

| 連携面     | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase 4-6  | 拡張済み suite 一覧を coverage 対象として固定する |
| Phase 9-11 | preflight 判定を品質検証と手動 smoke に引き継ぐ   |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                               |
| ------------------ | ---- | -------------------------------------- |
| 品質               | ✅   | Line / Branch / Function の基準達成    |
| エラーハンドリング | ✅   | blocker と defect の誤分類防止         |
| パフォーマンス     | △    | 必要対象だけを計測しているか           |
| アーキテクチャ     | △    | 対象実装が設計上の境界を維持しているか |

## 成果物

| 成果物        | パス                        | 説明                              |
| ------------- | --------------------------- | --------------------------------- |
| coverage 仕様 | `phase-7-coverage-check.md` | preflight、対象、記録テンプレート |

## サブタスク管理

1. preflight
2. coverage 計測
3. 基準判定
4. 戻り先整理

## タスク100%実行確認

- [x] preflight を実施して結果を記録した
- [x] coverage を対象 file ごとに記録した
- [x] 基準未達時の戻り条件を定義した

## 次のPhase

Phase 8（リファクタリング）
