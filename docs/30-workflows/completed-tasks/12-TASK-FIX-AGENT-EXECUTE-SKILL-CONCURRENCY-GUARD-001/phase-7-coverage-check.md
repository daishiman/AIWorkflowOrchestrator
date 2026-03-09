# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 7                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

Phase 5の実装とPhase 6の拡充テストに対して、カバレッジ基準（Line 80%以上、Branch 60%以上、Function 80%以上）の充足を確認する。未達の場合はPhase 6に戻る。

## 実行タスク

- カバレッジ計測: 修正対象ファイル（`agentSlice.ts` の `executeSkill` 関数）のカバレッジを計測
- 基準充足判定: プロジェクトのカバレッジ基準との照合
- 未達時のフィードバック: 不足箇所の特定とPhase 6への差戻し判断

## 参照資料

| 資料名                | パス                                                                                                                | 説明               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 品質基準              | `.claude/rules/02-code-quality.md`                                                                                  | カバレッジ基準定義 |
| Phase 6 テスト        | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-6-test-expansion.md` | 拡充テスト一覧     |
| 拡充テスト T-09〜T-12 | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts`                             | Phase 6 成果物     |

### 前提Phase成果物

| 資料名             | パス                                                                                                                | 用途                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 要件       | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-1-requirements.md`   | 受入基準 AC-01〜AC-06    |
| Phase 2 設計       | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-2-design.md`         | ガード設計詳細           |
| Phase 3 レビュー   | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-3-design-review.md`  | 設計レビュー結果（PASS） |
| Phase 4 テスト     | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-4-test-creation.md`  | テストケース T-01〜T-08  |
| Phase 5 実装       | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-5-implementation.md` | 実装詳細                 |
| Phase 6 テスト拡充 | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-6-test-expansion.md` | 追加テスト T-09〜T-12    |

## 実行手順

### ステップ1: カバレッジ計測

対象ファイルを明示して計測する:

```bash
cd apps/desktop && pnpm vitest run --coverage \
  --coverage.include='src/renderer/store/slices/agentSlice.ts' \
  --coverage.include='src/renderer/components/chat/ChatPanel.tsx' \
  --coverage.include='src/renderer/components/organisms/AgentView/ExecuteButton.tsx' \
  --coverage.include='src/renderer/views/AgentExecutionView/AgentExecutionView.tsx' \
  src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts \
  src/renderer/components/organisms/AgentView/__tests__/ExecuteButton.test.tsx \
  src/renderer/views/AgentExecutionView/__tests__/AgentExecutionView.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### ステップ2: カバレッジ基準の照合

| 指標              | 最低基準 | 推奨基準 | 実測値         | 判定 |
| ----------------- | -------- | -------- | -------------- | ---- |
| Line Coverage     | 80%      | 90%      | （計測後記入） | -    |
| Branch Coverage   | 60%      | 70%      | （計測後記入） | -    |
| Function Coverage | 80%      | 90%      | （計測後記入） | -    |

### ステップ3: 判定

- **全基準充足:** Phase 8（リファクタリング）へ進む
- **一部未達:** 不足箇所を特定し、Phase 6に戻ってテストを追加

### ステップ4: 特に確認すべきカバレッジ対象

| 対象コード箇所                                | 期待されるカバレッジ                                |
| --------------------------------------------- | --------------------------------------------------- |
| `if (isExecuting) return;` ガード（L742付近） | true/false両方のブランチが実行される                |
| `if (!selectedSkillName) return;`             | ガード前のreturnが実行される（T-11）                |
| authKey事前検証ブロック                       | 既存テスト（preflight.test.ts）で網羅済みであること |
| authKeyプリフライト後のガード分岐             | authKey未設定→error遷移パスが実行される             |
| `set({ isExecuting: true, ... })`             | 正常系で実行される（T-01）                          |
| エラーハンドリング（catch ブロック）          | T-09で実行される                                    |
| `ExecuteButton` の null render 分岐           | T-06 で `isExecuting=true` パスが実行される         |
| `AgentExecutionView` の入力 disabled 分岐     | T-07 で `isExecuting=true` パスが実行される         |
| `ChatPanel` の toggle disabled 分岐           | T-08 で `isExecuting` 連動が実行される              |

## 統合テスト連携（Phase 1〜11は必須）

- カバレッジ計測は修正対象コード（`executeSkill` 関数）と既存UIガード面の回帰に焦点を当てる
- agentSlice全体のカバレッジは参考値として確認する

## 成果物

| 成果物           | パス                                                                                                                | 説明           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | -------------- |
| カバレッジ確認書 | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-7-coverage-check.md` | 本ドキュメント |

## 完了条件

- [ ] カバレッジ計測が実行されている（対象: `agentSlice.ts`, `ChatPanel.tsx`, `ExecuteButton.tsx`, `AgentExecutionView.tsx`）
- [ ] Line Coverage 80%以上を達成している
- [ ] Branch Coverage 60%以上を達成している
- [ ] Function Coverage 80%以上を達成している
- [ ] `isExecuting` ガードの両ブランチ（true/false）がテストで実行されている
- [ ] authKeyプリフライト後のエラー遷移パスがカバーされている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング（カバレッジ基準充足の場合）
Phase 6: テスト拡充（カバレッジ基準未達の場合）
