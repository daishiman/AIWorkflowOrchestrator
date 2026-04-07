# Phase 9: QA

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 9                                                        |
| Phase名    | QA                                                       |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                               |
| 機能名     | SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 |
| 前提Phase  | Phase 8: リファクタリング                                |
| 次Phase    | Phase 10: 最終レビュー                                   |
| ステータス | pending                                                  |
| 作成日     | 2026-04-07                                               |

## 目的

実装・リファクタリング後の SkillLifecyclePanel を品質ゲート観点で総合検査し、Phase 10 最終レビューへの通過判定を行う。

## 実行タスク

### Task 1: 自動テスト全件実行

```bash
pnpm --filter @repo/desktop vitest run -- SkillLifecyclePanel

pnpm --filter @repo/desktop vitest run -- SkillLifecyclePanel --coverage
```

### Task 2: 型チェック

```bash
pnpm --filter @repo/desktop tsc --noEmit
```

### Task 3: Lint チェック

```bash
pnpm --filter @repo/desktop eslint apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### Task 4: 品質ゲートチェックリスト

| チェック項目                                    | 基準                  | 結果 |
| ----------------------------------------------- | --------------------- | ---- |
| 全テストがpass                                  | 0 failures            | -    |
| Statementsカバレッジ                            | 85%以上               | -    |
| Branchesカバレッジ                              | 80%以上               | -    |
| Functionsカバレッジ                             | 100%                  | -    |
| TypeScript型エラーなし                          | 0 errors              | -    |
| ESLintエラーなし                                | 0 errors              | -    |
| 削除済み要素（3種）の非存在確認                 | DOM に存在しない      | -    |
| `skill-lifecycle-open-wizard-button` の存在確認 | DOM に存在する        | -    |
| `onOpenSkillWizard` Props の型が正しい          | `() => void`          | -    |
| 呼び出し元で `onOpenSkillWizard` が渡されている | TypeScript エラーなし | -    |

### Task 5: 削除要素の最終確認

```bash
# 削除済み要素がソースコードに残っていないことを確認
rg -n "skill-lifecycle-request-input|skill-lifecycle-create-button|skill-lifecycle-prepare-button|handleCreate|handlePrepare" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
# 何も出力されないことを確認
```

### Task 6: 既存機能への影響確認

```bash
# SkillLifecyclePanel 以外のテストが影響を受けていないか確認
pnpm --filter @repo/desktop vitest run --reporter=verbose 2>&1 | rg -n "FAIL|ERROR" | head -20
```

### Task 7: QAレポートの作成

上記チェック結果をまとめた QA レポートを作成する。

## 参照資料

| 資料名               | パス                                                                                 | 説明         |
| -------------------- | ------------------------------------------------------------------------------------ | ------------ |
| 実装ファイル         | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                 | QA対象       |
| テストファイル       | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel*.test.tsx` | 検証基準     |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                                 | 参照値       |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                                                 | 変更内容確認 |

## 成果物

| 成果物     | パス                           | 説明                               |
| ---------- | ------------------------------ | ---------------------------------- |
| QAレポート | `outputs/phase-9/qa-report.md` | 品質ゲート結果・判定・指摘事項一覧 |

## 完了条件

- [ ] 全自動テストがpassしている
- [ ] カバレッジ目標値を達成している
- [ ] 型チェックが通過している
- [ ] Lintチェックが通過している
- [ ] 削除済み要素がソースコードに残存していない
- [ ] 既存機能への影響がないことが確認されている
- [ ] QAレポートが作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
