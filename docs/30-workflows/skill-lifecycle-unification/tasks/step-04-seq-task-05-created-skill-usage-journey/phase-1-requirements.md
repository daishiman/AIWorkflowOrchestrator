# Phase 1: 要件定義 - タスク仕様書

## 目的

作成済みスキルをユーザーがどこから使うのか、いつ再利用するのか、結果をどう改善へ戻すのかを定義する。

## 実行タスク

1. `作成直後に使う` `あとから使う` `履歴から再利用する` の3シナリオを定義する
2. `Workspace` と `Agent` のどちらを主利用導線にするか比較する
3. 作成済みスキルを一覧・検索・おすすめ・履歴から呼び出す要件を定義する
4. 実行結果から Task03 改善導線へ戻る要件を定義する
5. Task04 の品質表示・再評価を利用中にどう見せるか定義する

## 参照資料

| 参照資料        | パス                                                                                                       | 説明          |
| --------------- | ---------------------------------------------------------------------------------------------------------- | ------------- |
| Task01 設計     | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/phase-2-design.md`              | 主導線        |
| Task03 設計     | `../../../completed-tasks/step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | 作成/改善統合 |
| App routes      | `apps/desktop/src/renderer/App.tsx`                                                                        | 利用導線候補  |
| AgentView       | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                      | 実行候補      |
| SkillCenterView | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                                | 発見/一覧候補 |

### システム仕様（aiworkflow-requirements）

| 参照資料                      | パス                                                                                 | 内容     |
| ----------------------------- | ------------------------------------------------------------------------------------ | -------- |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`         | 実行導線 |
| ui-ux-navigation              | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`              | 入口設計 |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | 実行契約 |

## 完了条件

- [ ] 3つの利用シナリオが定義されている
- [ ] 主利用導線が候補比較されている
- [ ] 改善へ戻るフィードバックループが定義されている
