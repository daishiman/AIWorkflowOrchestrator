# Phase 9: 品質検証 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目     | 値                       |
| -------- | ------------------------ |
| タスクID | TASK-10A-G               |
| Phase    | 9 - 品質検証             |
| 前Phase  | `phase-8-refactoring.md` |
| 次Phase  | Phase 10（最終レビュー） |

## 目的

typecheck / lint / targeted suite / wider regression を通し、差分が品質ゲートを満たすことを確認する。

## 現ワークツリー監査メモ（2026-03-09）

- `pnpm --filter @repo/desktop typecheck` は PASS。
- `pnpm exec vitest run ...` は `@rollup/rollup-darwin-x64` 欠落で起動失敗する環境がある。
- Phase 9 では **環境 blocker と product failure を分離** して記録する。

## 検証手順

### 1. preflight

```bash
node -e "require.resolve('@rollup/rollup-darwin-x64')"
```

### 2. 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### 3. targeted suite

```bash
cd apps/desktop && pnpm exec vitest run \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts \
  src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx \
  src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### 4. regression

```bash
cd apps/desktop && pnpm exec vitest run \
  src/renderer/components/skill/__tests__/ \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx \
  src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts
```

### 5. lint（実行対象にlint差分がある場合のみ）

```bash
pnpm --filter @repo/desktop lint
```

## 結果記録テンプレート

| 検証           | 結果 | 備考 |
| -------------- | ---- | ---- |
| preflight      | -    | -    |
| typecheck      | -    | -    |
| targeted suite | -    | -    |
| regression     | -    | -    |
| lint           | -    | -    |

## ゲート判定

| 判定    | 条件                                                                | 対応                                            |
| ------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| PASS    | preflight を含む全項目成功、または blocker を分離して品質実行が成功 | Phase 10 へ                                     |
| FAIL    | product failure                                                     | 原因修正後に再実行                              |
| BLOCKED | preflight 失敗かつ実行不可                                          | 環境 blocker として記録し、未タスク化要否を判定 |

## 完了条件

- [x] preflight 成否が記録されている
- [x] typecheck 結果が記録されている
- [x] targeted suite / regression の結果が記録されている
- [x] 環境 blocker と product failure が分離されている

## テンプレート準拠追補

## 実行タスク

- T1: preflight / typecheck / targeted suite / regression / lint を判定する
- T2: blocker と defect を分離して記録する
- T3: Phase 10 の最終レビューへ証跡を渡す

## 参照資料

| 参照資料       | パス                                                                        | 用途                         |
| -------------- | --------------------------------------------------------------------------- | ---------------------------- |
| 依存Phase 5    | `phase-5-implementation.md`                                                 | 実装差分の品質判定           |
| coverage       | `phase-7-coverage-check.md`                                                 | coverage 判定の引継ぎ        |
| リファクタ     | `phase-8-refactoring.md`                                                    | 最終差分確認                 |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | typecheck / lint / test 基準 |
| error-handling | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | blocker / defect の切り分け  |

## 実行手順

1. preflight で環境 blocker 有無を確認する
2. typecheck / targeted suite / regression / lint を順に実行する
3. blocker と defect を分離して Phase 10 に渡す

## 統合テスト連携

| 連携面         | 内容                                                         |
| -------------- | ------------------------------------------------------------ |
| targeted suite | G1 / G2 / G3 の対象 suite を同一一覧で再実行する             |
| regression     | skill/chat/store の横断回帰として集約する                    |
| Phase 10       | 最終レビューに preflight / typecheck / regression 結果を渡す |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                    |
| ------------------ | ---- | ------------------------------------------- |
| 品質               | ✅   | typecheck / test / lint の結果              |
| エラーハンドリング | ✅   | blocker と product failure の分離           |
| アーキテクチャ     | ✅   | direct IPC 再導入や Main IPC 横滑りがないか |
| 運用制約           | ✅   | no-commit / no-PR を維持しているか          |

## 成果物

| 成果物       | パス                           | 説明                               |
| ------------ | ------------------------------ | ---------------------------------- |
| 品質検証仕様 | `phase-9-quality-assurance.md` | quality gate、判定表、実行コマンド |

## サブタスク管理

1. preflight
2. typecheck
3. targeted suite / regression
4. blocker / defect 整理

## タスク100%実行確認

- [x] preflight / typecheck / regression 系を判定した
- [x] blocker と defect を分離記録した
- [x] Phase 10 に渡す品質証跡を揃えた

## 次のPhase

Phase 10（最終レビュー）
