# Phase 7: カバレッジレポート

## AC とテストの対応表

| AC   | concern                              | テスト ID  | カバー状態 |
| ---- | ------------------------------------ | ---------- | ---------- |
| AC-1 | approved snapshot を execute が参照  | U-8b       | covered    |
| AC-2 | textarea 変更が payload に影響しない | U-8b, U-19 | covered    |
| AC-3 | cancel で snapshot + plan 対称クリア | U-9, U-20  | covered    |
| AC-4 | 既存 execute flow に回帰なし         | U-1〜U-17  | covered    |
| AC-5 | API シグネチャ維持                   | typecheck  | covered    |

## Concern Coverage

| concern                                    | テスト                       | 状態    |
| ------------------------------------------ | ---------------------------- | ------- |
| approved snapshot (non-null path)          | U-8b, U-19                   | covered |
| approved snapshot (null path / plan未実行) | U-8 (既存: storePlanId 使用) | covered |
| cancel → stale snapshot 解放               | U-9, U-20                    | covered |
| cancel → re-plan → 新 snapshot 固定        | U-18                         | covered |
| 複数回 textarea 編集                       | U-19                         | covered |
| terminal handoff 回帰                      | U-13                         | covered |
| workflow user input 回帰                   | U-13c                        | covered |
| verify/reverify 回帰                       | U-16, U-17                   | covered |

## 依存関係カバレッジ

| 層               | 対象                                       | テストでの検証         |
| ---------------- | ------------------------------------------ | ---------------------- |
| store hook       | `useCurrentPlanId`, `useCurrentPlanResult` | mock state で inject   |
| component state  | `approvedSkillSpec`, `localPlanResult`     | fireEvent + act で操作 |
| runtime API mock | `executePlan`, `planSkill`, `detectMode`   | vi.fn() で呼出引数検証 |

## Phase 8 へ渡す重複削減候補

- U-8b と U-19 は観点が近い（textarea変更後のexecute）が、U-8bは1回変更、U-19は複数回変更のため両方維持
- U-9 と U-20 も cancel 系だが、U-9 は clearGenerationState 呼出確認、U-20 は対称クリアの文脈が異なるため両方維持
- 重複削減対象: なし（各テストの concern が異なる）
