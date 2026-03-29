# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 1                                                |
| Phase名    | 要件定義                                         |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | -                                                |
| 次Phase    | Phase 2: 設計                                    |
| ステータス | pending                                          |
| 作成日     | 2026-03-29                                       |

## 目的

verify→improve→re-verify の閉ループが成立しない根本原因を特定し、§14 verify/improve closed loop の phase 遷移要件を確定する。

## 実行タスク

### Task 1: 現状の phase 遷移マッピング

- WorkflowEngine の既存 phase transitions を網羅的に洗い出す
  - plan→review, review→execute/handoff, execute→verify, verify→review/improve, improve→execute
- `recordVerifyFailure()` の挙動を記録する（nextAction: "improve" | "review"）
- `recordVerifyPass()` が不在であることを問題として固定する
- `requestReverify()` (lines 403-426) の eligibility check を記録する

### Task 2: 欠損遷移の特定

- verify 成功時 → 次 phase が未定義であることを確定する
- improve 完了時 → verify（re-verify）への直接遷移が存在しないことを確定する
- improve→execute→verify の間接経路が存在するが冗長であることを記録する

### Task 3: 受入条件の確定

- AC-1: `recordVerifyPass()` メソッドが WorkflowEngine に存在する
- AC-2: verify→improve phase 遷移が正しく動作する
- AC-3: improve→verify (re-verify) phase 遷移が動作する
- AC-4: execute→verify(fail)→improve→verify(pass) の完全サイクルがテスト可能
- AC-5: UI snapshot が verify の pass/fail/pending 状態を正しく反映する
- AC-6: `requestReverify()` が verification engine 結果と統合される

### Task 4: スコープ境界

- 含む: 閉ループの phase 遷移修復、`recordVerifyPass()` 実装、improve→verify 遷移追加、IPC handler 更新、UI snapshot 連携
- 含まない: verify engine 本体（P0-01）、manifest 配置（P0-03/04）、WorkflowEngine の全面再設計

## 参照資料

| 資料名             | パス                                                                                    | 説明                        |
| ------------------ | --------------------------------------------------------------------------------------- | --------------------------- |
| WorkflowEngine     | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                  | 閉ループ欠損の本体          |
| RuntimeFacade      | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                   | Facade 経由の呼び出し元     |
| creatorHandlers    | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                          | IPC handler の verify 経路  |
| skillCreator types | `packages/shared/src/types/skillCreator.ts`                                             | SkillCreatorVerifyResult 型 |
| remediation pack   | `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md` | P0 監査元                   |

## 統合テスト連携

- Phase 4 で完全サイクルテスト（execute→verify→improve→verify）のケースを定義する
- Phase 10 で AC-1〜AC-6 との対応表を再利用する

## 成果物

| 成果物     | パス                                         | 説明                                   |
| ---------- | -------------------------------------------- | -------------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 問題定義、欠損遷移、受入条件、スコープ |

## 完了条件

- [ ] 現状の phase 遷移が網羅的にマッピングされている
- [ ] 欠損遷移が明確に特定されている
- [ ] AC-1〜AC-6 が検証可能な形で定義されている
- [ ] 含む / 含まないが明確である
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
