# Phase 1: 要件定義

## メタ情報

| 項目                | 内容                                 |
| ------------------- | ------------------------------------ |
| Phase               | 1                                    |
| タスクID            | TASK-SW-TODO-001                     |
| 機能名              | conversation-round-step-todo-cleanup |
| taskType            | NON_VISUAL                           |
| implementation_mode | verify_existing                      |
| 前提Phase           | -                                    |
| 後続Phase           | Phase 2                              |
| 作成日              | 2026-04-20                           |
| ステータス          | completed                            |

## 目的

P50 チェックで現物コードと git 履歴を確認し、この workflow の責務を「新規 cleanup 実装」ではなく「完了済み cleanup の検証と仕様同期」として固定する。

## 実行タスク

### タスク1: P50チェック

```bash
rg -n 'UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001|shouldShowMainToolBadge|MAIN_TOOL_BADGE_ENABLED' \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

rg -n 'resolveExternalIntegration' \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

git log --oneline -- apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx | sed -n '1,5p'
```

### タスク2: task 分類固定

- `taskType = NON_VISUAL`
- `implementation_mode = verify_existing`
- 本 task は PR #2199 の事後 cleanup 証跡整理

### タスク3: 受け入れ基準固定

| ID   | 内容                                                               |
| ---- | ------------------------------------------------------------------ |
| AC-1 | workflow 本文が `verify_existing` と NON_VISUAL に整合している     |
| AC-2 | Phase 4-5 が targeted verification / diff check を主作業としている |
| AC-3 | Phase 11 が NON_VISUAL evidence を primary にしている              |
| AC-4 | Phase 12 が 6成果物と parity を根拠付きで記録している              |
| AC-5 | 4条件を満たす                                                      |

## 参照資料

| 資料               | パス                                                                          | 用途                              |
| ------------------ | ----------------------------------------------------------------------------- | --------------------------------- |
| 対象実装           | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | cleanup 完了確認                  |
| 関連実装           | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | `toolNames` current contract 確認 |
| task spec skill    | `.agents/skills/task-specification-creator/SKILL.md`                          | workflow 構造基準                 |
| requirements skill | `.agents/skills/aiworkflow-requirements/SKILL.md`                             | Phase 12 同期判断                 |

## 統合テスト連携

| 判定項目                          | 基準 | 結果      |
| --------------------------------- | ---- | --------- |
| P50チェック完了                   | 完了 | completed |
| NON_VISUAL / verify_existing 固定 | 完了 | completed |
| AC-1〜AC-5 定義完了               | 完了 | completed |

## 成果物

| 成果物       | パス                                         | 説明                |
| ------------ | -------------------------------------------- | ------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | current fact と論点 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5          |

## 完了条件

- [x] P50チェックを実施した
- [x] `taskType` と `implementation_mode` を固定した
- [x] AC-1〜AC-5 を固定した
- [x] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次のPhase

Phase 2: 設計
