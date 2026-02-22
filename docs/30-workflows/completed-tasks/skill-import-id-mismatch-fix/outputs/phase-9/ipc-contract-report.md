# Phase 9: IPC 契約整合性レポート

## タスクID: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## 実行日: 2026-02-22

## 結果: 全レイヤーで整合性確認 ✅

## データフロー確認マトリクス

| レイヤー          | ファイル                                       | 変数名/引数名                                                                      | 渡される値             | 整合 |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------- | ---- |
| SkillImportDialog | `organisms/SkillImportDialog/index.tsx:97-100` | `onImport(selectedNames)` — `skill.name` の配列                                    | `string[]`（スキル名） | ✅   |
| AgentView         | `views/AgentView/index.tsx:220-223`            | `handleImport(skillNames)` — `for (const skillName of skillNames)`                 | `string`（各スキル名） | ✅   |
| agentSlice        | `store/slices/agentSlice.ts:600-606`           | `importSkill(skillName)` → `window.electronAPI.skill.import(skillName)`            | `string`（スキル名）   | ✅   |
| Preload API       | `preload/skill-api.ts:261-262`                 | `import: (skillName: string)` → `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)` | `string`（スキル名）   | ✅   |
| Main Process      | `main/ipc/skillHandlers.ts:123`                | `async (event, skillName: string)` — P42準拠3段バリデーション                      | `string`（スキル名）   | ✅   |
| SkillService      | `main/ipc/skillHandlers.ts:139`                | `skillService.importSkills([skillName])` → `getSkillByName(skillName)`             | `string`（スキル名）   | ✅   |

## データフロー図

```
SkillImportDialog
  └─ selectedIds.has(skill.id) で選択済み判定
  └─ availableSkills.filter(s => selectedIds.has(s.id)).map(s => s.name) で name に変換
  └─ onImport(selectedNames: string[])  ← ★ Phase 5 修正箇所
      │
      ▼
AgentView.handleImport(skillNames: string[])
  └─ for (const skillName of skillNames)
      └─ importSkillAction(skillName)
          │
          ▼
agentSlice.importSkill(skillName: string)
  └─ window.electronAPI.skill.import(skillName)
      │
      ▼
Preload API: skill-api.ts
  └─ safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)
      │
      ▼
Main Process: skillHandlers.ts
  └─ ipcMain.handle(SKILL_IMPORT, (event, skillName: string))
  └─ P42準拠3段バリデーション
  └─ skillService.importSkills([skillName])
  └─ skillService.getSkillByName(skillName)
```

## P44/P45 パターン再発チェック

| チェック項目                | 確認内容                                                                            | 結果                         |
| --------------------------- | ----------------------------------------------------------------------------------- | ---------------------------- |
| P44: インターフェース不整合 | ハンドラの引数形式（`string`）と Preload 側の呼び出し形式（`string`）が一致         | ✅ 不整合なし                |
| P45: 引数命名ドリフト       | 全レイヤーで `skillName` が使用されている                                           | ✅ セマンティクス一致        |
| P42: .trim() バリデーション | Main Process で `typeof skillName !== "string" \|\| skillName.trim() === ""` を検証 | ✅ 3段バリデーション実装済み |

## 修正前後の比較

### 修正前（id がそのまま渡されていた）

```
SkillImportDialog → onImport(Array.from(selectedIds))  ← skill.id（SHA-256ハッシュ）
                       ↓
AgentView.handleImport(skillIds)
                       ↓
importSkillAction("a478b3e7c728cd18")  ← skill.id
                       ↓
Main: getSkillByName("a478b3e7c728cd18")  ← ❌ skill.name が必要だが id が渡される
```

### 修正後（name が渡される）

```
SkillImportDialog → onImport(selectedNames)  ← skill.name（人間可読名）
                       ↓
AgentView.handleImport(skillNames)
                       ↓
importSkillAction("task-specification-creator")  ← skill.name
                       ↓
Main: getSkillByName("task-specification-creator")  ← ✅ skill.name が正しく渡される
```
