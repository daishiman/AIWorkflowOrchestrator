# Phase 2: 設計 — 確認レポート

## タスクID: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## 確認日: 2026-02-22

## 確認結果: PASS

### 設計方針確認

- 変更境界: Renderer（Dialog/View）に限定
- `importedSkillIds` は `skill.id` 配列として維持
- `selectedIds` も `skill.id` の集合として維持
- `agentSlice` / IPC / Main は変更しない

### Dialog側の変換設計

```typescript
const selectedNames = availableSkills
  .filter((skill) => selectedIds.has(skill.id))
  .map((skill) => skill.name);
onImport(selectedNames);
```

- 変換できないIDは `filter` で自然に除外
- 判定ロジック `importedSkillIds.includes(skill.id)` は維持

### AgentView接続設計

- `handleImport` の引数名を `skillNames` に修正
- `for (const skillName of skillNames)` で `importSkillAction` を呼ぶ
- `SkillImportDialog` への `importedSkillIds` props は維持

### 影響分析

| レイヤー          | 変更有無 |
| ----------------- | -------- |
| Renderer(Dialog)  | あり     |
| Renderer(View)    | あり     |
| Store(agentSlice) | なし     |
| Preload           | なし     |
| Main/IPC          | なし     |

### 完了条件チェック

- [x] 変更境界（Renderer限定）が明確である
- [x] `id -> name` 変換ロジックが具体化されている
- [x] `importedSkillIds` をIDのまま維持する方針が明記されている
- [x] AgentViewの引数セマンティクスが `skillNames` へ統一されている
- [x] テスト変更方針（ID判定維持 + name引き渡し検証）が定義されている
