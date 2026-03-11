# Phase 1: 要件定義 - タスク仕様書

## 目的

採点を単なる表示機能ではなく、改善・保存・利用の判断基準として機能させるための要件を定義する。

## 実行タスク

1. 現行の分析スコア、Prompt 評価、改善結果表示を棚卸しする
2. `prompt品質` `skill品質` `実行結果品質` の3軸評価を定義する
3. `作成時` `改善時` `利用前` `利用後再評価` の採点ポイントを定義する
4. スコアによる分岐条件を定義する
5. Task03 と Task05 に引き渡す評価契約を整理する

## 参照資料

| 参照資料          | パス                                                               | 説明                          |
| ----------------- | ------------------------------------------------------------------ | ----------------------------- |
| SkillAnalysisView | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` | 分析 UI                       |
| ScoreDisplay      | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`      | スコア表示                    |
| skillHandlers     | `apps/desktop/src/main/ipc/skillHandlers.ts`                       | `skill:optimize:evaluate` IPC |
| PromptOptimizer   | `apps/desktop/src/main/services/skill/PromptOptimizer.ts`          | prompt 採点                   |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容               |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------ |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質基準           |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | skill 品質評価対象 |
| ui-ux-feature-components   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | スコア表示 UX      |

## 完了条件

- [ ] 3軸評価が定義されている
- [ ] 採点ポイントが時系列で定義されている
- [ ] Task03/05 に必要な評価契約が列挙されている
