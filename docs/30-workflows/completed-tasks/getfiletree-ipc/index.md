# getfiletree-ipc - タスク実行仕様書

## メタ情報

| 項目       | 内容            |
| ---------- | --------------- |
| 機能名     | getfiletree-ipc |
| 作成日     | 2026-03-03      |
| ステータス | spec_created    |
| 総Phase数  | 13              |

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

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/getfiletree-ipc --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | outputs/phase-1/requirements.md                                                                                                                                                                                                                                 |
| 2     | outputs/phase-2/design.md, outputs/phase-2/interface-design.md                                                                                                                                                                                                  |
| 3     | outputs/phase-3/design-review.md                                                                                                                                                                                                                                |
| 4     | outputs/phase-4/test-design.md, outputs/phase-4/test-cases.md                                                                                                                                                                                                   |
| 5     | outputs/phase-5/implementation-report.md                                                                                                                                                                                                                        |
| 6     | outputs/phase-6/test-enhancement-report.md                                                                                                                                                                                                                      |
| 7     | outputs/phase-7/coverage-report.md                                                                                                                                                                                                                              |
| 8     | outputs/phase-8/refactoring-report.md                                                                                                                                                                                                                           |
| 9     | outputs/phase-9/quality-report.md                                                                                                                                                                                                                               |
| 10    | outputs/phase-10/functional-completeness.md, outputs/phase-10/security-review.md, outputs/phase-10/ipc-contract-review.md, outputs/phase-10/type-safety-review.md, outputs/phase-10/code-quality-review.md, outputs/phase-10/final-review-result.md             |
| 11    | outputs/phase-11/auto-test-result.md, outputs/phase-11/filetree-display-result.md, outputs/phase-11/error-case-result.md, outputs/phase-11/api-verification-result.md, outputs/phase-11/manual-test-report.md                                                   |
| 12    | outputs/phase-12/implementation-guide.md, outputs/phase-12/ipc-documentation.md, outputs/phase-12/spec-update-summary.md, outputs/phase-12/documentation-changelog.md, outputs/phase-12/unassigned-task-detection.md, outputs/phase-12/skill-feedback-report.md |
| 13    | outputs/phase-13/artifact-verification.md, outputs/phase-13/local-check-result.md, outputs/phase-13/completion-report.md                                                                                                                                        |

---

_このファイルは `generate-index.js` によって自動生成されました。_
_最終更新: 2026-03-03T02:59:13.475Z_
