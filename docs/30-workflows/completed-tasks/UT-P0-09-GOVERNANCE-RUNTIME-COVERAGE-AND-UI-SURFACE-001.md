# UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001: governance 全 phase 適用と renderer 可視化

## メタ情報

| 項目       | 値                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| 未タスクID | UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001                                                             |
| 検出元     | TASK-P0-09 Phase 12 close-out 再監査                                                                                |
| 優先度     | 高                                                                                                                  |
| 影響範囲   | `RuntimeSkillCreatorFacade` / renderer governance UI / Phase 11 evidence                                            |
| 現在状態   | 2026-04-02 完了（workflow `docs/30-workflows/ut-p0-09-governance-runtime-coverage-and-ui-surface-001/` で対応済み） |

## 概要

TASK-P0-09 では execute phase の governance wiring、shared types、IPC/preload payload 公開までは完了した。一方で、plan / verify / improve を含む runtime 全経路への enforcement と、renderer 上で denial / summary を見せる UI surface、およびその Phase 11 visual evidence は未実装のまま残っている。

この差分は mainline の安全性説明と Phase 11/12 証跡に直接影響したため、独立 follow-up として formalize した。2026-04-02 に対応を完了し、現在は source record として保持する。

## 対応結果

1. runtime governance coverage の current facts を全 phase 前提へ更新した
2. renderer governance UI とテストを追加した
3. Phase 11 は capture 環境なしのため N/A 根拠つき evidence として閉じた

## 苦戦箇所の記録

- **境界の混同**: `GovernanceUiPayload` を公開した時点で「UI 実装済み」と誤読されやすい
- **phase coverage の見かけ差分**: policy 定義と runtime wiring を同一視すると、execute-only 実装でも full coverage に見えてしまう
- **証跡運用**: payload 契約追加タスクでは screenshot 要否を明示しないと Phase 11 判定が揺れやすい

## 関連タスク

- TASK-P0-09 claude-sdk-permission-hooks-governance
