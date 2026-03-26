# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 10                                    |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

Task02 が downstream task へ渡す契約として十分に閉じているかを判定し、blocker がない状態で Phase 11 へ進める。

## 実行タスク

- acceptance criteria を最終確認する
- downstream handoff 情報を最終確認する
- blocker / minor / deferred item を最終確認する
- Phase 11 manual walkthrough の観点を最終確認する

## 参照資料

| 資料名           | パス                           | 説明                 |
| ---------------- | ------------------------------ | -------------------- |
| Phase 1 要件     | `phase-1-requirements.md`      | acceptance base      |
| Phase 2 設計     | `phase-2-design.md`            | ownership matrix     |
| Phase 5 実装計画 | `phase-5-implementation.md`    | implementation scope |
| Phase 9 品質保証 | `phase-9-quality-assurance.md` | QA 結果              |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                   |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| Runtime public IPC 契約    | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | public contract の正本 |
| RuntimePolicyResolver 契約 | `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | route baseline の正本  |

## 実行手順

### ステップ1: acceptance criteria を判定する

- facade / engine / renderer の state owner が一意であることを確認する。
- `execute()` の migration path が明記されていることを確認する。

### ステップ2: downstream handoff を判定する

- Task03 へ phase と resource selection の接続点を渡す。
- Task04 へ `awaitingUserInput` と interaction owner を渡す。
- Task07 / Task08 へ route / resume の ownership 前提を渡す。

### ステップ3: deferred item を判定する

- 主導線の最終表現、verify surface の詳細、session storage の物理形式はこの task の外に置く。

## 統合テスト連携

- Phase 4 / 6 / 9 の検証観点が final review でも不足なく参照できることを確認する。
- `validate-phase-output` と `verify-all-specs` の PASS を最終 gate として扱う。

## 成果物

| 成果物       | パス                       | 説明       |
| ------------ | -------------------------- | ---------- |
| 最終レビュー | `phase-10-final-review.md` | final gate |

## 完了条件

- [ ] blocker が 0 件である
- [ ] downstream task への handoff 情報が明記されている
- [ ] deferred item が scope 外として明示されている
- [ ] **本Phase内の全タスクを100%実行完了**
