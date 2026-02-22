# Phase 5: TDD Green — テスト結果レポート

## タスクID: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## 実行日: 2026-02-22

## 結果: GREEN ✅（全テストPASS）

## テスト実行結果

- **PASS**: 31件
- **FAIL**: 0件
- **合計**: 31件

## 実装変更サマリー

### 1. SkillImportDialog/index.tsx — `handleImport` 修正

**変更前**:

```typescript
const handleImport = () => {
  onImport(Array.from(selectedIds));
  onClose();
};
```

**変更後**:

```typescript
const handleImport = () => {
  const selectedNames = availableSkills
    .filter((skill) => selectedIds.has(skill.id))
    .map((skill) => skill.name);
  onImport(selectedNames);
  onClose();
};
```

### 2. AgentView/index.tsx — `handleImport` 引数名修正

**変更前**: `async (skillIds: string[])` / `for (const skillName of skillIds)` / `skillIds.length`
**変更後**: `async (skillNames: string[])` / `for (const skillName of skillNames)` / `skillNames.length`

## 維持した箇所

- `importedSkillIds.includes(skill.id)` — ID判定を維持
- `handleToggleSkill(skill.id)` — ID管理を維持
- `selectedIds: Set<string>` — 内部状態はIDのまま
- `key={skill.id}` — React key はIDのまま

## 完了条件チェック

- [x] Dialogで `id -> name` 変換が実装されている
- [x] AgentView引数が `skillNames` に統一されている
- [x] `importedSkillIds` 判定が維持されている
- [x] REDテストがGREEN化している
