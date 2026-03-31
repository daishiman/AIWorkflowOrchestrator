# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 4                                                |
| Phase名    | テスト作成                                       |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 3: 設計レビュー                            |
| 次Phase    | Phase 5: 実装                                    |
| ステータス | pending                                          |
| 作成日     | 2026-03-29                                       |
| 更新日     | 2026-03-30                                       |

## 目的

閉ループの全遷移パスを先にテストとして定義し、fail-first で実装の正しさを検証できるようにする。

## 実行タスク

### Task 1: recordVerifyPass() ユニットテスト

- **テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`
- verify phase で `recordVerifyPass()` を呼ぶと正しい phase に遷移する
- verify phase 以外で `recordVerifyPass()` を呼ぶとエラーになる
- `SkillCreatorVerifyResult` の status: "pass" が正しく処理される

### Task 2: 完全サイクルテスト

- execute → verify(fail) → improve → verify(pass) の一連フローをテストする
- 各遷移で phase が正しく変わることを assert する
- verify(fail) 後の nextAction が "improve" であることを確認する
- re-verify 後の verify(pass) で最終状態に到達することを確認する

**テスト関数シグネチャ（推奨構造）**:

```typescript
describe("verify→improve→re-verify closed loop", () => {
  it("should complete full cycle: execute→verify(fail)→improve→verify(pass)", () => {});
  it("should transition verify→complete on pass", () => {});
  it("should transition improve→verify for re-verify", () => {});
});
```

### Task 3: エッジケーステスト

- 二重 verify: verify pass 後に再度 verify を呼ぶとエラーになる
- improve without fail: verify fail を経ずに improve に遷移しようとするとエラーになる
- re-verify eligibility: `requestReverify()` の disabled conditions が正しく機能する
  - execute phase ongoing → re-verify 禁止
  - terminal_handoff route → re-verify 禁止
  - no execute result → re-verify 禁止
  - last execution failed → re-verify 禁止

### Task 4: UI snapshot テスト

- verify pending 時の snapshot 形状を定義する
- verify pass 時の snapshot 形状を定義する
- verify fail 時の snapshot 形状を定義する
- improve 中の snapshot 形状を定義する
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
| Skill Creator Service仕様 | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SkillCreatorService、Facade injection パターンの仕様 |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC修正時のインターフェース不整合防止チェックリスト  |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`              | セキュリティパターン                                 |

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

- [ ] `recordVerifyPass()` のテストが定義されている
- [ ] 完全サイクル (execute→verify→improve→verify) のテストが定義されている
- [ ] エッジケース（二重 verify、improve without fail）が定義されている
- [ ] UI snapshot の期待形状が定義されている
- [ ] AC-1〜AC-6 とテストが対応している
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
