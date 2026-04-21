# Phase 5: 変更ファイル計画

## 更新対象

| 区分                          | ファイル                                                            | 役割                  | 変更理由                      |
| ----------------------------- | ------------------------------------------------------------------- | --------------------- | ----------------------------- |
| canonical writer              | `.claude/skills/skill-creator/assets/evals-template.json`           | 新規 skill 用テンプレ | 初期値を snake_case へ統一    |
| canonical writer              | `.claude/skills/skill-creator/scripts/init_skill.js`                | 新規 skill 初期化     | template と同じキーへ揃える   |
| canonical mixed reader/writer | `.claude/skills/skill-creator/scripts/collect_feedback.js`          | feedback 集計         | camelCase 読み書きを除去      |
| canonical reader/writer       | `.claude/skills/task-specification-creator/scripts/log-usage.js`    | EVALS 更新            | camelCase 読み書きを除去      |
| canonical fixture             | `.claude/skills/task-specification-creator/EVALS.json`              | 実体 fixture          | fixture 契約を統一            |
| canonical fixture             | `.claude/skills/int-test-skill/EVALS.json`                          | 実体 fixture          | fixture 契約を統一            |
| canonical fixture             | `.claude/skills/github-issue-manager/EVALS.json`                    | 実体 fixture          | fixture 契約を統一            |
| canonical schema              | `.claude/skills/skill-creator/schemas/feedback-record.json`         | schema 参照           | snake_case 契約へ追従         |
| mirror                        | `.agents/skills/...` 上記対応ファイル                               | mirror parity         | `.claude` と bit-for-bit 一致 |
| desktop guard                 | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | fixture 契約テスト    | snake_case fixture 契約を維持 |

## 対象外

| ファイル                                                    | 理由                                         |
| ----------------------------------------------------------- | -------------------------------------------- |
| `.claude/.agents/skills/automation-30/EVALS.json`           | 対象スキル外。全体統一タスクではない         |
| `.claude/.agents/skills/aiworkflow-requirements/EVALS.json` | 既に snake_case                              |
| `apps/backend`, `packages/shared`                           | 当該 3 組 6 フィールドの直接 consumer がない |
