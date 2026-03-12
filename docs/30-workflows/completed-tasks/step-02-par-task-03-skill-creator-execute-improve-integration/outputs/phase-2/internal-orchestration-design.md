# Phase 2 内部オーケストレーション設計

## 目的

ユーザーに 1 本の導線だけを見せながら、内部では create / execute / improve の関心を分離して扱う。

## 内部責務モデル

| 内部役割      | 実体                                                         | 入力                             | 出力                          |
| ------------- | ------------------------------------------------------------ | -------------------------------- | ----------------------------- |
| Planner lane  | `detectMode`, create options 決定                            | prompt                           | mode hint, create options     |
| Executor lane | `executeSkill`                                               | selected skill, execution prompt | stream, execution status      |
| Improver lane | `analyzeSkill`, `applySkillImprovements`, `autoImproveSkill` | selected skill                   | analysis, improvement summary |

## 表 UI に出す情報

| 出す情報                              | 出さない情報                                 |
| ------------------------------------- | -------------------------------------------- |
| mode hint                             | Planner / Executor / Improver という内部名称 |
| create / execute / improve の進行状態 | 内部スクリプト名、委譲先の詳細               |
| 成功 / failure 要約                   | orchestration の詳細ログ                     |

## API マッピング

| ユースケース | Renderer 入口                                | Main 実処理                                                               |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------- |
| mode 判定    | `window.electronAPI.skillCreator.detectMode` | `SkillCreatorService.detectMode`                                          |
| skill 作成   | `window.electronAPI.skill.create`            | `SkillService.createSkillFromWizard` -> `SkillCreatorService.createSkill` |
| skill 実行   | `agentSlice.executeSkill`                    | `SkillService.executeSkill`                                               |
| skill 分析   | `agentSlice.analyzeSkill`                    | `window.electronAPI.skill.analyze`                                        |
| 自動改善     | `agentSlice.autoImproveSkill`                | `window.electronAPI.skill.autoImprove`                                    |

## SubAgent 的な関心分離

このタスクでは実際の別 UI エージェントを露出しない。代わりに内部責務を次の 3 つに固定する。

1. Planner concern
   prompt 解釈、mode 判定、create 直前の入力整理を担当する。
2. Executor concern
   execution permission、streaming、status 更新を担当する。
3. Improver concern
   analysis と improvement summary の更新を担当する。

## 権限境界

| 境界                | 制約                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| Renderer -> Preload | `window.electronAPI.skill` と `window.electronAPI.skillCreator` のみ使用する |
| Preload -> Main     | allowlist された IPC channel 経由のみ                                        |
| UI 表示             | skill path、分析結果要約、実行状態まで。内部 service 名は出さない            |

## フォールバック方針

| ケース            | フォールバック                                               |
| ----------------- | ------------------------------------------------------------ |
| `detectMode` 失敗 | create 導線は継続し、mode hint を非表示にする                |
| create 失敗       | prompt を保持したまま再試行可能にする                        |
| execute 失敗      | created skill を維持し、改善や wizard 遷移へ戻れるようにする |
| improve 失敗      | 直前の analysis を残し、再分析を再試行できるようにする       |
