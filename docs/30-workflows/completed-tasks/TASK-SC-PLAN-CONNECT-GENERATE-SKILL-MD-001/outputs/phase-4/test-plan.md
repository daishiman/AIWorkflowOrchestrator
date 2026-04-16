# Phase 4: テスト計画書

## テストマトリクス

| TC番号       | テスト名                                           | 対象                              | 期待値                                                    | Red確認                                                 |
| ------------ | -------------------------------------------------- | --------------------------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| TC-CONNECT-1 | createSkill() で generateSkillMd が1回呼ばれること | createSkill フロー（create mode） | generateSkillMd が1回 call される                         | ✅ FAIL（generateSkillMd does not exist）               |
| TC-CONNECT-2 | null 時に ensureSkillMdExists にフォールバック     | createSkill フロー（null ケース） | generateSkillMd が呼ばれず ensureSkillMdExists が呼ばれる | ✅ FAIL（generateSkillMd does not exist）               |
| TC-CONNECT-3 | generate_skill_md.js を --plan/--output で呼ぶこと | generateSkillMd 内部              | execute が --plan --output で呼ばれる                     | ✅ FAIL（service.generateSkillMd is not a function）    |
| TC-CONNECT-4 | スクリプト失敗時に ensureSkillMdExists へ fallback | generateSkillMd エラーケース      | ensureSkillMdExists が呼ばれる                            | ✅ FAIL（service.generateSkillMd is not a function）    |
| IT-CONNECT-1 | create モード E2E                                  | create フロー全体                 | generate_skill_md.js が呼ばれる                           | ✅ PASS（既存コードで generate_skill_md.js が呼ばれる） |
| IT-CONNECT-2 | JSON シリアライズ → tmpPlanPath 検証               | generateSkillMd 内部フロー        | tmpPlanPath に workflow 形式 JSON が書き込まれる          | ✅ FAIL（service.generateSkillMd is not a function）    |

## Red確認結果

```
× TC-CONNECT-1: generateSkillMd does not exist
× TC-CONNECT-2: generateSkillMd does not exist
× TC-CONNECT-3: service.generateSkillMd is not a function
× TC-CONNECT-4: service.generateSkillMd is not a function
× IT-CONNECT-2: service.generateSkillMd is not a function
✓ IT-CONNECT-1: PASS（既存の SKILL.md 生成ブロックで generate_skill_md.js が呼ばれるため）
```

## TDD Red 確認のポイント

- `generateSkillMd` プライベートメソッドが未実装のため TC-CONNECT-1〜4, IT-CONNECT-2 が FAIL
- `void structurePlan;` が残っているため TC-CONNECT-1 は `generateSkillMd` が呼ばれない
- IT-CONNECT-1 は既存コードで `generate_skill_md.js` が呼ばれているため PASS（Phase 5 実装後は generateSkillMd 経由で呼ばれる）

## Phase 5 への引き継ぎ

- `generateSkillMd` プライベートメソッドを追加することで TC-CONNECT-3〜4, IT-CONNECT-2 が Green になる
- `void structurePlan;` を削除し `if (structurePlan)` → `generateSkillMd` 接続で TC-CONNECT-1〜2 が Green になる
- 既存テスト TC-01〜TC-07 は引き続き PASS することを確認すること
