# Phase 5 統合フロー記録

## create -> execute -> improve

1. ユーザーが session card の prompt を入力する。
2. `detectMode` が走り、mode hint を表示する。
3. `createSkill(prompt, DEFAULT_CREATE_OPTIONS)` を実行する。
4. 返却された `path` から skill 名を導出し、`selectSkillByName` へ渡す。
5. `executeSkill(prompt)` を呼び、実行状態を session card に表示する。
6. `analyzeSkill(skillName)` または `autoImproveSkill(skillName)` を呼び、改善 summary を更新する。

## 既存 view との関係

| view          | 位置づけ                           |
| ------------- | ---------------------------------- |
| list view     | 一次導線。session card を表示      |
| create view   | secondary action。詳細設定付き作成 |
| analysis view | 個別分析の詳細 view                |
| editor view   | 既存の編集 view                    |

## 境界

| 項目           | 方針                                                     |
| -------------- | -------------------------------------------------------- |
| 表 UI          | session card では内部 agent 名を表示しない               |
| Main / Preload | 既存 `skill` と `skillCreator` API を再利用する          |
| 失敗時         | `skillError` を session card に表示し、prompt は保持する |
