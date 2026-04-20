# Phase 5: 実装

## 目的

本 task における「実装」は、既存コードとの差分確認と spec 修正を行い、必要最小限の修正だけを適用すること。

## 対象ファイル

| 種別             | パス                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| 実コード確認対象 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                |
| テスト確認対象   | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` |
| spec 修正対象    | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/*.md`              |

## 実装方針

1. 実コードは `cleanupCancelledSkillDir` ベースで扱う
2. spec は `finally + createdByThisRun` 前提を削除する
3. Phase 11 / 12 / 13 の成果物名を canonical に統一する

## 成果物

| 成果物                    | パス                                           |
| ------------------------- | ---------------------------------------------- |
| implementation diff check | `outputs/phase-5/implementation-diff-check.md` |
| patch plan                | `outputs/phase-5/patch-plan.md`                |

## 完了条件

- [ ] 実コードとの差分確認が終わっている
- [ ] 仕様書が実装実態に追随している
- [ ] 関連テストファイルも対象一覧に含まれている
