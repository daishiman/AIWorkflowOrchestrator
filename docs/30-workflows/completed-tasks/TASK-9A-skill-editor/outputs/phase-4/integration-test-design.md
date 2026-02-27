# Phase 4 統合テスト設計

## 統合境界

- Renderer `SkillEditor` ↔ Preload `skill-api`
- Preload `skill-api` ↔ Main `skillFileHandlers`
- Main `skillFileHandlers` ↔ `SkillFileManager`

## 検証シナリオ

1. readFile 経路: 選択ファイル表示
2. writeFile 経路: 保存 + バックアップ
3. create/delete 経路: ツリー更新
4. list/restore 経路: 履歴復元
5. readonly経路: UI無効化 + Main拒否

## 実行セット

- `SkillFileManager.test.ts` 37 tests
- `skillFileHandlers.test.ts` 38 tests
- `skill-api.test.ts` 83 tests
- `SkillEditor.test.tsx` 7 tests

## 判定

PASS
