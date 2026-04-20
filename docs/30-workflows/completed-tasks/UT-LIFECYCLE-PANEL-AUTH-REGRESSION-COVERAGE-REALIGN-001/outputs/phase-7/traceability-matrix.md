# traceability-matrix.md

## Phase 7: トレーサビリティ確認

| 受入基準 / 保証点                                                      | 仕様書証跡                                        | テスト証跡                                                     | 判定 |
| ---------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------- | ---- |
| AC-001 単体/統合責務境界                                               | `outputs/phase-1/responsibility-boundary.md`      | `AUTH-REGRESS-HANDLER-GUARANTEE`, `AUTH-REGRESS-INTEGRATION-*` | PASS |
| AC-002 rapid click                                                     | `outputs/phase-2/test-cases.md`                   | `TC-06` 2件                                                    | PASS |
| AC-003 rerender                                                        | `outputs/phase-2/test-cases.md`                   | `TC-07` 3件                                                    | PASS |
| AC-004 onOpenSkillWizard / onOpenWizard / handleSessionStartNew 非発火 | `index.md`, `outputs/phase-1/guarantee-points.md` | `TC-GUARD-01a`, `TC-GUARD-01b`, `TC-GUARD-01c`                 | PASS |
| AC-005 CI PASS                                                         | `outputs/phase-9/quality-check-result.md`         | targeted run `21/21 PASS`                                      | PASS |
| AC-006 旧保証点と現行保証点の対応                                      | `outputs/phase-1/spec-extraction-map.md`          | 本ファイル                                                     | PASS |

## 旧 TC 対応

| 旧保証点                          | 現行保証点                                         | 実装テスト     |
| --------------------------------- | -------------------------------------------------- | -------------- |
| 旧 TC-06 prepare flow rapid click | wizard 起点 rapid click でも `auth:login` 非発火   | `TC-06` 2件    |
| 旧 TC-07 prepare flow rerender    | props/state rerender でも `auth:login` 非発火      | `TC-07` 3件    |
| session resume start-new 導線     | `handleSessionStartNew()` でも `auth:login` 非発火 | `TC-GUARD-01c` |
