# Phase 2 セッション状態設計

## 目的

`SkillManagementPanel` 上の lifecycle session card が保持する local state と store state の境界を定義する。

## 状態の分担

### local state

| state               | 型                               | 用途                                  |
| ------------------- | -------------------------------- | ------------------------------------- |
| `prompt`            | `string`                         | create 用の自然言語入力               |
| `detectedMode`      | `string \| null`                 | `detectMode` の結果表示               |
| `modeStatus`        | `"idle" \| "loading" \| "error"` | mode 判定の UI 状態                   |
| `createdSkillPath`  | `string \| null`                 | create 成功後の path                  |
| `createdSkillName`  | `string \| null`                 | path から導出した skill 名            |
| `sessionMessage`    | `string \| null`                 | create / execute / improve の結果要約 |
| `wizardOpenRequest` | `boolean`                        | create view 遷移のトリガ              |

### store state 再利用

| state                                                        | 取得元       | 用途                           |
| ------------------------------------------------------------ | ------------ | ------------------------------ |
| `selectedSkillName`                                          | `agentSlice` | 実行対象と改善対象の正規 state |
| `isExecuting` / `skillExecutionStatus` / `streamingMessages` | `agentSlice` | execute 進行表示               |
| `currentAnalysis` / `isAnalyzing` / `isImproving`            | `agentSlice` | improve 進行表示               |
| `skillError`                                                 | `agentSlice` | renderer 共通エラー表示        |
| `importedSkills`                                             | `agentSlice` | create 後の対象 skill 確認     |

## 状態遷移

```text
idle
  -> detecting-mode
  -> ready-to-create
  -> creating
  -> created
  -> executing
  -> executed
  -> analyzing
  -> improved
```

## create handoff

1. `prompt` 更新時に mode 判定を実行する。
2. create 成功時に `createdSkillPath` と `createdSkillName` を更新する。
3. `fetchSkills()` 完了後に `selectSkillByName(createdSkillName)` を呼ぶ。
4. session card の execute / improve 操作は `createdSkillName ?? selectedSkillName` を対象にする。

## execute handoff

| 手順 | 処理                           | 反映 state                                        |
| ---- | ------------------------------ | ------------------------------------------------- |
| 1    | `selectSkillByName(skillName)` | `selectedSkillName`                               |
| 2    | `executeSkill(prompt)`         | `isExecuting`, `executionId`, `streamingMessages` |
| 3    | onComplete / onError           | `skillExecutionStatus`, `skillError`              |

## improve handoff

| 手順 | 処理                                           | 反映 state                       |
| ---- | ---------------------------------------------- | -------------------------------- |
| 1    | `analyzeSkill(skillName)`                      | `isAnalyzing`, `currentAnalysis` |
| 2    | `applySkillImprovements` or `autoImproveSkill` | `isImproving`                    |
| 3    | 再分析完了                                     | `currentAnalysis` 更新           |

## 例外系設計

| ケース          | UI 挙動                                                              |
| --------------- | -------------------------------------------------------------------- |
| detectMode 失敗 | `detectedMode` は null、補助メッセージで継続可能にする               |
| create 失敗     | `createdSkillName` を更新せず、`skillError` と再試行ボタンを表示する |
| execute 失敗    | `createdSkillName` を保持し、再実行と wizard 遷移を残す              |
| improve 失敗    | `currentAnalysis` を維持し、error 表示だけ更新する                   |

## session card が表示する要約

| 表示ブロック        | 依存 state                                                 |
| ------------------- | ---------------------------------------------------------- |
| mode hint           | `detectedMode`, `modeStatus`                               |
| create summary      | `createdSkillName`, `createdSkillPath`, `skillError`       |
| execute summary     | `isExecuting`, `skillExecutionStatus`, `streamingMessages` |
| improvement summary | `currentAnalysis`, `isAnalyzing`, `isImproving`            |
