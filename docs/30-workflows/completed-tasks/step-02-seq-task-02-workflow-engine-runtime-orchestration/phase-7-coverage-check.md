# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 7                                     |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

phase 遷移、成果物受け渡し、route 連携、owner coverage の観点が揃っているかを確認する。

## 実行タスク

- state owner coverage を確認する
- artifact ownership coverage を確認する
- route branch coverage を確認する
- downstream handoff coverage を確認する

## 参照資料

| 資料名             | パス                                  | 説明                |
| ------------------ | ------------------------------------- | ------------------- |
| Phase 5 実装計画   | `phase-5-implementation.md`           | 実装対象            |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`           | fail path coverage  |
| ownership matrix   | `outputs/phase-2/ownership-matrix.md` | owner coverage 基準 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                     |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Runtime public IPC 契約    | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | public contract coverage |
| RuntimePolicyResolver 契約 | `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | route coverage           |

## 実行手順

### ステップ1: owner coverage を集計する

- `currentPhase` / `awaitingUserInput` / `verifyResult` / phase artifacts / `resumeTokenEnvelope` の 5 項目が test で触れられているかを確認する。

### ステップ2: route coverage を集計する

- `integrated_api` / `terminal_handoff` / service exception fallback の 3 系統が test にあるかを確認する。

### ステップ3: downstream handoff coverage を確認する

- Task03 / Task04 / Task07 / Task08 が参照する contract が phase 本文と artifacts に揃っているかを確認する。

## 統合テスト連携

- Phase 4 と Phase 6 で定義した suite を再実行し、owner / route / artifact の観点が欠けていないことを確認する。
- `verify-all-specs` の warning を 0 に寄せるため、Phase 1〜6 の依存参照漏れをここで潰す。

## 成果物

| 成果物         | パス                        | 説明                |
| -------------- | --------------------------- | ------------------- |
| カバレッジ確認 | `phase-7-coverage-check.md` | coverage 観点の本文 |

## 完了条件

- [ ] state / artifact / route の 3 観点が揃っている
- [ ] owner coverage が `outputs/phase-2/ownership-matrix.md` と一致している
- [ ] downstream handoff coverage が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
