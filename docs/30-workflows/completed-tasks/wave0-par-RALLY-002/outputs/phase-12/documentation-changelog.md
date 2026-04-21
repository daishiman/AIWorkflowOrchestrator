# Documentation Changelog

## Current Wave

| ファイル                                                                                                       | 変更内容                                   |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                                       | 優先規則と clear 条件の comment 明確化     |
| `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx` | submit 後 clear の観測を強化               |
| `docs/30-workflows/wave0-par-RALLY-002/artifacts.json`                                                         | Phase status と Phase 11 evidence 名を同期 |
| `docs/30-workflows/wave0-par-RALLY-002/outputs/artifacts.json`                                                 | 同上                                       |
| `docs/30-workflows/wave0-par-RALLY-002/phase-5-implementation.md`                                              | 新規 targeted test を current fact に反映  |
| `docs/30-workflows/wave0-par-RALLY-002/phase-11-manual-test.md`                                                | NON_VISUAL evidence naming を追加          |
| `docs/30-workflows/wave0-par-RALLY-002/phase-12-documentation.md`                                              | fixed phrase と no-op 境界を追加           |
| `docs/30-workflows/wave0-par-RALLY-002/phase-13-pr-creation.md`                                                | task 固有 manual report を参照先へ反映     |
| `docs/30-workflows/wave0-par-RALLY-002/outputs/phase-5`〜`phase-13`                                            | close-out 証跡を新規追加                   |

## Validation

| 検証                 | 結果 |
| -------------------- | ---- |
| targeted test 実行   | 実施 |
| artifacts parity     | PASS |
| planned wording 監査 | 実施 |

## Notes

- official aiworkflow skill docs への Step 2 更新は no-op
- validator false negative 疑いは wider governance として未タスク化不要
