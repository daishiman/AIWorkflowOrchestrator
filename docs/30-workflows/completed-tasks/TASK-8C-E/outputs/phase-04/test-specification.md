# Phase 4: テスト仕様書 - TASK-8C-E

## テストファイル

`apps/desktop/src/__tests__/fixtures/skills.fixture.test.ts`

## テストケース一覧

### E2E Skill Fixtures（ファイル存在・構造検証）

| TC-ID  | テストケース                                              | 検証内容                               |
| ------ | --------------------------------------------------------- | -------------------------------------- |
| TC-001 | test-skill/SKILL.md should exist                          | ファイルが存在すること                 |
| TC-002 | test-skill/SKILL.md should have valid YAML frontmatter    | YAML Frontmatter の形式・フィールド    |
| TC-003 | test-skill/agents/test-agent.md should exist              | agents サブリソースファイルの存在      |
| TC-004 | test-skill/references/test-ref.md should exist            | references サブリソースファイルの存在  |
| TC-005 | another-skill/SKILL.md should exist                       | 最小構成スキルの SKILL.md 存在         |
| TC-006 | another-skill/SKILL.md should have valid YAML frontmatter | 最小構成スキルの YAML Frontmatter      |
| TC-007 | invalid-skill/README.md should exist                      | 無効スキルの README.md 存在            |
| TC-008 | invalid-skill/SKILL.md should NOT exist                   | 無効スキルに SKILL.md が存在しないこと |

### SkillScanner Fixture Integration（統合検証）

| TC-ID  | テストケース                                            | 検証内容                                    |
| ------ | ------------------------------------------------------- | ------------------------------------------- |
| TC-009 | SkillScanner should scan fixture directory successfully | スキャン正常完了、2件以上のスキル検出       |
| TC-010 | test-skill should be scanned as ScannedSkillMetadata    | test-skill のパース結果の name, description |
| TC-011 | test-skill agents should contain test-agent             | agents 配列に test-agent.md が存在          |
| TC-012 | test-skill references should contain test-ref           | references 配列に test-ref.md が存在        |
| TC-013 | another-skill should be scanned as ScannedSkillMetadata | another-skill のパース結果確認              |
| TC-014 | invalid-skill should NOT be in scan results             | invalid-skill が結果に含まれないこと        |

## 受け入れ基準との対応

| AC-ID  | 対応テストケース       |
| ------ | ---------------------- |
| AC-001 | TC-001, TC-002, TC-010 |
| AC-002 | TC-003, TC-011         |
| AC-003 | TC-004, TC-012         |
| AC-004 | TC-005, TC-006, TC-013 |
| AC-005 | TC-007, TC-008, TC-014 |
| AC-006 | TC-009                 |

## 完了ステータス

- [x] TC-001〜TC-014 が実装されている
- [x] テスト仕様書が outputs/phase-04/ に配置されている
