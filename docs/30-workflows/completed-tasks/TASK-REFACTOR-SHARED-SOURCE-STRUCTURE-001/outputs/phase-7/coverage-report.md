# Phase 7 カバレッジ検証

## 基準

- Lines >= 80%
- Branches >= 60%
- Functions >= 80%

## 実行コマンド

```bash
cd packages/shared && pnpm vitest run --coverage src/types/
```

## 実測

- Lines: \_\_\_% ⬜
- Branches: \_\_\_% ⬜
- Functions: \_\_\_% ⬜

## ファイル別

| ファイル                      | Lines | Branches | Functions | 判定 |
| ----------------------------- | ----- | -------- | --------- | ---- |
| `src/types/auth.ts`           | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/api-keys.ts`       | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/common.ts`         | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/workflow.ts`       | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/file-selection.ts` | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/index.ts`          | \_\_% | \_\_%    | \_\_%     | ⬜   |

## テスト総数

- Phase 4 テスト: 26
- Phase 6 追加テスト: 17
- 合計: 43 テスト

## 未カバー主領域

（計測後に記入）

## リスク評価

（計測後に記入 — 型定義のみのファイルはカバレッジ対象外であることを考慮）

## 判定

（Phase 7 実行後に記入 — PASS / FAIL → Phase 6 戻り）
