# Phase 6 タスク4: 二重呼出防止テスト

## 追加テストケース一覧

| テストID | 説明                                          | 結果    |
| -------- | --------------------------------------------- | ------- |
| G-1      | isGenerating=true 中に planSkill が呼ばれない | ✅ PASS |

## 実装メモ

- G-1: 既存 `.skip` を除去して有効化
- handleLlmGenerate の冒頭 `if (isGenerating || isSkillGenerating) return;` ガードが機能
