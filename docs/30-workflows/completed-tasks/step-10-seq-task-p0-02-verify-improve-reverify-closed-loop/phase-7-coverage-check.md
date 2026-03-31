# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 7                                                |
| Phase名    | カバレッジ確認                                   |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 6: テスト拡充                              |
| 次Phase    | Phase 8: リファクタリング                        |
| ステータス | pending                                          |
| 作成日     | 2026-03-29                                       |
| 更新日     | 2026-03-30                                       |

## 目的

AC-1〜AC-6 と全遷移 edge のカバレッジを照合し、閉ループ修復の抜けをなくす。

## 実行タスク

### Task 1: 受入条件カバレッジ

- AC ごとのテスト対応表を作成する:
  - AC-1: recordVerifyPass() 存在 → ユニットテスト
  - AC-2: verify→improve 遷移 → ユニットテスト
  - AC-3: improve→verify 遷移 → ユニットテスト
  - AC-4: 完全サイクル → 統合テスト
  - AC-5: UI snapshot → snapshot テスト
  - AC-6: requestReverify() 統合 → ユニットテスト

### Task 2: 遷移 edge カバレッジ

- 全遷移 edge（execute→verify, verify→improve, verify→complete, improve→verify, improve→execute）がテストで覆われていることを確認する
- 不正遷移の禁止がテストで覆われていることを確認する
- disabled conditions が全てテストで覆われていることを確認する

### Task 3: 依存関係カバレッジ

- WorkflowEngine、Facade、IPC handler の 3 層が各層でテストされていることを確認する
- verification engine との統合レイヤーがテストされていることを確認する

### カバレッジ測定対象ファイル

| ファイル                   | パス                                                                   | 測定対象                                 |
| -------------------------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| SkillCreatorWorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `recordVerifyPass`, 遷移テーブル         |
| RuntimeSkillCreatorFacade  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | `processVerifyResult`, `requestReVerify` |
| creatorHandlers            | `apps/desktop/src/main/services/runtime/creatorHandlers.ts`            | verify pass handler                      |

## 参照資料

| 資料名       | パス                                       | 説明            |
| ------------ | ------------------------------------------ | --------------- |
| テスト拡充   | `phase-6-test-expansion.md`                | coverage 対象   |
| 実装記録     | `outputs/phase-5/implementation-record.md` | coverage の根拠 |
| テスト仕様書 | `outputs/phase-4/test-specifications.md`   | AC 対応の元     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                  |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| Skill Creator Service仕様 | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SkillCreatorService仕様との整合性確認 |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC修正時の整合性確認                 |

## 統合テスト連携

- 完全サイクルテストを coverage の中核ケースに置く
- concern coverage を行数より優先して判定する

## 成果物

| 成果物             | パス                                 | 説明                                    |
| ------------------ | ------------------------------------ | --------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | AC 対応表と遷移 edge coverage           |
| AC-テスト対応表    | `outputs/phase-7/ac-test-mapping.md` | AC-1〜AC-6 と具体的テストケースの対応表 |

## 完了条件

- [ ] AC-1〜AC-6 の対応表がある
- [ ] 全遷移 edge の coverage が確認されている
- [ ] 不正遷移の禁止テストが確認されている
- [ ] 3 層（Engine/Facade/IPC）の coverage が確認されている
- [ ] Phase 8 に渡す重複削減候補が整理されている
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
