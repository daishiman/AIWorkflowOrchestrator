# task-imp-verify-improve-revert-loop-002 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| 機能名     | task-imp-verify-improve-revert-loop-002          |
| タスク名   | TASK-P0-02 verify→improve→re-verify 閉ループ実装 |
| 作成日     | 2026-03-30                                       |
| ステータス | 未実施                                           |
| 総Phase数  | 13                                               |
| Issue      | #1740                                            |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 未実施     |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 未実施     |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 未実施     |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 未実施     |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 未実施     |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 未実施     |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 未実施     |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 未実施     |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 未実施     |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 未実施     |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 未実施     |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 未実施     |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未実施     |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## タスク概要

### 背景

TASK-P0-01 で `SkillCreatorVerificationEngine`（Layer 1/2）が実装されたが、verify 結果を受けて自動的に improve → re-verify を実行する閉ループが存在しない。現状はユーザーが手動で各ステップを呼び出す必要がある。

### 目的

verify 失敗時に自動的に improve フェーズへ移行し、改善後に re-verify を実行する「閉ループ」を実装する。

### 主要変更

1. `SkillCreatorWorkflowEngine.recordVerifyPass()` の実装
2. `SkillCreatorWorkflowEngine.recordImproveAttempt()` の実装
3. verify → improve → re-verify の自動状態遷移
4. `maxImproveRetry` による無限ループ防止
5. `RuntimeSkillCreatorFacade.verifyAndImproveLoop()` へのパイプラインエントリーポイント追加

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json / outputs/artifacts.json 同期**: `complete-phase.js` でPhase完了ステータスを更新し、必要に応じて `index.md` と `phase-*.md` の成果物名も一致させる
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/task-imp-verify-improve-revert-loop-002 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                   |
| ----- | ---------------------------- |
| 1     | phase-1-requirements.md      |
| 2     | phase-2-design.md            |
| 3     | phase-3-design-review.md     |
| 4     | phase-4-test-creation.md     |
| 5     | phase-5-implementation.md    |
| 6     | phase-6-test-expansion.md    |
| 7     | phase-7-coverage-check.md    |
| 8     | phase-8-refactoring.md       |
| 9     | phase-9-quality-assurance.md |
| 10    | phase-10-final-review.md     |
| 11    | phase-11-manual-test.md      |
| 12    | phase-12-documentation.md    |
| 13    | phase-13-pr-creation.md      |
