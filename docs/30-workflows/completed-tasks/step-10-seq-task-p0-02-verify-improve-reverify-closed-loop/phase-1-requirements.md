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
| 更新日     | 2026-03-30                                       |

## 目的

verify→improve→re-verify の閉ループが成立しない根本原因を特定し、phase 遷移要件を確定する。

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。

```bash
# WorkflowEngine の verify/improve 関連メソッド
grep -n "recordVerify\|requestReverify\|improve" apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts

# recordVerifyPass の存在有無
grep -rn "recordVerifyPass" apps/desktop/src/main/services/runtime/

# Facade の verify 経路
grep -n "verifySkill\|recordVerify\|improve" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# IPC handler の verify 関連
grep -n "verify\|improve" apps/desktop/src/main/ipc/creatorHandlers.ts

# VerificationEngine テストの最新状態
grep -n "describe\|it(" apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts | head -20
```

| 判定           | 条件                              | 対応                           |
| -------------- | --------------------------------- | ------------------------------ |
| 未実装（想定） | `recordVerifyPass()` が存在しない | 新規実装として進行             |
| 部分実装       | メソッドは存在するがテスト未整備  | テスト追加・改善として進行     |
| 既実装         | メソッドもテストも存在する        | スコープ見直しをユーザーに確認 |

## 実行タスク

### Task 1: 現状の phase 遷移マッピング

WorkflowEngine (`SkillCreatorWorkflowEngine.ts`) の既存 phase transitions を網羅的に洗い出す:

- **既存遷移**: plan→review, review→execute/handoff, execute→verify, verify→review/improve, improve→execute
- `recordVerifyFailure()` の挙動を記録する（nextAction: `"improve"` | `"review"`）
- `recordVerifyPass()` が不在であることを問題として固定する
- `requestReverify()` (行421-444) の eligibility check を記録する:
  - execute phase ongoing → re-verify 禁止
  - terminal_handoff route → re-verify 禁止
  - no execute result → re-verify 禁止
  - last execution failed → re-verify 禁止
- 遷移テーブル（行579-580付近）の `verify: ["review", "improve"]` と `improve: ["execute"]` を記録する

### Task 2: 欠損遷移の特定

- verify 成功時 → 次 phase（complete 等）が未定義であることを確定する
- improve 完了時 → verify（re-verify）への直接遷移が存在しないことを確定する
- improve→execute→verify の間接経路が存在するが、verify を経由するのに execute を再実行する冗長性を記録する
- `SkillCreatorVerifyResult` の status `"pass"` に対応するハンドラが不在であることを確定する

### Task 3: 受入条件の確定

| AC   | 条件                                                                        | 検証方法       |
| ---- | --------------------------------------------------------------------------- | -------------- |
| AC-1 | `recordVerifyPass(planId, checks)` が WorkflowEngine に実装されている       | ユニットテスト |
| AC-2 | `recordVerifyFailure()` で verify→improve 遷移が正しく動作する（既存確認）  | ユニットテスト |
| AC-3 | improve→verify (re-verify) phase 遷移が追加され動作する                     | ユニットテスト |
| AC-4 | execute→verify(fail)→improve→verify(pass) の完全サイクルが1テストで検証可能 | 統合テスト     |
| AC-5 | UI snapshot が verify の pass/fail/pending 状態を正しく反映する             | 手動テスト     |
| AC-6 | `requestReverify()` が VerificationEngine 結果を受けて re-verify を発行する | ユニットテスト |

### Task 4: スコープ境界

- **含む**: 閉ループの phase 遷移修復、`recordVerifyPass()` 実装、improve→verify 遷移追加、IPC handler 更新、UI snapshot 連携
- **含まない**: verify engine 本体（P0-01 完了済み）、manifest 配置（P0-03/04）、WorkflowEngine の全面再設計、Layer 3/4 検証ロジック

## 参照資料

| 資料名             | パス                                                                                    | 説明                           |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------ |
| WorkflowEngine     | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                  | 閉ループ欠損の本体             |
| RuntimeFacade      | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                   | Facade 経由の呼び出し元        |
| creatorHandlers    | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                          | IPC handler の verify 経路     |
| skillCreator types | `packages/shared/src/types/skillCreator.ts`                                             | SkillCreatorVerifyResult 型    |
| VerificationEngine | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`              | P0-01 で実装済みの検証エンジン |
| remediation pack   | `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md` | P0 監査元                      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Skill Creator Service仕様 | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SkillCreatorService、Facade injection パターンの仕様 |
| Agent IPC チャネル仕様    | `.agents/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                   | agent:execute、agent:verify 等の IPC チャネル定義    |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC修正時のインターフェース不整合防止チェックリスト  |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`              | パストラバーサル防止、コマンドインジェクション防止   |

## 統合テスト連携

- Phase 4 で完全サイクルテスト（execute→verify→improve→verify）のケースを定義する
- Phase 6 でエッジケース（二重verify、improve without fail）を追加する
- Phase 10 で AC-1〜AC-6 との対応表を再利用する

## 多角的チェック観点

| 観点           | 適用判断                                       | 確認内容                                       |
| -------------- | ---------------------------------------------- | ---------------------------------------------- |
| アーキテクチャ | state machine 設計変更のため適用               | 遷移テーブル変更が既存の状態管理と矛盾しないか |
| IPC通信        | creatorHandlers.ts への handler 追加のため適用 | IPC契約チェックリスト準拠                      |
| セキュリティ   | IPC handler 追加のため適用                     | sender検証、ホワイトリスト登録                 |

## 成果物

| 成果物     | パス                                         | 説明                                   |
| ---------- | -------------------------------------------- | -------------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 問題定義、欠損遷移、受入条件、スコープ |

## 完了条件

- [ ] P50チェックで対象ファイルの現在状態を確認した
- [ ] 現状の phase 遷移が網羅的にマッピングされている
- [ ] 欠損遷移が明確に特定されている（verify pass / improve→verify）
- [ ] AC-1〜AC-6 が検証可能な形で定義されている
- [ ] 含む / 含まないが明確である
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
