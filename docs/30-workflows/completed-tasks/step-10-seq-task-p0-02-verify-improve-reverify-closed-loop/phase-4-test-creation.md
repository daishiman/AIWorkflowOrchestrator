# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 4                                                |
| Phase名    | テスト作成                                       |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 3: 設計レビュー                            |
| 次Phase    | Phase 5: 実装                                    |
| ステータス | completed                                        |
| 作成日     | 2026-03-29                                       |
| 更新日     | 2026-03-30                                       |

## 目的

閉ループの全遷移パスを先にテストとして定義し、fail-first で実装の正しさを検証できるようにする。

## 実行タスク

### Task 1: recordVerifyPass() ユニットテスト

- **テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`
- verify phase で `recordVerifyPass()` を呼ぶと `verifyResult.status = "pass"` と `nextAction = "handoff"` が記録され、既存の `verify -> review` edge が使われる
- verify phase 以外で `recordVerifyPass()` を呼ぶとエラーになる
- `SkillCreatorVerifyResult` の status: "pass" が正しく処理される

### Task 2: 完全サイクルテスト

- execute → verify(fail) → improve → verify(pass) の一連フローをテストする
- 各遷移で phase が正しく変わることを assert する
- verify(fail) 後の nextAction が "improve" であることを確認する
- re-verify 後の verify(pass) で review へ戻り、pass 状態が維持されることを確認する

**テスト関数シグネチャ（推奨構造）**:

```typescript
describe("verify→improve→re-verify closed loop", () => {
  it("should complete full cycle: execute→verify(fail)→improve→verify(pass)", () => {});
  it("should transition verify→review on pass", () => {});
  it("should transition improve→verify for re-verify", () => {});
});
```

### Task 3: エッジケーステスト

- 二重 verify: verify pass 後に再度 verify を呼ぶとエラーになる
- improve without fail: verify fail を経ずに improve に遷移しようとするとエラーになる
- re-verify eligibility: `requestReverify()` の disabled conditions が正しく機能する
  - current phase が improve 以外 → re-verify 禁止
  - execute phase ongoing → re-verify 禁止
  - terminal_handoff route → re-verify 禁止
  - no execute result → re-verify 禁止
  - last execution failed → re-verify 禁止

### Task 4: UI snapshot テスト

- verify pending / pass / fail の `verifyResult` を snapshot から観測する
- improve 中の snapshot 形状は `currentPhase` と `verifyResult.nextAction` で観測する
- `RuntimeSkillCreatorVerifyDetail.checks` は detail surface 側で観測し、snapshot に新規フィールドを増やさない
- **参照**: `RuntimeSkillCreatorFacade.test.ts` の既存 snapshot テストパターンと整合させる

## 参照資料

| 資料名         | パス                                                                   | 説明               |
| -------------- | ---------------------------------------------------------------------- | ------------------ |
| 設計レビュー   | `phase-3-design-review.md`                                             | gate 結果          |
| 設計成果物     | `outputs/phase-2/design-document.md`                                   | 遷移テーブルと設計 |
| WorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | テスト対象         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Skill Creator Service仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SkillCreatorService、Facade injection パターンの仕様 |
| IPC契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC修正時のインターフェース不整合防止チェックリスト  |
| スキル実行IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`              | セキュリティパターン                                 |

## 多角的チェック観点

| 観点               | 適用判断                                       | 確認内容                                     |
| ------------------ | ---------------------------------------------- | -------------------------------------------- |
| アーキテクチャ     | state machine 設計変更のため適用               | 遷移テーブル変更が既存パターンと一致すること |
| IPC通信            | creatorHandlers.ts への handler 追加のため適用 | IPC契約チェックリスト準拠                    |
| エラーハンドリング | verify 失敗時の improve 遷移のため適用         | graceful degradation の維持                  |

## 統合テスト連携

- Phase 10 の最終レビューで AC-1〜AC-6 との対応表を再利用する
- 完全サイクルテストを Phase 6 で境界条件追加の起点にする

## 成果物

| 成果物       | パス                                     | 説明                                            |
| ------------ | ---------------------------------------- | ----------------------------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specifications.md` | 正常系・完全サイクル・エッジケース・UI snapshot |

## 完了条件

- [x] `recordVerifyPass()` のテストが定義されている
- [x] 完全サイクル (execute→verify→improve→verify) のテストが定義されている
- [x] エッジケース（二重 verify、improve without fail）が定義されている
- [x] UI snapshot の観測ポイントが `verifyResult` ベースで定義されている
- [x] AC-1〜AC-6 とテストが対応している
- [x] aiworkflow-requirements の関連仕様を確認した
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
