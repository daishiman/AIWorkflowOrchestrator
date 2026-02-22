# Phase 5: 実装（TDD: Green）— UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 5（実装）                           |
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 |
| 機能名   | skill-import-id-mismatch-fix        |
| 作成日   | 2026-02-22                          |
| 前Phase  | Phase 4（テスト作成）               |

## 目的

最小変更でRedテストをGreen化する。`importedSkillIds`（ID管理）は維持し、`onImport` 呼び出し時のみ `id -> name` 変換を行う。

## 実行タスク

- Dialog修正: `handleImport` で `selectedIds` を `skill.name[]` に変換する
- View修正: `handleImport` 引数を `skillNames` として明確化する
- 回帰確認: ID判定ロジックを維持しつつ、IPCへはnameが渡ることを確認する

## 参照資料

| 参照資料       | パス                                                                         | 内容     |
| -------------- | ---------------------------------------------------------------------------- | -------- |
| Phase 4 テスト | `docs/30-workflows/skill-import-id-mismatch-fix/phase-4-test-creation.md`    | RED条件  |
| Dialog実装     | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx` | 修正対象 |
| View実装       | `apps/desktop/src/renderer/views/AgentView/index.tsx`                        | 修正対象 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------- |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `skillName` 契約    |
| API IPC仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | `skill:import` 仕様 |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 契約ドリフト防止    |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | ID管理維持          |

## 実行手順

### Step 1: SkillImportDialog の `handleImport` を修正

```typescript
const handleImport = () => {
  const selectedNames = availableSkills
    .filter((skill) => selectedIds.has(skill.id))
    .map((skill) => skill.name);

  onImport(selectedNames);
  onClose();
};
```

維持する点:

- `importedSkillIds.includes(skill.id)`
- `handleToggleSkill(skill.id)`
- `selectedIds: Set<string>`

### Step 2: AgentView の引数セマンティクスを修正

```typescript
const handleImport = useCallback(
  async (skillNames: string[]) => {
    for (const skillName of skillNames) {
      await importSkillAction(skillName);
    }
  },
  [importSkillAction],
);
```

`SkillImportDialog` props は `importedSkillIds={importedSkillIds}` のまま維持。

### Step 3: Green確認

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx
```

## 統合テスト連携【必須】

| 観点         | 確認内容                             |
| ------------ | ------------------------------------ |
| Renderer内部 | ID管理（判定/選択）を維持            |
| Renderer境界 | `onImport` はname配列を渡す          |
| IPC境界      | `skill:import(skillName)` 契約に一致 |

## 成果物

| 成果物    | パス                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| 実装差分  | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx` |
| 実装差分  | `apps/desktop/src/renderer/views/AgentView/index.tsx`                        |
| GREEN結果 | `outputs/phase-5/test-green-result.md`                                       |

## 完了条件

- [ ] Dialogで `id -> name` 変換が実装されている
- [ ] AgentView引数が `skillNames` に統一されている
- [ ] `importedSkillIds` 判定が維持されている
- [ ] REDテストがGREEN化している

## 次のPhase

Phase 6（テスト拡充）: `docs/30-workflows/skill-import-id-mismatch-fix/phase-6-test-expansion.md`
