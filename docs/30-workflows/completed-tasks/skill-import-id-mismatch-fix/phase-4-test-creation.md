# Phase 4: テスト作成（TDD: Red）— UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 4（テスト作成）                     |
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 |
| 機能名   | skill-import-id-mismatch-fix        |
| 作成日   | 2026-02-22                          |
| 前Phase  | Phase 3（設計レビュー）             |

## 目的

不具合再現を固定し、修正前コードで失敗するテスト（Red）を定義する。

## 実行タスク

- 不具合再現テスト: ID選択時に `onImport` がnameを渡せていないことを再現
- 境界テスト: `importedSkillIds` 判定がID基準で維持されることを確認
- 接続テスト: AgentView `handleImport` が `skillNames` を受け取る前提を固定

## 参照資料

| 参照資料             | パス                                                                                                    | 内容                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 要件         | `docs/30-workflows/skill-import-id-mismatch-fix/phase-1-requirements.md`                                | AC定義                  |
| Phase 2 設計         | `docs/30-workflows/skill-import-id-mismatch-fix/phase-2-design.md`                                      | 実装方針                |
| Phase 3 設計レビュー | `docs/30-workflows/skill-import-id-mismatch-fix/phase-3-design-review.md`                               | P44/P45観点の妥当性確認 |
| テスト対象           | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | 更新対象                |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容             |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `skillName` 契約 |
| API IPC仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC引数仕様      |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P44/P45対策      |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 破壊的変更防止   |

## 実行手順

### Step 1: Dialog単体のRedテストを追加

追加する主テスト:

- `selectedIds` がIDであっても `onImport` はname配列を受け取るべき（現状は失敗）
- `importedSkillIds` にIDがある場合は選択不可（既存仕様維持）

### Step 2: AgentView境界のRedテストを追加

- `handleImport` が `skillNames` を受け取り `importSkillAction(skillName)` を呼ぶことを前提化

### Step 3: Red確認

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx
```

## 統合テスト連携【必須】

| 観点          | 確認内容                                                |
| ------------- | ------------------------------------------------------- |
| Dialog → View | `onImport` の引数が `skill.name[]` であるべきことを固定 |
| 回帰          | `importedSkillIds`（ID判定）が破壊されないこと          |

## 成果物

| 成果物     | パス                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| RED結果    | `outputs/phase-4/test-red-result.md`                                                                    |
| 更新テスト | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` |

## 完了条件

- [ ] 不具合再現テストが追加されている
- [ ] 修正前コードでREDを確認している
- [ ] `importedSkillIds` 判定維持テストがある
- [ ] AgentView境界テストの前提が固定されている

## 次のPhase

Phase 5（実装）: `docs/30-workflows/skill-import-id-mismatch-fix/phase-5-implementation.md`
