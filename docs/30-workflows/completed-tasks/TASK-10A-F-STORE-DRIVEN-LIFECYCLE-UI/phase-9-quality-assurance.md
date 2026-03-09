# Phase 9: 品質検証

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 9                                    |
| 機能名 | task-10a-f-store-driven-lifecycle-ui |
| 作成日 | 2026-03-09                           |

## 目的

lint / typecheck / 対象テスト / grep 監査を通し、TASK-10A-F の analysis/create 導線が健全であることを確認する。

## 実行タスク

- lint実行: ESLint を実行する
- typecheck実行: TypeScript 検証を実行する
- test実行: 対象テストを実行する
- grep監査: direct IPC grep を実行する

## 参照資料

| 資料名   | パス                                                                        | 説明           |
| -------- | --------------------------------------------------------------------------- | -------------- |
| Phase 5  | `phase-5-implementation.md`                                                 | 実装確認結果   |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準       |
| Phase 7  | `phase-7-coverage-check.md`                                                 | カバレッジ結果 |

## 実行手順

### ステップ1: 静的検証

```bash
cd apps/desktop && pnpm lint
cd apps/desktop && pnpm typecheck
```

### ステップ2: テスト実行

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx \
  src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx
```

### ステップ3: grep 監査

```bash
rg -n 'window\\.electronAPI\\.skill\\.(analyze|applyImprovements|autoImprove|create)' \
  apps/desktop/src/renderer/components/skill
```

## 統合テスト連携

- Phase 10 の最終レビューへ品質ゲート結果を渡す

## 多角的チェック観点

| 観点       | 確認内容                                              |
| ---------- | ----------------------------------------------------- |
| コード品質 | lint/typecheck が通るか                               |
| テスト品質 | hook/view/wizard が PASS するか                       |
| スコープ   | import dialog / editor 由来の警告を誤混入していないか |

## 成果物

| 成果物       | パス                                                                                                                    | 説明       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| 品質検証結果 | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-9/quality-verification-result.md` | ゲート結果 |

## 完了条件

- [ ] lint / typecheck / test / grep の4ゲートが定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. lint
2. typecheck
3. tests
4. grep
5. 完了条件確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 10: 最終レビューゲート
