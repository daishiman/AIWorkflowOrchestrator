# リスク台帳 - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## 既知リスク

| ID   | リスク                                                                             | 影響度 | 対策                                                    | 状態     |
| ---- | ---------------------------------------------------------------------------------- | ------ | ------------------------------------------------------- | -------- |
| R-01 | `generateSkillMd` が `generate_skill_md.js` を呼び出すことで SKILL.md が変更される | 低     | 既存の `ensureSkillMdExists` フォールバックで保護       | 対策済み |
| R-02 | `structurePlan` が non-null の場合、既存のインライン処理がスキップされる           | 低     | フラグ `skillMdGeneratedByStructurePlan` で明示的に制御 | 対策済み |
| R-03 | logger がないため `console.error` を使用                                           | 低     | 既存コードに logger がないため現時点では最善の手段      | 受容     |

## 残存リスク

| ID   | リスク                                             | 影響度 | 備考                                                 |
| ---- | -------------------------------------------------- | ------ | ---------------------------------------------------- |
| R-03 | `console.error` はテスト環境で stderr に出力される | 低     | テストでは `vi.spyOn(console, "error")` でモック済み |

## 副作用確認

- `generate_skill_md.js` の `--plan` オプション処理は依存タスク完了済みで正常動作
- `runCreateWorkflow → generateSkillMd` パイプラインで失敗時は `ensureSkillMdExists` フォールバックが動作
- create 以外のモードへの影響なし（`structurePlan` は null のまま）
