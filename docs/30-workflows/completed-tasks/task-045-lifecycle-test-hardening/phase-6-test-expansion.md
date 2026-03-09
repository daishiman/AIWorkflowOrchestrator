# Phase 6: テスト拡充 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-10A-G                  |
| Phase    | 6 - テスト拡充              |
| 前Phase  | `phase-5-implementation.md` |
| 次Phase  | Phase 7（カバレッジ確認）   |

## 目的

Phase 5 で追加した基本回帰に対し、境界値・排他制御・エラー回復の不足を補う。

## 拡充候補

| 対象                                        | 追加観点                                                |
| ------------------------------------------- | ------------------------------------------------------- |
| `SkillManagementPanel.integration.test.tsx` | search query を保持したまま analysis view を往復できる  |
| `SkillAnalysisView.test.tsx`                | `isAnalyzing` / `isImproving` 中に二重操作できない      |
| `useSkillAnalysis.test.ts`                  | confirm=false で autoImprove を呼ばない                 |
| `agentSlice.skill-lifecycle.test.ts`        | 失敗後に flag / error / analysis が期待どおり復元される |
| `ChatPanel.skill-management.test.tsx`       | `isExecuting` 解除後に toggle が再有効化される          |

## 実行手順

1. Phase 5 の差分から未カバー branch を洗い出す。
2. 境界値・エラー回復・排他制御を優先して追加する。
3. 新規 helper は 2ファイル以上で再利用できる場合のみ抽出する。

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

## 完了条件

- [x] 排他制御・エラー回復・view 往復の不足ケースが埋まっている
- [x] helper 抽出が過剰になっていない
- [x] Phase 7 で見る対象が明確になっている

## テンプレート準拠追補

## 実行タスク

- T1: 境界値・排他制御・エラー回復を優先してケースを拡充する
- T2: helper 抽出の是非を最小化方針で判断する
- T3: Phase 7 の coverage 対象を固定する

## 参照資料

| 参照資料       | パス                                                                                        | 用途              |
| -------------- | ------------------------------------------------------------------------------------------- | ----------------- |
| 実装           | `phase-5-implementation.md`                                                                 | 補完差分確認      |
| テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | helper 抽出方針   |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | coverage 基準確認 |
| 実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P31 / P39 再確認  |

## 統合テスト連携

| 連携面 | 内容                                               |
| ------ | -------------------------------------------------- |
| G1     | search state / view 往復の保持を強化する           |
| G2     | error recovery / disabled / retry の連携を強化する |
| G3     | `isExecuting` 解除後の再有効化を上位導線で確認する |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                          |
| ------------------ | ---- | ------------------------------------------------- |
| テスト設計         | ✅   | 過剰 helper 抽出を避けているか                    |
| UI/UX              | ✅   | search / toggle / disabled の体験劣化がないか     |
| エラーハンドリング | ✅   | failure 後の復元を観測できるか                    |
| パフォーマンス     | △    | coverage のために不要な全体回帰を増やしていないか |

## 成果物

| 成果物         | パス                        | 説明                     |
| -------------- | --------------------------- | ------------------------ |
| テスト拡充仕様 | `phase-6-test-expansion.md` | 追加観点と coverage 前提 |

## サブタスク管理

1. 未カバー branch 洗い出し
2. 境界値 / 排他 / 回復ケース追加
3. helper 抽出判断
4. Phase 7 対象確定

## タスク100%実行確認

- [x] 境界値・排他制御・回復ケースを補完した
- [x] helper 抽出を必要最小限に留めた
- [x] Phase 7 で確認すべき対象を固定した

## 次のPhase

Phase 7（カバレッジ確認）
