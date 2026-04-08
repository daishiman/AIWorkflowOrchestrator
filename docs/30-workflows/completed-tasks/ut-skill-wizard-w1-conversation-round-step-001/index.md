# ut-skill-wizard-w1-conversation-round-step-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                |
| タスク名   | ConversationRoundStep.tsx 実装（Step 1: 会話ラリー質問 / wizard export 追加） |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001                                |
| 作成日     | 2026-04-08                                                                    |
| ステータス | completed（Phase 1-12 completed / Phase 13 blocked）                          |
| 総Phase数  | 13                                                                            |
| Wave       | W1                                                                            |
| Lane       | skill-wizard-redesign-lane                                                    |
| タスク種別 | NON_VISUAL（Renderer 内部実装のみ）                                           |

---

## 実行原則

- Phase 1-3 で `task-specification-creator` / `aiworkflow-requirements` 準拠検証と 30思考法レビューを並列化し、Phase 3 で結論を固定する
- Phase 11 は NON_VISUAL として扱い、スクリーンショット参照は不要
- Phase 13 は blocked のまま維持し、ユーザー承認があるまで commit / push / PR は行わない
- 仕様書は step-by-step で進めるが、独立部分は SubAgent に切り分けて並列実行する

## 実装スコープ

- 新規: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- 新規テスト: `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`
- 再利用: `apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx`
- 統合: `apps/desktop/src/renderer/components/skill/wizard/index.ts` への export 追加は本タスクの成果
- 参照外: `ConfigureStep.tsx` / `WizardOptions` の削除と `SkillCreateWizard.tsx` への接続は W2-seq-03a の担当

---

`ConversationRoundStep.tsx` を新規作成し、`wizard/index.ts` に export を追加する。
`ConfigureStep.tsx` / `WizardOptions` の削除や `SkillCreateWizard.tsx` への統合は、この workflow のスコープ外であり W2-seq-03a の担当とする。

## Phase一覧

| Phase | 名称                     | 仕様書                                                       | ステータス                  |
| ----- | ------------------------ | ------------------------------------------------------------ | --------------------------- |
| 1     | 要件定義                 | [phase-1-requirements.md](phase-1-requirements.md)           | completed                   |
| 2     | 設計                     | [phase-2-design.md](phase-2-design.md)                       | completed                   |
| 3     | 設計レビューゲート       | [phase-3-design-review.md](phase-3-design-review.md)         | completed                   |
| 4     | テスト作成               | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed                   |
| 5     | 実装                     | [phase-5-implementation.md](phase-5-implementation.md)       | completed                   |
| 6     | テスト拡充               | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed                   |
| 7     | テストカバレッジ確認     | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed                   |
| 8     | リファクタリング         | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed                   |
| 9     | 品質保証                 | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed                   |
| 10    | 最終レビューゲート       | [phase-10-final-review.md](phase-10-final-review.md)         | completed                   |
| 11    | 手動テスト（NON_VISUAL） | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed                   |
| 12    | ドキュメント更新         | [phase-12-documentation.md](phase-12-documentation.md)       | completed                   |
| 13    | PR作成                   | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | ユーザー指示待ち（blocked） |

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

## SubAgent 分担

| SubAgent | 責務                                                                    | 実行形態                         |
| -------- | ----------------------------------------------------------------------- | -------------------------------- |
| A        | `task-specification-creator` / `aiworkflow-requirements` 準拠差分の抽出 | Phase 1-3 で並列                 |
| B        | 30種の思考法による改善仮説・置換判断の整理                              | Phase 1-3 で並列                 |
| C        | Phase 4-12 の成果物整備と current fact 反映                             | Phase ごとに逐次、可能箇所は並列 |
| Lead     | Phase 3 / 10 / 12 のゲート統合と最終判定                                | フェーズ境界で直列               |

---

## 依存タスク

| タスクID   | 状態 | 内容                                                                   |
| ---------- | ---- | ---------------------------------------------------------------------- |
| W0-seq-01  | 完了 | 型定義（SkillInfoFormData 等）の実装                                   |
| W0-seq-02  | 完了 | `inferSmartDefaults()` の `@repo/shared` 公開                          |
| W1-par-02a | open | `SkillInfoStep.tsx`（Wave 1 並列・依存なし）                           |
| W1-par-02c | open | `CompleteStep.tsx`（Wave 1 並列・依存なし）                            |
| W2-seq-03a | open | `SkillCreateWizard.tsx` オーケストレーション（本タスク完了後に開始可） |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-skill-wizard-w1-conversation-round-step-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | outputs/phase-1/acceptance-criteria.md, outputs/phase-1/code-inventory.md, outputs/phase-1/scope-definition.md                                                                                                                                                                          |
| 2     | outputs/phase-2/design-decisions.md, outputs/phase-2/props-interface.md, outputs/phase-2/state-design.md                                                                                                                                                                                |
| 3     | outputs/phase-3/design-review-result.md, outputs/phase-3/minor-tracking.md                                                                                                                                                                                                              |
| 4     | outputs/phase-4/test-matrix.md, outputs/phase-4/red-confirmation.md                                                                                                                                                                                                                     |
| 5     | outputs/phase-5/implementation-result.md, outputs/phase-5/green-confirmation.md                                                                                                                                                                                                         |
| 6     | outputs/phase-6/test-expansion-result.md                                                                                                                                                                                                                                                |
| 7     | outputs/phase-7/coverage-result.md                                                                                                                                                                                                                                                      |
| 8     | outputs/phase-8/refactoring-result.md                                                                                                                                                                                                                                                   |
| 9     | outputs/phase-9/quality-check-result.md                                                                                                                                                                                                                                                 |
| 10    | outputs/phase-10/final-review-result.md, outputs/phase-10/ac-verification.md                                                                                                                                                                                                            |
| 11    | outputs/phase-11/manual-test-checklist.md, outputs/phase-11/manual-test-result.md, outputs/phase-11/discovered-issues.md                                                                                                                                                                |
| 12    | outputs/phase-12/implementation-guide.md, outputs/phase-12/system-spec-update-summary.md, outputs/phase-12/documentation-changelog.md, outputs/phase-12/unassigned-task-detection.md, outputs/phase-12/skill-feedback-report.md, outputs/phase-12/phase12-task-spec-compliance-check.md |
| 13    | outputs/phase-13/local-check-result.md, outputs/phase-13/change-summary.md, outputs/phase-13/pr-info.md, outputs/phase-13/pr-ready-report.md                                                                                                                                            |

---

_このファイルはタスク仕様書作成フロー（Issue #2013）に基づいて生成されました。_
_最終更新: 2026-04-08_
