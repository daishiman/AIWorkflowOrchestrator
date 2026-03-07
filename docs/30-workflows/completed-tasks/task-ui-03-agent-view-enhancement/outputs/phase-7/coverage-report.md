# Phase 7: カバレッジレポート

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 7                      |
| 機能名 | agent-view-enhancement |
| 実施日 | 2026-03-07             |

## ファイル別カバレッジ表

### organisms/AgentView コンポーネント

| ファイル                  | Stmts      | Branch  | Funcs    | Lines      | 未カバー行                  |
| ------------------------- | ---------- | ------- | -------- | ---------- | --------------------------- |
| **全体**                  | **99.68%** | **96%** | **100%** | **99.68%** | -                           |
| AdvancedSettingsPanel.tsx | 100%       | 94.11%  | 100%     | 100%       | L79 (description非表示分岐) |
| ExecuteButton.tsx         | 100%       | 100%    | 100%     | 100%       | -                           |
| FloatingExecutionBar.tsx  | 98.59%     | 100%    | 100%     | 98.59%     | L33 (interval内部)          |
| RecentExecutionList.tsx   | 100%       | 89.47%  | 100%     | 100%       | L18,75 (時間分岐)           |
| SkillChip.tsx             | 100%       | 100%    | 100%     | 100%       | -                           |

### agentSlice（TASK-UI-03拡張部分のみ）

| アクション                   | カバレッジ | テストケース数 |
| ---------------------------- | ---------- | -------------- |
| addExecutionToHistory        | 100%       | 4              |
| clearExecutionHistory        | 100%       | 1              |
| setAdvancedSettingsOpen      | 100%       | 2              |
| resetAgentState (UI-03関連)  | 100%       | 1              |
| recentExecutions初期値       | 100%       | 1              |
| isAdvancedSettingsOpen初期値 | 100%       | 1              |

## 基準判定

| 指標              | 基準 | 実績   | 判定     |
| ----------------- | ---- | ------ | -------- |
| Line Coverage     | 80%  | 99.68% | **PASS** |
| Branch Coverage   | 60%  | 96%    | **PASS** |
| Function Coverage | 80%  | 100%   | **PASS** |

## 全テスト実行結果

```
Test Files  8 passed | 1 skipped (9)
     Tests  117 passed | 12 skipped (129)
```

## 判定: PASS

全カバレッジ基準を達成。Phase 8（リファクタリング）へ進行可能。
