# Phase 5 変更ファイル一覧

## 新規作成ファイル

| ファイルパス                                                                                            | 説明                     |
| ------------------------------------------------------------------------------------------------------- | ------------------------ |
| `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js`                         | parityバリデータ（新規） |
| `.agents/skills/task-specification-creator/scripts/validate-closeout-parity.js`                         | 上記のagentsミラー       |
| `docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001/outputs/phase-5/implementation-summary.md` | 実装サマリー             |
| `docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001/outputs/phase-5/changed-files.md`          | 本ファイル               |

## 修正ファイル

| ファイルパス                                                            | 変更内容                                                     |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| `.claude/skills/task-specification-creator/scripts/complete-phase.js`   | 未知フラグ拒否・事前parity check・S1/S3/S4更新・rollback追加 |
| `.agents/skills/task-specification-creator/scripts/complete-phase.js`   | 上記のagentsミラー                                           |
| `.claude/skills/task-specification-creator/scripts/verify-all-specs.js` | parity検証統合（runParityCheck追加）                         |
| `.agents/skills/task-specification-creator/scripts/verify-all-specs.js` | 上記のagentsミラー                                           |

## 変更なしファイル

- テストファイル（`__tests__/validate-closeout-parity.test.js`, `__tests__/complete-phase.parity.test.js`）はPhase 4で作成済み、Phase 5では変更なし
- fixtureファイル（`__tests__/fixtures/closeout-parity/`）は変更なし
