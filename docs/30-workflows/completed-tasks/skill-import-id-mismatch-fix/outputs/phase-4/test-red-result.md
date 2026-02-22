# Phase 4: TDD Red — テスト結果レポート

## タスクID: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## 実行日: 2026-02-22

## 結果: RED確認 ✅（期待通りのFAIL）

## テスト実行結果

- **PASS**: 26件（既存テスト + 新規回帰テスト）
- **FAIL**: 5件（不具合再現テスト）
- **合計**: 31件

## FAILしたテスト（不具合再現）

### 1. 選択したスキルのnameでonImportを呼び出す

- **期待値**: `["tdd-principles", "code-review"]`（skill.name）
- **実際値**: `["skill-1", "skill-2"]`（skill.id）
- **原因**: `handleImport` が `Array.from(selectedIds)` をそのまま渡している

### 2. 単一スキル選択時にonImportにskill.nameが渡される

- **期待値**: `["tdd-principles"]`
- **実際値**: `["skill-1"]`

### 3. 複数スキル選択時に全てのskill.nameが渡される

- **期待値**: `["tdd-principles", "code-review"]` を含む
- **実際値**: `["skill-1", "skill-2"]`

### 4. onImportに渡される値にskill.idが含まれない

- **期待**: `"skill-1"` を含まない
- **実際**: `"skill-1"` を含む

### 5. インポート後に選択をリセットする（期待値修正）

- **期待値**: `["tdd-principles"]`
- **実際値**: `["skill-1"]`

## 新規追加テスト一覧

| テスト名                                               | 種別       | 状態        |
| ------------------------------------------------------ | ---------- | ----------- |
| 選択したスキルのnameでonImportを呼び出す               | 期待値修正 | FAIL（RED） |
| 単一スキル選択時にonImportにskill.nameが渡される       | 不具合再現 | FAIL（RED） |
| 複数スキル選択時に全てのskill.nameが渡される           | 不具合再現 | FAIL（RED） |
| importedSkillIds判定はskill.idベースで維持される       | 回帰テスト | PASS        |
| onImportに渡される値にskill.idが含まれない             | 不具合再現 | FAIL（RED） |
| インポート済みスキルはtoggleしても選択状態が変わらない | 回帰テスト | PASS        |
| インポート後に選択をリセットする（期待値修正）         | 期待値修正 | FAIL（RED） |

## 完了条件チェック

- [x] 不具合再現テストが追加されている
- [x] 修正前コードでREDを確認している
- [x] `importedSkillIds` 判定維持テストがある
- [x] AgentView境界テストの前提が固定されている
