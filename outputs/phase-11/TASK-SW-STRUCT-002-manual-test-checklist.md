# TASK-SW-STRUCT-002 手動テストチェックリスト

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 作成日     | 2026-04-17                                    |
| タスク種別 | NON_VISUAL（スクリーンショット不要）          |

## 手動テスト対象

`create` モード実フローにおける SKILL.md 生成内容確認。

## チェックリスト

### AC-1: void structurePlan 削除確認

- [ ] `rg -n "void structurePlan" apps/desktop/src/main/services/skill/SkillCreatorService.ts` の結果が0件
- [ ] SkillCreatorService.ts :126 付近に `void structurePlan` が存在しないこと

### AC-2: create モードの generateSkillMd 接続確認

- [ ] `if (structurePlan !== null)` ブロックで `await this.generateSkillMd(skillDir, structurePlan, operationSignal)` が呼ばれること
- [ ] `generateSkillMd` が `generate_skill_md.js` を `--plan` / `--output` オプションで呼び出すこと

### AC-3: 非 create モードのフォールバック確認

- [ ] `collaborative` モードで `ensureSkillMdExists` が呼ばれること（generateSkillMd は呼ばれない）
- [ ] `orchestrate` モードで `ensureSkillMdExists` が呼ばれること

### AC-4: null フォールバック確認

- [ ] `runCreateWorkflow` が null を返した場合 `ensureSkillMdExists` にフォールバックすること
- [ ] warn ログ（"structurePlan is null, falling back to ensureSkillMdExists"）が出力されること

### AC-5: collaborative モード回帰確認

- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts` で全件 PASS

## TASK-SW-STRUCT-001 完了後の追加確認項目

- [ ] `structurePlan.purpose` に `options.description` が設定されていること
- [ ] 生成された SKILL.md のトリガー説明が `structurePlan.purpose` の内容を反映していること
