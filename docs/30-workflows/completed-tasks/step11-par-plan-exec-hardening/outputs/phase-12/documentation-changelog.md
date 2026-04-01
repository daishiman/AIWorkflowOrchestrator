# Documentation Changelog

## Feature: step-11-par-task-plan-execution-hardening

### 変更日: 2026-04-01

---

## 変更ファイル一覧（実装コード）

| ファイル                                                                                  | 変更種別 | 内容                                                              |
| ----------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                           | 削除     | `AGENT_NAMES` 定数を削除（3 エントリ）                            |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     | 変更     | fallback path を `PLAN_RESOURCE_REQUESTS` ベースに変更 + コメント |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` | 追加     | T-P7-02 / T-P7-04 テスト追加                                      |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                      | 変更     | `approvedSkillSpec` semantics コメント追加（3 箇所）              |

## 同期した workflow 台帳

| ファイル                 | 変更種別 | 内容                                           |
| ------------------------ | -------- | ---------------------------------------------- |
| `artifacts.json`         | 変更     | phase 1-12 completed / phase 13 blocked に同期 |
| `outputs/artifacts.json` | 追加     | root `artifacts.json` の mirror を追加         |

## 変更ファイル一覧（outputs 成果物）

| ファイル                                                 | フェーズ | 内容                          |
| -------------------------------------------------------- | -------- | ----------------------------- |
| `outputs/phase-1/requirements-summary.md`                | Phase 1  | 要件サマリー                  |
| `outputs/phase-2/design-summary.md`                      | Phase 2  | 設計サマリー                  |
| `outputs/phase-3/design-review-result.md`                | Phase 3  | 設計レビュー結果              |
| `outputs/phase-4/test-plan.md`                           | Phase 4  | テスト計画                    |
| `outputs/phase-5/implementation-log.md`                  | Phase 5  | 実装ログ                      |
| `outputs/phase-6/test-expansion.md`                      | Phase 6  | テスト拡張                    |
| `outputs/phase-7/coverage-check.md`                      | Phase 7  | カバレッジ確認                |
| `outputs/phase-8/refactoring.md`                         | Phase 8  | リファクタリング記録          |
| `outputs/phase-9/quality-assurance.md`                   | Phase 9  | 品質保証                      |
| `outputs/phase-10/final-review.md`                       | Phase 10 | 最終レビュー                  |
| `outputs/phase-11/manual-test-result.md`                 | Phase 11 | 手動テスト結果（スキップ）    |
| `outputs/phase-12/implementation-guide.md`               | Phase 12 | 実装ガイド（Part 1 / Part 2） |
| `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 | system spec update no-op 判定 |
| `outputs/phase-12/documentation-changelog.md`            | Phase 12 | ドキュメント変更履歴          |
| `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 | 未タスク検出                  |
| `outputs/phase-12/skill-feedback-report.md`              | Phase 12 | スキルフィードバック          |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 | 準拠チェック                  |

---

## Validator 実測値

### RuntimeSkillCreatorFacade.plan.test.ts

```
pnpm vitest run RuntimeSkillCreatorFacade.plan.test.ts
→ 23/23 PASS（T-P7-02 / T-P7-04 含む）
```

| テストID   | 内容                                             | 結果 |
| ---------- | ------------------------------------------------ | ---- |
| T-P7-02    | reference エントリが agentSpecs に混入しない     | PASS |
| T-P7-04    | PLAN_RESOURCE_REQUESTS から正しい agent 名を導出 | PASS |
| (既存21件) | 既存テスト群（regression）                       | PASS |

### SkillLifecyclePanel.llm-generation.test.tsx

```
pnpm vitest run SkillLifecyclePanel.llm-generation.test.tsx
→ 35/35 PASS（act warning は出るが、assertion failure は 0 件）
```

| テストID | 内容                                                        | 結果 |
| -------- | ----------------------------------------------------------- | ---- |
| U-8b     | textarea 変更後も executePlan には approved snapshot が渡る | PASS |
| U-18b    | cancel → 再 plan で snapshot が差し替わる                   | PASS |
| U-19b    | 複数回 textarea 編集後も execute payload は固定             | PASS |
| U-20b    | cancel 後の clearGenerationState 呼び出し確認               | PASS |
| U-21     | execute 失敗後も approved snapshot が保持される             | PASS |

**注**: phase-5 implementation log の historical baseline は 33/35 PASS だったが、
今回の closeout rerun では 35/35 PASS を確認した。以前の 2 件の失敗は current run では再現していない。

### 型チェック

```
pnpm --filter @repo/desktop typecheck
→ エラーなし
```

---

## Current / Baseline の区別

| 項目                                  | Baseline（変更前）                                   | Current（変更後）                                      |
| ------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| `AGENT_NAMES` の存在                  | あり（3 エントリ、ハードコード）                     | なし（削除済み）                                       |
| fallback path の agent 名ソース       | `PLAN_PROMPT_CONSTANTS.AGENT_NAMES`                  | `PLAN_RESOURCE_REQUESTS.filter(r => r.kind==="agent")` |
| `approvedSkillSpec` semantics comment | なし                                                 | あり（3 箇所）                                         |
| ドリフトリスク                        | 高（AGENT_NAMES と PLAN_RESOURCE_REQUESTS が別管理） | なし（単一ソース）                                     |

---

## artifacts.json / outputs/artifacts.json との整合

`artifacts.json` と `outputs/artifacts.json` は同一内容で同期済み。
両方とも `status: "spec_created"` を維持しつつ、phase 1-12 を completed、phase 13 を blocked とした。
