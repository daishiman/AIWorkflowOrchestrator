# 設計レビュー: TASK-SC-IMPROVE-PROMPT-IMPL-001

## チェックリスト

### 単一責務

- [x] `runImprovePromptWorkflow()`: SKILL.md 読み込み→改善→書き戻しのみ担当
- [x] progress emit は `createSkill()` に集約（外部契約を汚染しない）
- [x] `improveSkill()` は フォールバック専用として責務が明確

### update モードとの差異

- [x] progress 名称が `improving(65%)` で区別されている
- [x] `runUpdateWorkflow()` への依存・変更なし（兄弟タスクスコープ外）

### フォールバック・abort の安全性

- [x] `isAbortError(error)` で abort を必ず rethrow
- [x] LLM 失敗 / readFile 失敗 → `improveSkill()` フォールバック
- [x] `ensureSkillMdExists` は既存ファイルを上書きしないので書き戻し後も安全

## リスク評価

| リスク                       | 優先度 | 対策                                                                        |
| ---------------------------- | ------ | --------------------------------------------------------------------------- |
| LLM が frontmatter を壊す    | 中     | MINOR: テストで検証。本タスクでは LLM 応答をそのまま使う（agentDef で指示） |
| 書き戻し失敗時のユーザー通知 | 低     | 上位例外として伝播                                                          |
| 既存モードへの回帰           | 低     | `ensureSkillMdExists` が既存 SKILL.md を保護                                |
