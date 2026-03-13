# Phase 2 SubAgent 計画

## レーン分割

| SubAgent lane | 責務                                                  | 入出力                                               |
| ------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| Contract lane | preflight contract、exit code、JSON schema、core test | `preflight-contract.md`, `design-decision-record.md` |
| Capture lane  | capture 統合、metadata、manual test 導線              | `integration-design.md`                              |
| Docs lane     | Phase 12 更新先、mirror drift、監査手順               | `spec-sync-plan.md`                                  |

## 並列実行ルール

1. Contract lane と Capture lane は Phase 2 内で並列確認できる。
2. Docs lane は contract が確定した後に wording を固定する。
3. 実装着手は Phase 3 gate `PASS` 後に限定する。
