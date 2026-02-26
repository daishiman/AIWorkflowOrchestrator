# Phase 11 ウォークスルー証跡

## 実施順序

1. SkillEditor 起動、`SKILL.md` 自動読込を確認
2. `main.md` 選択で内容切替を確認
3. 編集して保存、未保存表示が消えることを確認
4. 未保存のまま切替し、ダイアログ3択を確認
5. readonlyパスで保存/作成/削除が無効化されることを確認
6. バックアップパネル開閉、復元呼び出しを確認
7. Arrowキーで treeitem フォーカス移動を確認

## 詰まり箇所

詰まりなし（0件）

## 根拠

- `SkillEditor.test.tsx`（7 tests）
- `SkillCodeEditor.test.tsx`（3 tests）
- 回帰/セキュリティテスト群
