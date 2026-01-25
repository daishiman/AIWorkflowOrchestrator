# Phase 7: カバレッジレポート

## Overview

Phase 6で拡充されたテスト（329テスト）に対するカバレッジ測定結果。

## 測定コマンド

```bash
pnpm exec vitest run --coverage \
  --coverage.include='src/renderer/features/workspace-chat-edit/**/*.{ts,tsx}' \
  --coverage.exclude='**/__tests__/**' \
  --coverage.exclude='**/*.test.*' \
  "src/renderer/features/workspace-chat-edit"
```

## テスト実行結果

```
Test Files  16 passed (16)
Tests       329 passed (329)
Duration    17.32s
```

## カバレッジ測定結果

### 全体カバレッジ（workspace-chat-edit フィーチャー）

| 指標       | 達成値 | 目標値 | 判定 |
| ---------- | ------ | ------ | ---- |
| Statements | 66.40% | 80%    | ❌   |
| Branch     | 84.67% | 60%    | ✅   |
| Functions  | 79.62% | 80%    | ❌   |
| Lines      | 66.40% | 80%    | ❌   |

### ファイル別カバレッジ詳細

#### components/ ディレクトリ（UIコンポーネント）

| ファイル                | % Stmts   | % Branch  | % Funcs | % Lines   | 未カバー行            |
| ----------------------- | --------- | --------- | ------- | --------- | --------------------- |
| ApplyControls.tsx       | 100       | 100       | 100     | 100       | -                     |
| DiffEditor.tsx          | 100       | 100       | 100     | 100       | -                     |
| DiffPreview.tsx         | 96.62     | 73.33     | 100     | 96.62     | 145-146,148-150       |
| EditCommandInput.tsx    | 100       | 91.30     | 100     | 100       | 84,174 (branch未到達) |
| FileContextBadge.tsx    | 100       | 100       | 100     | 100       | -                     |
| FileContextDropZone.tsx | 91.15     | 66.66     | 80      | 91.15     | 89-90,96-97,109       |
| index.ts                | 0         | 0         | 0       | 0         | 1-21 (re-export)      |
| **合計**                | **94.93** | **84.21** | **92**  | **94.93** | -                     |

#### hooks/ ディレクトリ

| ファイル          | % Stmts  | % Branch | % Funcs | % Lines  | 未カバー行     |
| ----------------- | -------- | -------- | ------- | -------- | -------------- |
| index.ts          | 100      | 100      | 100     | 100      | -              |
| useDiffApply.ts   | 2.74     | 100      | 0       | 2.74     | 40-175,183-294 |
| useFileContext.ts | 2.98     | 100      | 0       | 2.98     | 72-74,82-267   |
| **合計**          | **3.15** | **100**  | **0**   | **3.15** | -              |

#### store/ ディレクトリ

| ファイル         | % Stmts   | % Branch  | % Funcs   | % Lines   | 未カバー行        |
| ---------------- | --------- | --------- | --------- | --------- | ----------------- |
| chatEditSlice.ts | 68.80     | 90        | 90.90     | 68.80     | 38-47,121,175-251 |
| index.ts         | 0         | 0         | 0         | 0         | 1-6 (re-export)   |
| **合計**         | **66.96** | **87.80** | **86.95** | **66.96** | -                 |

#### types/ ディレクトリ

| ファイル | % Stmts | % Branch | % Funcs | % Lines | 未カバー行 |
| -------- | ------- | -------- | ------- | ------- | ---------- |
| index.ts | 100     | 100      | 100     | 100     | -          |

#### その他

| ファイル | % Stmts | % Branch | % Funcs | % Lines | 未カバー行       |
| -------- | ------- | -------- | ------- | ------- | ---------------- |
| index.ts | 0       | 0        | 0       | 0       | 1-15 (re-export) |

## 測定日時

2026-01-24

## 次のステップ

→ `outputs/phase-7/coverage-analysis.md` でカバレッジ分析を実施
