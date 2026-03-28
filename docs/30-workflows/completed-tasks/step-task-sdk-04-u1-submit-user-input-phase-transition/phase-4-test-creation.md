# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 4                                                   |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

AC-1〜AC-7 を engine / IPC の両面から固定するテスト計画を作る。

## 実行タスク

- engine test ケース設計
- IPC runtime テストケース設計
- 既存 regression 観点の維持確認

## 参照資料

| 資料名               | パス                               | 説明             |
| -------------------- | ---------------------------------- | ---------------- |
| phase 1 requirements | `outputs/phase-1/requirements.md`  | AC               |
| phase 2 design       | `outputs/phase-2/design.md`        | 実装前提         |
| gate decision        | `outputs/phase-3/gate-decision.md` | 実装開始条件     |
| test plan            | `outputs/phase-4/test-plan.md`     | 具体テストケース |

## 実行手順

### ステップ1: AC ごとのテスト責務を割り当てる

engine 単体で固定すべきものと IPC runtime で固定すべきものを分ける。

### ステップ2: 既存 regression を同居させる

`awaitingUserInput` クリア、stale requestId rejection を新規ケースと同じ matrix に含める。

## 統合テスト連携

- `SkillCreatorWorkflowEngine.test.ts` と `skillCreatorHandlers.runtime.test.ts` の両方を対象にする

## 成果物

| 成果物     | パス                           | 説明      |
| ---------- | ------------------------------ | --------- |
| テスト計画 | `outputs/phase-4/test-plan.md` | AC 対応表 |

## 完了条件

- [ ] AC-1〜AC-7 のテスト責務が定義されている
- [ ] engine と IPC の分担が明記されている
- [ ] 既存 regression が test plan に含まれている
- [ ] 本Phase内の全タスクを100%実行完了
