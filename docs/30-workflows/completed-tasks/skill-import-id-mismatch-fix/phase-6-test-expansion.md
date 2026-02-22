# Phase 6: テスト拡充 — UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 6（テスト拡充）                     |
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 |
| 機能名   | skill-import-id-mismatch-fix        |
| 作成日   | 2026-02-22                          |
| 前Phase  | Phase 5（実装）                     |

## 目的

修正後の境界変換（ID管理維持 + name引き渡し）を網羅するテストを拡充する。

## 実行タスク

- 変換テスト: `selectedIds` から `skill.name[]` への変換を検証
- 境界値テスト: 不正ID/未知IDが含まれる場合の挙動を検証
- 回帰テスト: `importedSkillIds` 判定ロジックを維持確認
- 統合前提テスト: AgentView連携時にnameが流れることを検証

## 参照資料

| 参照資料     | パス                                                                                                    | 内容     |
| ------------ | ------------------------------------------------------------------------------------------------------- | -------- |
| Phase 5 実装 | `docs/30-workflows/skill-import-id-mismatch-fix/phase-5-implementation.md`                              | 変更内容 |
| テスト対象   | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | 追加対象 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                        | 内容             |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `skillName` 契約 |
| API IPC仕様          | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 呼び出し仕様     |
| 実装パターン仕様     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 契約ドリフト防止 |
| テスト仕様           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テスト設計       |

## 実行手順

### Step 1: 変換ロジックの網羅テスト追加

- 単一選択（ID1件 -> name1件）
- 複数選択（ID複数 -> name複数）
- 並び順維持

### Step 2: 境界値・異常系テスト追加

- `availableSkills` に存在しないIDが `selectedIds` にある場合
- 全件変換失敗で `onImport([])` になる場合

### Step 3: 回帰テスト追加

- `importedSkillIds.includes(skill.id)` が効いて再選択不可であること

### Step 4: テスト実行

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx
```

## 統合テスト連携【必須】

| 観点       | 確認内容                              |
| ---------- | ------------------------------------- |
| Dialog内部 | ID判定/選択の維持                     |
| Dialog出力 | `onImport` にname配列を渡す           |
| View連携   | name配列を `importSkillAction` へ中継 |

## 成果物

| 成果物         | パス                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| テスト拡充結果 | `outputs/phase-6/test-expansion-result.md`                                                              |
| 更新テスト     | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` |

## 完了条件

- [ ] 変換ロジックの正常系テストが追加されている
- [ ] 境界値/異常系テストが追加されている
- [ ] ID判定維持の回帰テストがある
- [ ] 追加テストを含めてPASSしている

## 次のPhase

Phase 7（カバレッジ確認）: `docs/30-workflows/skill-import-id-mismatch-fix/phase-7-coverage-check.md`
