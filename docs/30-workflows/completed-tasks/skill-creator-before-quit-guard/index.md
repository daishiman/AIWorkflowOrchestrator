# TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| タスクID   | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001                        |
| 機能名     | skill-creator-before-quit-guard                                 |
| 作成日     | 2026-04-03                                                      |
| ステータス | completed                                                       |
| 総Phase数  | 13                                                              |
| 親タスク   | TASK-FIX-EXECUTE-PLAN-FF-001                                    |
| 関連Issue  | https://github.com/daishiman/AIWorkflowOrchestrator/issues/1839 |
| 優先度     | MEDIUM                                                          |

## 概要

Electron アプリ終了時にバックグラウンドで実行中のスキル生成を適切に処理する `before-quit` ガードの実装・検証タスク。

**重要**: 基本実装は TASK-NOTIFICATION-SERVICE-001 (commit `a564753bb`) で完了済み。
本タスクは **実装の検証・テスト補完・文書化** が主目的となる。

### 実装済み成果物（TASK-NOTIFICATION-SERVICE-001 より）

| ファイル                                                                                          | 状態        | 内容                             |
| ------------------------------------------------------------------------------------------------- | ----------- | -------------------------------- |
| `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                                                    | ✅ 実装済み | registerBeforeQuitGuard 関数     |
| `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts`                                     | ✅ 実装済み | TC-B-01〜TC-B-03                 |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | ✅ 実装済み | TC-F-04〜TC-F-08                 |
| `RuntimeSkillCreatorFacade.hasRunningExecution()`                                                 | ✅ 実装済み | activeExecutionCount > 0 判定    |
| `index.ts` での統合                                                                               | ✅ 実装済み | registerBeforeQuitGuard 呼び出し |

### 本タスクで対応する残課題

| 項目                                   | 優先度 | 詳細                                    |
| -------------------------------------- | ------ | --------------------------------------- |
| `beforeQuitGuard.test.ts` の追加テスト | HIGH   | response=0 / reject の2分岐が不足       |
| app.exit(0) 前クリーンアップの設計確認 | MEDIUM | ファイルシステム整合性リスクの文書化    |
| 未タスク文書チェックボックス更新       | HIGH   | 既存 unassigned-task doc が全未チェック |
| 手動テスト検証                         | MEDIUM | before-quit ダイアログの実動作確認      |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
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

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/skill-creator-before-quit-guard \
  --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------- |
| 1     | `outputs/phase-1/requirements-spec.md`                                                            |
| 2     | `outputs/phase-2/design-topology.md`                                                              |
| 3     | `outputs/phase-3/design-review-result.md`                                                         |
| 4     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` |
| 5     | 既存実装の検証確認（変更なし or 軽微な修正）                                                      |
| 6     | `outputs/phase-6/test-expansion-report.md`                                                        |
| 7     | `outputs/phase-7/coverage-report.md`                                                              |
| 8     | `outputs/phase-8/refactoring-log.md`                                                              |
| 9     | `outputs/phase-9/quality-report.md`                                                               |
| 10    | `outputs/phase-10/final-review-result.md`                                                         |
| 11    | `outputs/phase-11/manual-test-result.md`                                                          |
| 12    | `outputs/phase-12/implementation-guide.md` 他5点                                                  |
| 13    | GitHub PR（ユーザー承認後）                                                                       |
