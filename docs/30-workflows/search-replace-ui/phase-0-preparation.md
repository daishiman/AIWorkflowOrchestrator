# Phase 0: 準備作業（除外解除確認）

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| Phase      | 0                               |
| 機能名     | search-replace-ui               |
| タスクID   | task-imp-search-ui-001          |
| 関連Issue  | #366                            |
| 作成日     | 2026-02-04                      |
| 前提タスク | TASK-SEARCH-REPLACE-001（完了） |

## 目的

タスク指示書で記載されていたテスト除外設定の現在の状態を確認し、必要に応じて除外を解除する。

## 背景

タスク指示書（`docs/30-workflows/unassigned-task/task-search-replace-ui-implementation.md`）では、以下のテストファイルが除外されていると記載されていた：

- `src/features/search/__tests__/SearchPanel.test.tsx`
- `src/features/search/__tests__/WorkspaceSearchPanel.test.tsx`

**重要**: 調査の結果、現在の`tsconfig.json`と`vitest.config.ts`には**これらのファイル固有の除外設定は存在しない**。

## 現状確認

### tsconfig.json の状態

現在の除外設定（`apps/desktop/tsconfig.json`）:

| 除外パターン           | 目的                   |
| ---------------------- | ---------------------- |
| `src/**/*.test.ts`     | テストファイル全般     |
| `src/**/*.test.tsx`    | テストファイル全般     |
| `src/**/__tests__/**`  | テストディレクトリ全般 |
| `src/**/*.stories.tsx` | Storybookファイル      |

→ **検索パネルテスト固有の除外は存在しない**

### vitest.config.ts の状態

現在の除外設定:

| 除外パターン    | 目的         |
| --------------- | ------------ |
| `node_modules/` | 依存関係     |
| `out/`          | ビルド出力   |
| `dist/`         | 配布用ビルド |

→ **検索パネルテスト固有の除外は存在しない**

## 実行タスク

### Task 0-1: 現在のテスト実行状態の確認

既存の検索パネルテストが実行されることを確認する。

```bash
# 検索パネル関連テストの実行
pnpm --filter @repo/desktop test:run -- --testPathPattern="features/search"
```

### Task 0-2: テスト結果の記録

テスト実行結果を以下の形式で記録する。

| テストファイル                     | テスト数 | 結果          |
| ---------------------------------- | -------- | ------------- |
| SearchPanel.test.tsx               | TBD      | PASS/FAIL/ERR |
| WorkspaceSearchPanel.test.tsx      | TBD      | PASS/FAIL/ERR |
| useSearchStore.test.ts             | TBD      | PASS/FAIL/ERR |
| useSearchKeyboardShortcuts.test.ts | TBD      | PASS/FAIL/ERR |
| integration/\*.test.tsx            | TBD      | PASS/FAIL/ERR |

### Task 0-3: 除外設定の修正（必要な場合のみ）

テストが実行されない場合は、除外設定を修正する。

## 成果物

| 成果物           | パス                                    | 説明         |
| ---------------- | --------------------------------------- | ------------ |
| 準備完了レポート | `outputs/phase-0/preparation-report.md` | 除外確認結果 |

## 完了条件

- [ ] tsconfig.jsonの除外設定を確認した
- [ ] vitest.config.tsの除外設定を確認した
- [ ] 検索パネル関連テストが実行可能であることを確認した
- [ ] テスト実行結果を記録した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 1: 要件定義
