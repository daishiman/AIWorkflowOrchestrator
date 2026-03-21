# 02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE - タスク実行仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| 機能名     | 02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE |
| 作成日     | 2026-03-21                               |
| ステータス | Phase 12 完了（PR未着手）                |
| 総Phase数  | 13                                       |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了       |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了       |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 完了       |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了       |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了       |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了       |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了       |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了       |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了       |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 完了       |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了       |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了       |
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
  --workflow docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | phase-1-requirements.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2     | phase-2-design.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 3     | phase-3-design-review.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 4     | apps/desktop/src/renderer/views/ChatView/**tests**/LLMGuidanceBanner.test.tsx, apps/desktop/src/renderer/views/ChatView/**tests**/ChatView.guidance.test.tsx, apps/desktop/src/renderer/views/WorkspaceView/**tests**/WorkspaceChatPanel.guidance.test.tsx                                                                                                                                                                                                                                                                                                                                         |
| 5     | apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx, apps/desktop/src/renderer/views/ChatView/index.tsx, apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx                                                                                                                                                                                                                                                                                                                                                                                                           |
| 6     | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 7     | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 8     | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 9     | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 10    | phase-10-final-review.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 11    | phase-11-manual-test.md, outputs/phase-11/README.md, outputs/phase-11/manual-test-checklist.md, outputs/phase-11/manual-test-result.md, outputs/phase-11/discovered-issues.md, outputs/phase-11/screenshot-plan.json, outputs/phase-11/screenshots/TC-11-01-chatview-inline-guidance-light.png, outputs/phase-11/screenshots/TC-11-02-workspace-guidance-blocked-light.png, outputs/phase-11/screenshots/TC-11-03-chatview-inline-guidance-dark.png, outputs/phase-11/screenshots/TC-11-04-chatview-inline-guidance-keyboard-focus.png, outputs/phase-11/screenshots/phase11-capture-metadata.json |
| 12    | outputs/phase-12/README.md, outputs/phase-12/implementation-guide.md, outputs/phase-12/documentation-changelog.md, outputs/phase-12/unassigned-task-detection.md, outputs/phase-12/skill-feedback-report.md, outputs/phase-12/system-spec-update-summary.md, outputs/phase-12/phase12-task-spec-compliance-check.md, component-documentation.md                                                                                                                                                                                                                                                    |
| 13    | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

---

_このファイルは `generate-index.js` によって自動生成されました。_
_最終更新: 2026-03-21T00:53:48.236Z_
