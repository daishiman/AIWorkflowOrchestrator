# Phase 6 テスト拡充レポート

## カバレッジ計測結果（Phase 5 実装後）

### 実行コマンド

```bash
cd packages/shared && pnpm vitest run --coverage src/types/
```

### 全体カバレッジ

- Statements: \_\_\_%
- Branches: \_\_\_%
- Functions: \_\_\_%
- Lines: \_\_\_%

### ファイル別カバレッジ

| ファイル                      | Lines | Branches | Functions | 判定 |
| ----------------------------- | ----- | -------- | --------- | ---- |
| `src/types/auth.ts`           | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/api-keys.ts`       | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/common.ts`         | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/workflow.ts`       | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/file-selection.ts` | \_\_% | \_\_%    | \_\_%     | ⬜   |
| `src/types/index.ts`          | \_\_% | \_\_%    | \_\_%     | ⬜   |

## 追加テスト一覧

### エッジケーステスト（4 テスト）

- E-01: index.ts が旧 types/ を参照していないこと
- E-02: re-export 名前衝突なし
- E-03: 循環参照なし
- E-04: auth.ts と auth-mode.ts の名前衝突なし

### 回帰テスト（6 テスト）

- R-01〜R-06: 旧パス残存チェック、ディレクトリ削除確認

### ビルド成果物追加テスト（5 テスト）

- D-15〜D-19: .d.mts / .d.ts 生成確認

### re-export 整合性テスト（3 テスト）

- M-06〜M-08: index からの re-export 検証

## テスト拡充後のカバレッジ

- Statements: \_\_\_%
- Branches: \_\_\_%
- Functions: \_\_\_%
- Lines: \_\_\_%

## 判定

（Phase 6 実行後に記入）
