# Phase 9: 品質保証

## メタ情報

| 項目      | 内容                        |
| --------- | --------------------------- |
| Phase     | 9                           |
| 名称      | 品質保証                    |
| 前提Phase | Phase 8（リファクタリング） |
| 次Phase   | Phase 10（最終レビュー）    |
| 作成日    | 2026-04-03                  |

## 目的

TypeScript 型チェック、ESLint、テスト実行、ミラー同期を一括で検証し、品質基準を満たしていることを確認する。

## 実行タスク

### Task 9-1: 型チェック

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

基準: エラー 0件

### Task 9-2: Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

基準: エラー 0件、warning は許容（既存分のみ）

### Task 9-3: テスト実行

```bash
pnpm --filter @repo/desktop vitest run \
  apps/desktop/src/renderer/components/skill/__tests__/VerifyResultDetailPanel.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/ImproveResultDetailPanel.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/PlanResultDetailPanel.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/ExecuteResultDetailPanel.test.tsx
```

基準: 全テスト PASS（新規 40件［Verify 25 + Improve 15］ + 既存全件）

### Task 9-4: TECH-M-01 解決確認

Phase 3 で記録した MINOR 指摘の解決を確認:

| MINOR ID  | 指摘内容                                           | 解決確認                 |
| --------- | -------------------------------------------------- | ------------------------ |
| TECH-M-01 | Diff 風カラーリングは CSS 変数ベースに統一すること | Phase 5 で解決済みか確認 |

## 成果物

| 成果物           | 配置先                              |
| ---------------- | ----------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` |

## 完了条件

- [ ] TypeScript 型チェックがエラー 0件
- [ ] ESLint がエラー 0件
- [ ] 全テストが PASS
- [ ] TECH-M-01 が解決されている

## タスク100%実行確認【必須】

- [ ] Task 9-1: 型チェック
- [ ] Task 9-2: Lint チェック
- [ ] Task 9-3: テスト実行
- [ ] Task 9-4: TECH-M-01 解決確認

## 次Phase

Phase 10（最終レビュー）へ進む。
