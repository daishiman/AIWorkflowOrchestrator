# Phase 9: 品質保証

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 9                         |
| 機能名     | task-rt-05-test-rerun-ac4 |
| 前提Phase  | Phase 7                   |
| 後続Phase  | Phase 10                  |
| ステータス | 未実施                    |
| 作成日     | 2026-03-31                |

## 目的

クリーンな環境（Phase 5 完了後）で Engine テストと Renderer テストを実行し、AC-1〜AC-3 の PASS/FAIL を記録する。本 Phase がこのタスクの中核であり、全 AC の根拠となる品質保証証跡を作成する。

## 実行タスク

### タスク1: Engine テスト実行

**目的**: `SkillCreatorWorkflowEngine.test.ts` を実行し AC-1 を確認する

**実行コマンド**:

```bash
cd apps/desktop && pnpm exec vitest run \
  src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  --reporter=verbose 2>&1 | tee /tmp/engine-test-result.txt
```

**記録事項**:

- テスト件数（PASS / FAIL）
- 実行日時
- 実行環境（Node.js バージョン、pnpm バージョン）
- エラーメッセージ（FAIL の場合）

**PASS 条件**: 4 件以上 PASS

### タスク2: Renderer テスト実行

**目的**: `SkillLifecyclePanel.llm-generation.test.tsx` を実行し AC-2 を確認する

**実行コマンド**:

```bash
cd apps/desktop && pnpm exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  --reporter=verbose 2>&1 | tee /tmp/renderer-test-result.txt
```

**PASS 条件**: 5 件以上 PASS

**実行ルール**: renderer テストは `apps/desktop` 起点で実行する。repo root 実行は setupFiles 解決ずれによる false negative を生むため、品質保証の正本証跡に使わない。

### タスク3: AC-3 回帰確認（テスト実行中に確認）

**目的**: 既存 4 kind のテスト結果から AC-3（非破壊）を確認する

既存 4 kind（single_select / free_text / secret / confirm）のテストが PASS していれば AC-3 は充足される。
Phase 9 の品質保証結果でこれらの種別のテストが PASS していることを記録する。

### タスク4: 静的解析実行

**目的**: コードの品質が維持されていることを確認する

```bash
# TypeScript 型チェック
pnpm typecheck

# ESLint
pnpm lint
```

## 参照資料

| 資料名             | パス                                                                                               | 内容               |
| ------------------ | -------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 2 設計       | `phase-2-design.md`                                                                                | テスト実行計画     |
| Phase 7 カバレッジ | `phase-7-coverage-check.md`                                                                        | AC-coverage matrix |
| Engine テスト      | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`              | 実行対象           |
| Renderer テスト    | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 実行対象           |

## 成果物

| 成果物       | パス                                | 内容                            |
| ------------ | ----------------------------------- | ------------------------------- |
| 品質保証仕様 | `phase-9-quality-assurance.md`      | 実行コマンドと記録事項          |
| テスト結果   | `outputs/phase-9/test-results.md`   | Engine・Renderer の実行結果詳細 |
| 品質レポート | `outputs/phase-9/quality-report.md` | AC-1〜AC-3 の PASS/FAIL 判定    |

## 統合テスト連携

- Phase 10 でこの品質レポートを基に TASK-RT-05 の最終レビューを更新する
- Phase 12 の documentation-changelog にこのテスト結果サマリーを記録する

## 完了条件

- [ ] Engine テスト 4 件以上 PASS（AC-1 充足）
- [ ] Renderer テスト 5 件以上 PASS（AC-2 充足）
- [ ] 既存 4 kind の回帰テスト PASS（AC-3 充足）
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS または既知警告として記録
- [ ] `outputs/phase-9/test-results.md` にテスト結果が記録されている
- [ ] `outputs/phase-9/quality-report.md` に PASS 判定が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- `outputs/phase-9/test-results.md` を作成し、Engine・Renderer の実行結果を記録する
- `outputs/phase-9/quality-report.md` を作成し、AC-1〜AC-3 の PASS/FAIL と typecheck/lint の結果を記録する
- `artifacts.json` の Phase 9 ステータスを `completed` に更新する
