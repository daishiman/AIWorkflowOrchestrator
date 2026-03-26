# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 8                                     |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

facade 肥大化と engine 肥大化の両方を防ぎ、ownership matrix を壊さない実装構造へ整える。

## 実行タスク

- facade / engine の helper 分離方針を整理する
- shared contract と internal state 型の分離方針を整理する
- artifact ownership と route snapshot の mapper 分離方針を整理する
- public surface を壊さない refactor guard を整理する

## 参照資料

| 資料名             | パス                        | 説明             |
| ------------------ | --------------------------- | ---------------- |
| Phase 1 要件       | `phase-1-requirements.md`   | owner inventory  |
| Phase 2 設計       | `phase-2-design.md`         | ownership matrix |
| Phase 5 実装計画   | `phase-5-implementation.md` | 実装対象         |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md` | refactor guard   |
| Phase 7 カバレッジ | `phase-7-coverage-check.md` | coverage 観点    |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                                            | 内容                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Runtime public IPC 契約 | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | public surface 維持条件             |
| lesson                  | `.agents/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | dead-end namespace を増やさない方針 |

## 実行手順

### ステップ1: facade を薄く保つ

- facade に phase artifact collection や resume serialization を置かない。
- handoff bundle 組み立てと public response 形成だけを facade に残す。

### ステップ2: engine を単一責務へ保つ

- engine は state authority に集中し、auth 解決や sender validation を持たない。
- verify / improve の runner 実装は engine 本体へ埋め込まず、hook point で扱う。

### ステップ3: shared contract と internal state を分離する

- renderer へ見せる型は `packages/shared/src/types/skillCreator.ts` に残す。
- internal state 型は main runtime 配下へ閉じる。

## 統合テスト連携

- Phase 4 と Phase 6 の suite を refactor guard として維持する。
- `creatorHandlers.ts` / `skill-creator-api.ts` / shared types の parity が崩れないことを再確認する。

## 成果物

| 成果物               | パス                     | 説明                      |
| -------------------- | ------------------------ | ------------------------- |
| リファクタリング方針 | `phase-8-refactoring.md` | boundary hardening の本文 |

## 完了条件

- [ ] facade / engine の責務が再確認されている
- [ ] shared contract と internal state の分離方針がある
- [ ] refactor guard と regression target が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
