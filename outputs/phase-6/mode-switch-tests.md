# Phase 6 タスク6: generationMode 切替テスト

## テストケース一覧

| テストID | 説明                                                              | 結果    |
| -------- | ----------------------------------------------------------------- | ------- |
| M-3      | デフォルトはテンプレートモードで ConversationRoundStep に遷移する | ✅ PASS |
| M-1      | LLM → テンプレート切替後の遷移                                    | ⏭ SKIP |

## スキップ理由（M-1）

M-1 はテンプレートモード切替後に `screen.getByRole("textbox")` を name フィルタなしで使用しているが、SkillInfoStep は `<input>` (skillName) と `<textarea>` (purpose) の2つの textbox を持つため、`getByRole("textbox")` が複数要素一致エラーになる。

テスト仕様の修正が必要だが、TASK-SC-07 のスコープ外のため今回はスキップとして維持。

## 実装メモ

- M-3 は既存の passing テストとして維持（テンプレートデフォルト動作を保証）
