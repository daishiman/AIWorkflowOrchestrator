# Phase 1: 要件定義

## メタ情報

| 項目                        | 内容                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Phase                       | 1                                                                                                              |
| タスクID                    | TASK-SW-CANCEL-004                                                                                             |
| 機能名                      | skill-creator-cancel-renderer-hook                                                                             |
| taskType                    | NON_VISUAL                                                                                                     |
| implementation_mode         | verify_existing                                                                                                |
| chain_id                    | CANCEL                                                                                                         |
| chain_position              | 4 / 4                                                                                                          |
| chain_completion_definition | shared / preload / main / renderer の4層接続が current fact と一致し、Renderer hook の仕様が検証可能であること |
| 前提Phase                   | -                                                                                                              |
| 後続Phase                   | Phase 2                                                                                                        |
| 作成日                      | 2026-04-20                                                                                                     |
| ステータス                  | completed                                                                                                      |

## 目的

実装済み current fact を棚卸しし、この workflow の責務を「新規実装」ではなく「既存実装の検証と仕様同期」として固定する。

## 実行タスク

### タスク1: P50チェック

```bash
sed -n '1,220p' apps/desktop/src/renderer/hooks/useCancelGeneration.ts
rg -n "cancelGeneration|skillCreatorAPI|SKILL_CREATOR_CANCEL" apps packages
```

### タスク2: task 分類と依存固定

- `taskType = NON_VISUAL`
- `implementation_mode = verify_existing`
- 依存は `TASK-SW-CANCEL-003` 完了済み
- 本 task は CANCEL chain の最終接続確認

### タスク3: 受け入れ基準固定

| ID   | 内容                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------- |
| AC-1 | workflow 本文が `verify_existing` と NON_VISUAL に整合している                                           |
| AC-2 | Phase 4-5 が既存テスト確認と diff check を主作業としている                                               |
| AC-3 | Phase 11 が `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` を主証跡にする |
| AC-4 | Phase 12 が 6成果物、Step 1-A〜1-C / Step 2 判定、artifacts parity を明記する                            |
| AC-5 | 4条件を満たす                                                                                            |

## 参照資料

| 資料           | パス                                                                    | 用途               |
| -------------- | ----------------------------------------------------------------------- | ------------------ |
| 対象実装       | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                | current fact 確認  |
| 既存テスト     | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts` | Phase 4 設計の基礎 |
| skill 基準     | `.agents/skills/task-specification-creator/SKILL.md`                    | task spec 準拠     |
| 正本仕様 skill | `.agents/skills/aiworkflow-requirements/SKILL.md`                       | Phase 12 同期方針  |

## 統合テスト連携

| 判定項目                          | 基準 | 結果      |
| --------------------------------- | ---- | --------- |
| current fact 確認完了             | 完了 | completed |
| NON_VISUAL / verify_existing 固定 | 完了 | completed |
| AC-1〜AC-5 定義完了               | 完了 | completed |

## 成果物

| 成果物     | パス                                         | 説明                   |
| ---------- | -------------------------------------------- | ---------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | AC・前提・除外事項     |
| 現状棚卸し | `outputs/phase-1/current-state-inventory.md` | P50結果と current fact |

## 完了条件

- [ ] P50チェックを実施した
- [ ] `taskType` と `implementation_mode` を固定した
- [ ] chain metadata を明記した
- [ ] AC-1〜AC-5 を固定した
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
