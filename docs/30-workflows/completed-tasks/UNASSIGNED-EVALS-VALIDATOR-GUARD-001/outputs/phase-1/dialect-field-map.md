# 方言フィールドマップ — Phase 1 Step 4 実測値

## 方言自動検出ルール

`skillName`が存在すればcamelCase方言、`skill_name`が存在すればsnake_case方言として判定。

## フィールド対応表

| camelCase フィールド | snake_case フィールド | 使用スキル（camelCase）                                          | 使用スキル（snake_case）                                     | 備考                     |
| -------------------- | --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------ |
| `skillName`          | `skill_name`          | github-issue-manager, int-test-skill, task-specification-creator | aiworkflow-requirements, skill-creator, skill-fixture-runner | 方言自動検出キー         |
| `currentLevel`       | `current_level`       | github-issue-manager, int-test-skill, task-specification-creator | aiworkflow-requirements, skill-creator, skill-fixture-runner | 方言検出後の必須キー     |
| `metrics`            | `metrics`             | 全スキル共通                                                     | 全スキル共通                                                 | 方言非依存の共通必須キー |

## 動的パス consumer 確認 (Phase 1 Step 5)

`.claude/skills/`配下のスクリプトでEVALS.jsonを読むconsumer=0件（validator=0件状態を確認）。

## fixture 境界 (Phase 1 Step 3)

`apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`が除外対象。`skill_name: "fixture-complete-skill"`を持つ。
