# UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001: governance 全 phase 適用と renderer 可視化

## メタ情報

| 項目       | 値                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| 未タスクID | UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001                  |
| 検出元     | TASK-P0-09 Phase 12 close-out 再監査                                     |
| 優先度     | 高                                                                       |
| 影響範囲   | `RuntimeSkillCreatorFacade` / renderer governance UI / Phase 11 evidence |

## 概要

TASK-P0-09 では execute phase の governance wiring、shared types、IPC/preload payload 公開までは完了した。一方で、plan / verify / improve を含む runtime 全経路への enforcement と、renderer 上で denial / summary を見せる UI surface、およびその Phase 11 visual evidence は未実装のまま残っている。

この差分は mainline の安全性説明と Phase 11/12 証跡に直接影響するため、独立 follow-up として formalize する。

## 対応方針

1. runtime governance coverage を全 phase に広げる。
   - `plan` / `verify` / `improve` でも `permissionMode` / hooks / `permissions.canUseTool` の適用要否を current architecture に沿って整理する
   - execute-only wiring を前提にした文言を system spec / outputs から解消する
2. renderer governance UI を実装する。
   - `getGovernancePayload()` を消費する表示 surface を追加する
   - denial reason / recent denials / session summary の最小表示要件を定義する
3. Phase 11 evidence を回収する。
   - renderer UI が入った時点で screenshot plan を作成し、visual evidence を `outputs/phase-11/` に追加する
   - UI 非実装時は N/A、UI 実装後は screenshot 必須の分岐を guide に同期する

## 苦戦箇所の記録

- **境界の混同**: `GovernanceUiPayload` を公開した時点で「UI 実装済み」と誤読されやすい
- **phase coverage の見かけ差分**: policy 定義と runtime wiring を同一視すると、execute-only 実装でも full coverage に見えてしまう
- **証跡運用**: payload 契約追加タスクでは screenshot 要否を明示しないと Phase 11 判定が揺れやすい

## 関連タスク

- TASK-P0-09 claude-sdk-permission-hooks-governance
